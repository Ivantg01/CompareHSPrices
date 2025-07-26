import { FreshContext } from "$fresh/server.ts";
import "@std/dotenv/load";
import jwt from "jsonwebtoken";

import { getCookies } from "$std/http/cookie.ts";
import { isAdminSignal, usernameSignal } from "../utils/signals.ts";

export async function handler(req: Request, ctx: FreshContext) {
  // check route, if not route, pass to next middleware
  if (ctx.destination !== "route") {
    return await ctx.next();
  }

  // if login route, pass to next middleware
  if (ctx.route.startsWith("/login") || ctx.route.startsWith("/api")) {
    return await ctx.next();
  }

  const { auth } = getCookies(req.headers);
  if (!auth) {
    // redirect to log-in if no auth cookie
    return new Response("", { status: 307, headers: { location: "/login" } });
  }

  try {
    const payload = jwt.verify(auth, Deno.env.get("JWT_SECRET"));
    if (!payload) {
      // redirect to log-in if invalid token
      return new Response("", {
        status: 307,
        headers: { location: "/login/login" },
      });
    }
    console.log(
      `User ${payload.username} isAdmin: ${payload.isAdmin}`,
    );

    usernameSignal.value = payload.username;
    isAdminSignal.value = payload.isAdmin;

    ctx.state.user = {
      username: payload.username,
      isAdmin: payload.isAdmin,
    };

    return await ctx.next();
  } catch (error) {
    console.error("JWT verification failed:", error);
    // redirect to log-in if token verification fails
    return new Response("", {
      status: 307,
      headers: { location: "/login/logout" },
    });
  }
}
