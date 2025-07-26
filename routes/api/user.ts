import { Handlers } from "$fresh/server.ts";
import UserModel from "../../models/Users.ts";
import * as bcrypt from "@da/bcrypt";
import * as log from "@std/log";

export const handler: Handlers = {
  GET: async (req, _ctx) => {
    try {
      // Extraer parámetro username de la URL
      const url = new URL(req.url);
      const username = url.searchParams.get("username");
      log.info(`API GET user: ${username}`);

      const users = await UserModel.find(
        username ? { username: username } : {},
      );

      // Procesar y formatear los usuarios
      const formattedUsers = users.map((user) => ({
        email: user.email,
        name: user.name,
        surname: user.surname,
        username: user.username,
        role: user.role,
        active: user.active,
        id: String(user._id),
      }));

      return new Response(JSON.stringify(formattedUsers), {
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
      const { username, email, name, surname, password } = body;
      log.info(`API POST user: ${username}`);
      // Check if the user already exists
      const existingUser = await UserModel.findOne({ username });
      if (existingUser) {
        return new Response(
          JSON.stringify({ error: 1, message: "User already exists" }),
          { status: 400, headers: { "Content-Type": "application/json" } },
        );
      }
      // Hash the password
      const hashedPassword = await bcrypt.hash(password);
      // Create a new user
      const newUser = new UserModel({
        //almacena username as lowercase
        username: username.toLowerCase(),
        email,
        name,
        surname,
        password: hashedPassword,
        role: "user",
        active: true,
      });
      await newUser.save();

      return new Response(
        JSON.stringify({ error: 0, message: "User created" }),
        { status: 201, headers: { "Content-Type": "application/json" } },
      );
    } catch (error) {
      console.error("Error al crear el usuario:", error);
      return new Response("Internal error", { status: 500 });
    }
  },
  PUT: async (req) => {
    // Update a user by id
    try {
      const body = await req.json();
      const { id, username, email, name, surname, password, role, active } =
        body;
      log.info(`API PUT user: ${id} ${username}`);
      // Find the user by id
      const user = await UserModel.findById(id);
      if (!user) {
        return new Response(
          JSON.stringify({ error: 1, message: "User not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } },
        );
      }
      // Update the user fields
      //username cannot change
      user.email = email || user.email;
      user.name = name || user.name;
      user.surname = surname || user.surname;
      if (password) {
        user.password = await bcrypt.hash(password);
      }
      user.role = role || user.role;
      user.active = active !== undefined ? active : user.active;

      await user.save();

      return new Response(
        JSON.stringify({
          error: 0,
          message: "User updated",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    } catch (error) {
      log.error(`Error updating user ${error}`);
      return new Response("Error interno del servidor", { status: 500 });
    }
  },
  DELETE: async (req) => {
    // Delete a user by id
    const { id } = await req.json();
    log.info(`API DELETE user: ${id}`);
    await UserModel.findByIdAndDelete(id);
    return new Response(
      JSON.stringify({
        error: 0,
        message: "User deleted",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  },
};
