import "@std/dotenv/load";
import * as log from "@std/log";
import { FreshContext, Handlers, PageProps } from "$fresh/server.ts";
import jwt from "jsonwebtoken";
import { setCookie } from "$std/http/cookie.ts";
import Login from "../../components/Login.tsx";
import Home from "../../components/Home.tsx";

export const handler: Handlers = {
  POST: async (req: Request, ctx: FreshContext) => {
    const url = new URL(req.url);
    const form = await req.formData();
    const username = form.get("username")?.toString() || "";
    const password = form.get("password")?.toString() || "";

    //check if username and password are not empty
    if (!username || !password) {
      return ctx.render();
    }
    const response = await fetch(
      Deno.env.get("BACKEND_API_URL") + "/api/login",
      {
        method: "POST",
        body: JSON.stringify({ username, password }),
        headers: { "Content-Type": "application/json" },
      },
    );

    if (response.status == 404) {
      return ctx.render({
        message: "Incorrect credentials or user does not exist",
      });
    }

    if (response.status == 423) {
      return ctx.render({
        message: "User is locked",
      });
    }

    if (response.status == 200) {
      const data = await response.json();
      //imprime con log.info el usuario que se ha logueado y su estado con comillas inversas
      log.info(`Login user: ${username}, isAdmin: ${data.isAdmin}`);
      const isAdmin = data.isAdmin || false;
      // create JWT token and set it as a cookie
      const token = jwt.sign(
        { username, isAdmin },
        Deno.env.get("JWT_SECRET"),
        { expiresIn: "24h" },
      );
      const headers = new Headers();
      setCookie(headers, {
        name: "auth",
        value: token,
        sameSite: "Lax", // this is important to prevent CSRF attacks
        domain: url.hostname,
        path: "/",
        secure: true,
      });
      headers.set("location", "/menu");
      return new Response(null, {
        status: 303, // "See Other"
        headers,
      });
    } else {
      return ctx.render();
    }
  },
  GET(req, ctx) {
    // En caso de recibir un campo username de un registro previo, lo mostramos
    const url = new URL(req.url);
    const username = url.searchParams.get("username") || undefined;
    return ctx.render({ username });
  },
};

type Data = {
  username?: string;
};

export default function Page(props: PageProps<Data>) {
  return (
    <div>
      <Login username={props.data?.username} />
    </div>
  );
}
