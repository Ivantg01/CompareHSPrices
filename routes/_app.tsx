import { type PageProps } from "$fresh/server.ts";
import { asset } from "https://deno.land/x/fresh@1.6.3/src/runtime/utils.ts";
export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>CompareHSPrices</title>
        <link rel="stylesheet" href={asset("/bootstrap.min.css")} defer />
        <link rel="stylesheet" href={asset("/styles.css")} />
        <link rel="stylesheet" href={asset("/bootstrap-icons.css")} defer />
      </head>
      <body>
        <Component />
        <script src={asset("/bootstrap.bundle.min.js")} defer></script>
      </body>
    </html>
  );
}
