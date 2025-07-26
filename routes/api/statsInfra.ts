import * as log from "@std/log";
import { Handlers } from "$fresh/server.ts";
import { getCurrencyRate } from "../../utils/db.ts";
import * as st from "../../utils/statsTools.ts";
import { searchInfraByRegionStats } from "../../utils/statsTools.ts";

export const handler: Handlers = {
  GET: async (req) => {
    // Busca datos históricos a partir de datos de entrada
    try {
      const url = new URL(req.url);
      const params = {
        cloud: url.searchParams.get("cloud") || "AWS",
        searchBy: url.searchParams.get("searchBy") || "family",
        reservation: url.searchParams.get("reservation") || "od",
        currency: url.searchParams.get("currency") || "USD",
        awsFamily: url.searchParams.get("awsFamily") || "",
        azrFamily: url.searchParams.get("azrFamily") || "",
        gcpFamily: url.searchParams.get("gcpFamily") || "",
        ociFamily: url.searchParams.get("ociFamily") || "",
        awsRegion: url.searchParams.get("awsRegion") || "",
        azrRegion: url.searchParams.get("azrRegion") || "",
        gcpRegion: url.searchParams.get("gcpRegion") || "",
        awsInstance: url.searchParams.get("awsInstance") || "",
        azrInstance: url.searchParams.get("azrInstance") || "",
        gcpInstance: url.searchParams.get("gcpInstance") || "",
        ociInstance: url.searchParams.get("ociInstance") || "",
      };
      log.info(`API GET infra: ${params.cloud}/${params.searchBy} ${req.url}`);

      //obtiene la tasa de cambio de la moneda
      const rate = getCurrencyRate(params.currency ?? "USD");

      //buscamos las instancias válidas que cumplan con los requisitos de vCpu y Memoria
      const response = (params.searchBy === "family")
        ? await st.searchInfraByFamilyStats(params, rate)
        : (params.searchBy === "region")
        ? await searchInfraByRegionStats(params, rate)
        : {};

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
