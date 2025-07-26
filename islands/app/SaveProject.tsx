import { useState } from "preact/hooks";
import { InfraInstancePrice } from "../../types.ts";

interface SaveProjectProps {
  values?: Record<string, string>;
  instances: {
    aws: InfraInstancePrice[];
    azr: InfraInstancePrice[];
    gcp: InfraInstancePrice[];
    oci: InfraInstancePrice[];
  };
  type: string;
  username: string;
}

const SaveProject = (
  { values, instances, type, username }: SaveProjectProps,
) => {
  const defaultName =
    `Proyecto ${values?.servers}x ${values?.vCpus}vCPUs ${values?.memory}GB RAM ${values?.storage}GB+${values?.backup}GB ${values?.hours}h ${values?.redundancy} ${values?.storageType} ${values?.reservation}`;
  const [projectName, setProjectName] = useState(defaultName);
  const [buttonMsg, setButtonMsg] = useState("Grabar Proyecto");

  const handleSaveProject = async () => {
    const payload = {
      username,
      name: projectName,
      type,
      paramsEncoded: JSON.stringify(values),
      instancesEncoded: JSON.stringify(instances),
      currency: values?.currency,
    };
    try {
      const response = await fetch("/api/project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        setButtonMsg("Error");
      } else {
        setButtonMsg("Guardado");
      }
    } catch (error) {
      setButtonMsg("Error");
    }
  };

  return (
    <div class="row g-3 mt-1">
      <div class="col-2">
        <button
          type="button"
          className={`btn w-100 ${
            buttonMsg.includes("Error")
              ? "btn-danger"
              : buttonMsg === "Guardado"
              ? "btn-success"
              : "btn-info hover:bg-info/75 hover:text-white"
          } `}
          onClick={handleSaveProject}
          disabled={!projectName || buttonMsg !== "Grabar Proyecto"}
        >
          {buttonMsg}
        </button>
      </div>
      <div class="col-10">
        <input
          id="projectName"
          type="text"
          class="form-control"
          placeholder="Nombre del Proyecto"
          value={projectName}
          onInput={(e: any) => setProjectName(e.target.value)}
        />
      </div>
    </div>
  );
};

export default SaveProject;
