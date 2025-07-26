import { Handlers } from "$fresh/server.ts";
import CurrencyModel from "../../models/Currency.ts";
import * as log from "@std/log";

type FloatRate = {
  code: string;
  alphaCode: string;
  numericCode: string;
  name: string;
  rate: number;
  date: string;
  inverseRate: number;
};
export type FloatRatesResponse = {
  [currencyCode: string]: FloatRate;
};

export const handler: Handlers = {
  GET: async (req, _ctx) => {
    try {
      // Extraer parámetro code de la URL
      const url = new URL(req.url);
      const code = url.searchParams.get("code");
      const orderBy = url.searchParams.get("orderBy") || "code"; // Ordenar por defecto por 'code'
      const orderDir = url.searchParams.get("orderDir") === "asc" ? 1 : -1; // Orden ascendente o descendente
      const allowedFields = ["code", "name", "rate", "date", "active"];
      const sortField = allowedFields.includes(orderBy) ? orderBy : "code";
      log.info(`API GET Currency: ${code} orderBy ${orderBy} ${orderDir}`);

      const currencies = await CurrencyModel.find(code ? { code: code } : {})
        .sort({ [sortField]: orderDir }); // Ordenar por el campo especificado

      // Procesar y formatear los currencies
      const formattedCurrencies = currencies.map((c) => {
        return {
          code: c.code,
          name: c.name,
          rate: c.rate,
          date: c.date,
          active: c.active,
          id: String(c._id),
        };
      });

      return new Response(JSON.stringify(formattedCurrencies), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    } catch (e) {
      console.error(e);
      return new Response("Error", { status: 500 });
    }
  },
  POST: async (_req) => {
    // Update all Currencies
    try {
      log.info(`API POST Currency: (all)`);
      //haz un fetch a la api de monedas en https://www.floatrates.com/daily/usd.json
      const response = await fetch("https://www.floatrates.com/daily/usd.json");
      if (!response.ok) {
        return new Response(
          JSON.stringify({ error: 1, message: "Error fetching currencies" }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        );
      }
      const data: FloatRatesResponse[] = await response.json();
      //procesa data para insertar los registros en una estructura de tipo Currency
      const currencies = Object.values(data).map((c) => {
        return {
          code: c.code,
          name: c.name,
          rate: c.rate,
          date: c.date,
          active: false, // por defecto, no activas
        };
      });
      const bulkOps = currencies.map((c) => ({
        updateOne: {
          filter: { code: c.code },
          update: { $set: c },
          upsert: true,
        },
      }));
      const resultBulk = await CurrencyModel.bulkWrite(bulkOps);
      log.debug(
        `--Currency codes processed: ${resultBulk.modifiedCount} updated / ${resultBulk.upsertedCount} added`,
      );
      return new Response(
        JSON.stringify({
          error: 0,
          message:
            `Currencies ${resultBulk.modifiedCount} updated and ${resultBulk.upsertedCount} added`,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch (error) {
      console.error("Error al actualizar las monedas:", error);
      return new Response("Internal error", { status: 500 });
    }
  },
  PUT: async (req) => {
    // Update a currency by id
    try {
      const body = await req.json();
      const { id, code, name, ratio, date, active } = body;
      log.info(`API PUT currency: ${id} ${code}`);
      // Find the currency by id
      const currency = await CurrencyModel.findById(id);
      if (!currency) {
        return new Response(
          JSON.stringify({ error: 1, message: "Currency not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        );
      }
      // Update the currency fields
      //code cannot change
      currency.name = name || currency.name;
      currency.rate = ratio || currency.rate;
      currency.date = date || currency.date;
      currency.active = active !== undefined ? active : currency.active;

      await currency.save();

      return new Response(
        JSON.stringify({
          error: 0,
          message: "Currency updated",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch (error) {
      log.error(`Error updating currency ${error}`);
      return new Response("Error interno del servidor", { status: 500 });
    }
  },
  DELETE: async (req) => {
    // Delete a Currency by id
    const { id } = await req.json();
    log.info(`API DELETE Currency: ${id}`);
    await CurrencyModel.findByIdAndDelete(id);
    return new Response(
      JSON.stringify({
        error: 0,
        message: "Currency deleted",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  },
};
