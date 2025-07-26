import { Handlers } from "$fresh/server.ts";
import InfraInstanceModel from "../../models/InfraInstance.ts";
import * as log from "@std/log";

export const handler: Handlers = {
  GET: async (req, _ctx) => {
    try {
      // Extraer parámetro cloud de la URL
      const url = new URL(req.url);
      const cloud = url.searchParams.get("cloud");
      const familyName = url.searchParams.get("familyName");
      const instanceName = url.searchParams.get("instanceName");
      const orderBy = url.searchParams.get("orderBy") || "instanceName";
      const orderDir = url.searchParams.get("orderDir") === "asc" ? 1 : -1; // Orden ascendente o descendente
      const allowedFields = [
        "cloud",
        "familyName",
        "familyUse",
        "instanceName",
        "vCpuMin",
        "use",
      ];
      const sortField = allowedFields.includes(orderBy)
        ? orderBy
        : "familyName";
      log.info(
        `API GET infraInstance: ${cloud}/${familyName}/${instanceName} orderBy ${orderBy} ${orderDir}`,
      );

      // Buscamos los datos de la familia indicada
      const query = cloud && familyName
        ? { cloud, familyName }
        : instanceName
        ? { instanceName }
        : {};
      const families = await InfraInstanceModel.find(query).sort({
        [sortField]: orderDir,
      });

      return new Response(JSON.stringify(families), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    } catch (e) {
      console.error(e);
      return new Response("Error", { status: 500 });
    }
  },
};
