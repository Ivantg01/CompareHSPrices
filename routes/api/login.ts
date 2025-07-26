import { Handlers } from "$fresh/server.ts";
import UserModel from "../../models/Users.ts";
import * as bcrypt from "@da/bcrypt";
import * as log from "@std/log";

export const handler: Handlers = {
  POST: async (req) => {
    try {
      const body = await req.json();
      const { username, password } = body;

      // Buscar el usuario en la base de datos
      const user = await UserModel.findOne({ username });

      if (!user) {
        log.info(`API Login user not found: ${username}`);
        return new Response(
          JSON.stringify({ error: 1, message: "Usuario no encontrado" }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        );
      }

      if (!user.active) {
        log.info(`API Login user not active: ${username}`);
        return new Response(
          JSON.stringify({ error: 1, message: "Usuario bloqueado" }),
          { status: 423, headers: { "Content-Type": "application/json" } },
        );
      }

      // Comparar la contraseña proporcionada con el hash almacenado
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        log.info(`API Login invalid password: ${username}`);
        return new Response(
          JSON.stringify({ error: 2, message: "Credenciales inválidas" }),
          { status: 401, headers: { "Content-Type": "application/json" } },
        );
      }
      //indicar si es admin
      const isAdmin = user.role === "admin";

      // Respuesta exitosa
      log.info(`API Login user not found: ${username}`);
      return new Response(
        JSON.stringify({ error: 0, message: "Usuario válido", isAdmin }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch (error) {
      log.error(`Error en API login: ${error}`);
      return new Response("Error interno del servidor", { status: 500 });
    }
  },
};
