import { FunctionComponent } from "preact";
import { Signal } from "@preact/signals";

interface ProviderSelectProps {
  provider: Signal<string>;
  preTitle?: string;
  postTitle?: string;
}

const ProviderSelectButtons: FunctionComponent<ProviderSelectProps> = (
  { provider, preTitle, postTitle }: ProviderSelectProps,
) => {
  return (
    <div className="d-flex justify-content-center mb-4">
      {["AWS", "AZR", "GCP", "OCI"].map((p) => (
        <button
          type="button"
          className={`btn btn-outline-primary mx-2 d-flex align-items-center justify-content-center 
                  ${provider.value === p ? "active" : ""}`}
          onClick={() => provider.value = p}
        >
          <img
            src={`/images/cloud${p}.png`}
            alt={`cloud${p} icon`}
            style={{ width: "64px", height: "64px", marginRight: "8px" }}
          />
          {preTitle} {p} {postTitle}
        </button>
      ))}
    </div>
  );
};

export default ProviderSelectButtons;
