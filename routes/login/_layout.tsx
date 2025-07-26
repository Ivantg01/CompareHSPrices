import { LayoutConfig, PageProps } from "$fresh/server.ts";

export const config: LayoutConfig = {
  skipInheritedLayouts: true, // Skip already inherited layouts
};

export default function Layout({ Component, state, url }: PageProps) {
  return (
    <div>
      <Component />
    </div>
  );
}
