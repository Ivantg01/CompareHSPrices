import * as log from "@std/log";
import { Handlers } from "$fresh/server.ts";
import { InfraInstancePrice } from "../../types.ts";
import { getCurrencyRate } from "../../utils/db.ts";
import { FormParamsInfra } from "../../types.ts";
import * as it from "../../utils/infraTools.ts";

export const handler: Handlers = {
  POST: async (req) => {
    // Busca una configuración a partir de datos de entrada
    try {
      const body = await req.json();
      const params: FormParamsInfra = {
        servers: Number(body.servers),
        vCpus: Number(body.vCpus),
        memory: Number(body.memory),
        boot: body.boot ? Number(body.boot) : undefined, // Opcional para contenedores
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
      };
      log.info(
        `API POST infra: ${params.servers}/${params.vCpus}/${params.memory}/${params.storage}`,
      );
      //obtiene la tasa de cambio de la moneda
      const rate = getCurrencyRate(params.currency ?? "USD");

      //buscamos las instancias válidas que cumplan con los requisitos de vCpu y Memoria
      const validInstances = await it.searchValidInfraInstances(
        params.vCpus,
        params.memory,
      );
      //filtramos las instancias que no tengan el uso de familia requerido
      const filteredInstances = validInstances.filter(
        (inst) =>
          params.familyUse === "ALL" ||
          params.familyUse === inst.familyUse.slice(0, 2),
      );
      //calculamos el precio del disco boot si es necesario solo para contenedores
      const bootPricesByCloud: Record<string, number> = {
        AWS: await it.calculateBootPriceAws(params) * rate,
        AZR: await it.calculateBootPriceAzr(params) * rate,
        GCP: await it.calculateBootPriceGcp(params) * rate,
        OCI: await it.calculateBootPriceOci(params) * rate,
      };
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
      //calculamos el precio del SLA K8s si es necesario solo para contenedores
      const k8sPricesByCloud: Record<string, number> = {
        AWS: await it.calculateK8sPriceAws(params) * rate,
        AZR: await it.calculateK8sPriceAzr(params) * rate,
        GCP: await it.calculateK8sPriceGcp(params) * rate,
        OCI: await it.calculateK8sPriceOci(params) * rate,
      };
      //generamos los precios finales de las instancias reutilizando los datos anteriores
      const calculatedPrices: InfraInstancePrice[] = await Promise.all(
        filteredInstances.map(async (inst) => {
          const iPrice = await it.calculateInfraPrice(inst, params) * rate;
          const oPrice = bootPricesByCloud[inst.cloud] ?? 0;
          const sPrice = storagePricesByCloud[inst.cloud] ?? 0;
          const bPrice = backupPricesByCloud[inst.cloud] ?? 0;
          const tPrice = trafficPricesByCloud[inst.cloud] ?? 0;
          const kPrice = (params.boot === undefined) //defined para contenedores
            ? 0
            : k8sPricesByCloud[inst.cloud] ?? 0;
          return {
            cloud: inst.cloud,
            familyName: inst.familyName,
            familyUse: inst.familyUse,
            instanceName: inst.instanceName,
            servers: params.servers,
            vCpus: Math.max(params.vCpus, inst.vCpuMin),
            memory: Math.max(params.memory, inst.memoryMin),
            storageType: params.storageType,
            boot: params.boot,
            storage: params.storage,
            backup: params.backup,
            traffic: params.traffic,
            infraPrice: iPrice,
            bootPrice: oPrice,
            storagePrice: sPrice,
            backupPrice: bPrice,
            trafficPrice: tPrice,
            k8sPrice: kPrice,
            totalPrice: iPrice + oPrice + sPrice + bPrice + tPrice + kPrice,
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

      //log.info(`API POST infra response: ${JSON.stringify(response)}`);
      return new Response(
        JSON.stringify(response),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch (error) {
      log.error("Error al buscar infra:" + error);
      return new Response("Internal error", { status: 500 });
    }
  },
};
