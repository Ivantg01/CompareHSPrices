#!/usr/bin/env -S deno run -A --watch=static/,routes/

import dev from "$fresh/dev.ts";
import config from "./fresh.config.ts";

import "$std/dotenv/load.ts";
//Add a change to initialize WebApp
import {initWebApp} from "./utils/init.ts";
await initWebApp();

await dev(import.meta.url, "./main.ts", config);
