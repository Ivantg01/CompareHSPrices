import Home from "../components/Home.tsx";
import { RouteConfig } from "$fresh/server.ts";

export const config: RouteConfig = {
  skipInheritedLayouts: true, // Skip already inherited layouts
};

export default function Page() {
  return (
    <div>
      <Home />
    </div>
  );
}
