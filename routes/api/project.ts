import { Handlers } from "$fresh/server.ts";
import ProjectModel from "../../models/Project.ts";
import UserModel from "../../models/Users.ts";
import * as log from "@std/log";
import { InfraInstancesPriceGroup } from "../../types.ts";

export const handler: Handlers = {
  GET: async (req, _ctx) => {
    try {
      // Extraer parámetro type de la URL
      const url = new URL(req.url);
      const username = url.searchParams.get("username") || "";
      const type = url.searchParams.get("type") || "";
      const orderBy = url.searchParams.get("orderBy") || "createdAt";
      const orderDir = url.searchParams.get("orderDir") === "asc" ? 1 : -1; // Orden ascendente o descendente
      const allowedFields = [
        "type",
        "name",
        "createdAt",
        "awsPrice",
        "azrPrice",
        "gcpPrice",
        "ociPrice",
      ];
      const sortField = allowedFields.includes(orderBy) ? orderBy : "createdAt";
      log.info(
        `API GET Projects: ${type} (${username}) orderBy ${orderBy} ${orderDir}`,
      );

      // Buscamos los datos del username indicado o un array vacío
      const projects = await ProjectModel.find({ username, type }).sort({
        [sortField]: orderDir,
      });

      // Procesar y formatear los usuarios
      const formattedProjects = projects.map((p) => {
        return {
          username: p.username,
          name: p.name,
          type: p.type,
          paramsEncoded: p.paramsEncoded,
          instancesEncoded: p.instancesEncoded,
          createdAt: p.createdAt,
          awsPrice: p.awsPrice,
          azrPrice: p.azrPrice,
          gcpPrice: p.gcpPrice,
          ociPrice: p.ociPrice,
          currency: p.currency,
          id: String(p._id),
        };
      });

      return new Response(JSON.stringify(formattedProjects), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    } catch (e) {
      console.error(e);
      return new Response("Error", { status: 500 });
    }
  },
  POST: async (req) => {
    // Create a new user
    try {
      const body = await req.json();
      const {
        username,
        name,
        type,
        paramsEncoded,
        instancesEncoded,
        currency,
      } = body;
      log.info(`API POST project: ${type} (${username}) ${name}`);
      // Check if the user already exists
      const user = await UserModel.findOne({ username });
      if (!user) {
        return new Response(
          JSON.stringify({ error: 1, message: "User does not exist" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      //si type es diferente de "VM", "K8" o "DB" da un error
      const allowedTypes = ["VM", "K8", "DB"];
      if (!allowedTypes.includes(type)) {
        return new Response(
          JSON.stringify({ error: 2, message: "Invalid project type" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      if (!paramsEncoded || !instancesEncoded) {
        return new Response(
          JSON.stringify({ error: 3, message: "Missing params or instances" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      const instances: InfraInstancesPriceGroup = JSON.parse(instancesEncoded);
      //obtenemos el precio mínimo de aws, azr, gcp y oci
      const awsPrice = Math.min(...instances.aws.map((i) => i.totalPrice));
      const azrPrice = Math.min(...instances.azr.map((i) => i.totalPrice));
      const gcpPrice = Math.min(...instances.gcp.map((i) => i.totalPrice));
      const ociPrice = Math.min(...instances.oci.map((i) => i.totalPrice));
      const newUser = new ProjectModel({
        username,
        name,
        type,
        paramsEncoded,
        instancesEncoded,
        awsPrice,
        azrPrice,
        gcpPrice,
        ociPrice,
        currency,
      });
      await newUser.save();

      return new Response(
        JSON.stringify({ error: 0, message: "Project created" }),
        { status: 201, headers: { "Content-Type": "application/json" } },
      );
    } catch (error) {
      console.error("Error al crear el projecto:", error);
      return new Response("Internal error", { status: 500 });
    }
  },

  DELETE: async (req) => {
    // Delete a project by id
    const { id } = await req.json();
    log.info(`API DELETE project: ${id}`);
    await ProjectModel.findByIdAndDelete(id);
    return new Response(
      JSON.stringify({
        error: 0,
        message: "Project deleted",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  },
};
