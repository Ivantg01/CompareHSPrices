import { Signal } from "@preact/signals";
import type { RegionalName } from "../../types.ts";

interface Props {
  regionalNameSignal: Signal<RegionalName>;
}

const REGIONS: { name: RegionalName; icon: string; color: string }[] = [
  { name: "África", icon: "bi-globe-europe-africa", color: "btn-primary" },
  { name: "América", icon: "bi-globe-americas", color: "btn-primary" },
  {
    name: "Asia Pacífico",
    icon: "bi-globe-asia-australia",
    color: "btn-primary",
  },
  { name: "Europa", icon: "bi-globe-europe-africa-fill", color: "btn-primary" },
  {
    name: "Oriente Medio",
    icon: "bi-globe-central-south-asia",
    color: "btn-primary",
  },
  { name: "Todas", icon: "bi-globe", color: "btn-secondary" },
];

export default function StatsSelectRegion({ regionalNameSignal }: Props) {
  return (
    <div class="btn-group w-100" role="group" aria-label="Selector de región">
      {REGIONS.map((region) => (
        <a
          key={region.name}
          href="#"
          class={`btn flex-fill ${region.color}${
            regionalNameSignal.value === region.name ? " active" : ""
          }`}
          aria-current={regionalNameSignal.value === region.name
            ? "page"
            : undefined}
          onClick={(e) => {
            e.preventDefault();
            regionalNameSignal.value = region.name;
          }}
          title={region.name}
        >
          <i class={`bi ${region.icon} me-2`}></i>
          {region.name}
        </a>
      ))}
    </div>
  );
}
