import * as log from "@std/log";
import { Handlers } from "$fresh/server.ts";
import Register from "../../islands/Register.tsx";

export const handler: Handlers = {
  POST: async (req) => {
    //leer los datos del formulario
    const params = await req.formData();
    const { name, email, username, surname, password } = Object.fromEntries(
      params,
    );

    if (!username || !name || !email || !surname || !password) {
      return new Response(null, {
        status: 303,
        headers: new Headers({
          "Location": "/login/register?error=missing_fields",
        }),
      });
    }

    const userData = { username, email, name, surname, password };
    try {
      const apiResponse = await fetch(
        `${Deno.env.get("BACKEND_API_URL")}/api/user`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(userData),
        },
      );

      if (apiResponse.status === 201) {
        log.info(`Usuario registrado: ${username} ${email} ${name} ${surname}`);
        const headers = new Headers();
        headers.set("Location", "/login/login?username=" + username);
        return new Response(null, { status: 303, headers });
      }

      if (apiResponse.status === 400) {
        return new Response(null, {
          status: 303,
          headers: new Headers({
            "Location": "/login/register?error=user_exists",
          }),
        });
      }

      // Para otros errores
      return new Response(null, {
        status: 303,
        headers: new Headers({
          "Location": "/login/register?error=internal_error",
        }),
      });
    } catch (error) {
      console.error("Error en el registro:", error);
      return new Response(null, {
        status: 303,
        headers: new Headers({
          "Location": "/login/register?error=internal_error",
        }),
      });
    }
  },
};

export default function RegisterPage() {
  return <Register />;
}
