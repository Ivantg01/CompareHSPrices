import { FunctionComponent } from "preact";
import { Signal } from "@preact/signals";

interface RegionProps {
  cloudRegion: Signal<string>;
}

const RegionSelectButtons: FunctionComponent<RegionProps> = (
  { cloudRegion }: RegionProps,
) => {
  return (
    <div className="d-flex justify-content-center mb-4">
      {["AWS", "AZR", "GCP", "OCI"].map((region) => (
        <button
          type="button"
          className={`btn btn-outline-primary mx-2 d-flex align-items-center justify-content-center 
                  ${cloudRegion.value === region ? "active" : ""}`}
          onClick={() => cloudRegion.value = region}
        >
          <img
            src={`/images/cloud${region}.png`}
            alt={`cloud${region} icon`}
            style={{ width: "64px", height: "64px", marginRight: "8px" }}
          />
          Regiones {region}
        </button>
      ))}
    </div>
  );
};

export default RegionSelectButtons;
