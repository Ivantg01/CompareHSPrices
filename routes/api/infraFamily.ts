import { Handlers } from "$fresh/server.ts";
import InfraFamilyModel from "../../models/InfraFamily.ts";
import * as log from "@std/log";

export const handler: Handlers = {
  GET: async (req, _ctx) => {
    try {
      // Extraer parámetro cloud de la URL
      const url = new URL(req.url);
      const cloud = url.searchParams.get("cloud");
      const orderBy = url.searchParams.get("orderBy") || "familyName";
      const orderDir = url.searchParams.get("orderDir") === "asc" ? 1 : -1; // Orden ascendente o descendente
      const allowedFields = [
        "cloud",
        "familyName",
        "processor",
        "use",
      ];
      const sortField = allowedFields.includes(orderBy)
        ? orderBy
        : "familyName";
      log.info(`API GET infraFamily: ${cloud} orderBy ${orderBy} ${orderDir}`);

      // Buscamos los datos de la familia indicada
      const query = cloud ? { cloud } : {};
      const families = await InfraFamilyModel.find(query).sort({
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
