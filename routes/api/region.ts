import { Handlers } from "$fresh/server.ts";
import AmazonCloudRegionModel from "../../models/AmazonCloudRegion.ts";
import AzureCloudRegionModel from "../../models/AzureCloudRegion.ts";
import GoogleCloudRegionModel from "../../models/GoogleCloudRegion.ts";
import * as log from "@std/log";

export const handler: Handlers = {
  GET: async (req, _ctx) => {
    try {
      // Extraer parámetro cloud de la URL
      const url = new URL(req.url);
      const cloud = url.searchParams.get("cloud");
      const orderBy = url.searchParams.get("orderBy") || "cloud"; // Ordenar por defecto por 'cloud'
      const orderDir = url.searchParams.get("orderDir") === "asc" ? 1 : -1; // Orden ascendente o descendente
      const allowedFields = [
        "name",
        "displayName",
        "regionalDisplayName",
        "regionalName",
        "active",
      ];
      const sortField = allowedFields.includes(orderBy) ? orderBy : "cloud";
      log.info(`API GET Region: ${cloud} orderBy ${orderBy} ${orderDir}`);

      // Buscamos los datos de la region indicada o un array vacío
      const regions = (cloud === "AWS")
        ? await AmazonCloudRegionModel.find({}).sort({ [sortField]: orderDir })
        : (cloud === "AZR")
        ? await AzureCloudRegionModel.find({}).sort({ [sortField]: orderDir })
        : (cloud === "GCP")
        ? await GoogleCloudRegionModel.find({}).sort({ [sortField]: orderDir })
        : [];

      // Procesar y formatear los usuarios
      const formattedRegions = regions.map((c) => {
        return {
          name: c.name,
          displayName: c.displayName,
          regionalDisplayName: c.regionalDisplayName,
          regionalName: c.regionalName,
          active: c.active,
          id: String(c._id),
        };
      });

      return new Response(JSON.stringify(formattedRegions), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    } catch (e) {
      console.error(e);
      return new Response("Error", { status: 500 });
    }
  },
  PUT: async (req) => {
    // Update a region by id
    try {
      const body = await req.json();
      const {
        id,
        cloud,
        displayName,
        regionalDisplayName,
        regionalName,
        active,
      } = body;
      log.info(`API PUT region: ${cloud} ${id}`);
      // Find the region by cloud and id
      const region = (cloud === "AWS")
        ? await AmazonCloudRegionModel.findById(id)
        : (cloud === "AZR")
        ? await AzureCloudRegionModel.findById(id)
        : (cloud === "GCP")
        ? await GoogleCloudRegionModel.findById(id)
        : null;

      if (!region) {
        return new Response(
          JSON.stringify({ error: 1, message: "Region not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        );
      }
      // Update the region fields
      //name cannot change
      region.displayName = displayName || region.displayName;
      region.regionalDisplayName = regionalDisplayName ||
        region.regionalDisplayName;
      region.regionalName = regionalName || region.regionalName;
      region.active = active !== undefined ? active : region.active;

      await region.save();

      return new Response(
        JSON.stringify({
          error: 0,
          message: "Region updated",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch (error) {
      log.error(`Error updating region ${error}`);
      return new Response("Error interno del servidor", { status: 500 });
    }
  },
  DELETE: async (req) => {
    // Delete a Region by id
    const body = await req.json();
    const { id, cloud } = body;
    log.info(`API DELETE Region: ${cloud} ${id}`);

    if (cloud === "AWS") {
      await AmazonCloudRegionModel.findByIdAndDelete(id);
    } else if (cloud === "AZR") {
      await AzureCloudRegionModel.findByIdAndDelete(id);
    } else if (cloud === "GCP") {
      await GoogleCloudRegionModel.findByIdAndDelete(id);
    }

    return new Response(
      JSON.stringify({
        error: 0,
        message: "Region deleted",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  },
};
