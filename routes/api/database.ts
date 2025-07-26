import * as log from "@std/log";
import { Handlers } from "$fresh/server.ts";
import { InfraInstancePrice } from "../../types.ts";
import { getCurrencyRate } from "../../utils/db.ts";
import { FormParamsDatabase } from "../../types.ts";
import * as it from "../../utils/databaseTools.ts";

export const handler: Handlers = {
  POST: async (req) => {
    // Busca una configuración a partir de datos de entrada
    try {
      const body = await req.json();
      const params: FormParamsDatabase = {
        servers: body.highAvailability === "Y" ? 2 : 1,
        vCpus: Number(body.vCpus),
        memory: Number(body.memory),
        storage: Number(body.storage),
        backup: Number(body.backup),
        traffic: Number(body.traffic),
        hours: Number(body.hours),
        redundancy: body.redundancy,
        storageType: body.storageType,
        reservation: body.reservation,
        currency: body.currency,
        familyUse: body.familyUse,
        awsRegion: body.awsRegion,
        azrRegion: body.azrRegion,
        gcpRegion: body.gcpRegion,
        softwareEdition: body.softwareEdition,
        byol: body.byol,
        highAvailability: body.highAvailability,
      };
      log.info(
        `API POST database: ${params.servers}/${params.vCpus}/${params.memory}/${params.storage}`,
      );
      //obtiene la tasa de cambio de la moneda
      const rate = getCurrencyRate(params.currency ?? "USD");

      //buscamos las instancias válidas que cumplan con los requisitos de vCpu y Memoria
      const validInstances = await it.searchValidDatabaseInstances(
        params.vCpus,
        params.memory,
      );
      //filtramos las instancias que no tengan el uso de familia requerido
      const filteredInstances = validInstances.filter(
        (inst) =>
          params.familyUse === "ALL" ||
          params.familyUse === inst.familyUse.slice(0, 2),
      );
      //calculamos el precio del almacenamiento según el tipo de almacenamiento y cloud
      const storagePricesByCloud: Record<string, number> = {
        AWS: await it.calculateStoragePriceAws(params) * rate,
        AZR: await it.calculateStoragePriceAzr(params) * rate,
        GCP: await it.calculateStoragePriceGcp(params) * rate,
        OCI: await it.calculateStoragePriceOci(params) * rate,
      };
      //calculamos el precio del backup según el tipo de backup usado y cloud
      const backupPricesByCloud: Record<string, number> = {
        AWS: await it.calculateBackupPriceAws(params) * rate,
        AZR: await it.calculateBackupPriceAzr(params) * rate,
        GCP: await it.calculateBackupPriceGcp(params) * rate,
        OCI: await it.calculateBackupPriceOci(params) * rate,
      };
      //calculamos el precio del tráfico de salida de la cloud
      const trafficPricesByCloud: Record<string, number> = {
        AWS: await it.calculateTrafficPriceAws(params) * rate,
        AZR: await it.calculateTrafficPriceAzr(params) * rate,
        GCP: await it.calculateTrafficPriceGcp(params) * rate,
        OCI: await it.calculateTrafficPriceOci(params) * rate,
      };
      //generamos los precios finales de las instancias reutilizando los datos anteriores
      const calculatedPrices: InfraInstancePrice[] = await Promise.all(
        filteredInstances.map(async (inst) => {
          const iPrice = await it.calculateDatabasePrice(inst, params) * rate;
          const sPrice = storagePricesByCloud[inst.cloud] ?? 0;
          const bPrice = backupPricesByCloud[inst.cloud] ?? 0;
          const tPrice = trafficPricesByCloud[inst.cloud] ?? 0;
          return {
            cloud: inst.cloud,
            familyName: inst.familyName,
            familyUse: inst.familyUse,
            instanceName: inst.instanceName,
            servers: params.servers,
            vCpus: Math.max(params.vCpus, inst.vCpuMin),
            memory: Math.max(params.memory, inst.memoryMin),
            storageType: params.storageType,
            storage: params.storage,
            backup: params.backup,
            traffic: params.traffic,
            infraPrice: iPrice,
            storagePrice: sPrice,
            backupPrice: bPrice,
            trafficPrice: tPrice,
            totalPrice: iPrice + sPrice + bPrice + tPrice,
          };
        }),
      );
      // Ordenar por familyName
      calculatedPrices.sort((a, b) => a.familyName.localeCompare(b.familyName));

      const response = {
        instances: {
          aws: calculatedPrices.filter((i) =>
            i.cloud === "AWS" && i.infraPrice > 0
          ),
          azr: calculatedPrices.filter((i) =>
            i.cloud === "AZR" && i.infraPrice > 0
          ),
          gcp: calculatedPrices.filter((i) =>
            i.cloud === "GCP" && i.infraPrice > 0
          ),
          oci: calculatedPrices.filter((i) =>
            i.cloud === "OCI" && i.infraPrice > 0
          ),
        },
      };
      //log.info(`API POST database response: ${JSON.stringify(response)}`);
      return new Response(
        JSON.stringify(response),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch (error) {
      console.error("Error al buscar infra:", error);
      return new Response("Internal error", { status: 500 });
    }
  },
};
