import { FunctionComponent } from "preact";
import { Signal } from "@preact/signals";

interface ProjectProps {
  projectType: Signal<string>;
}

interface ProjectButton {
  name: string;
  icon: string;
  displayName: string;
}

const projectButtons: ProjectButton[] = [
  {
    name: "VM",
    icon: "bi-hdd-network-fill",
    displayName: "Máquinas Virtuales",
  },
  {
    name: "K8",
    icon: "bi-grid-3x3-gap-fill",
    displayName: "Contenedores Kubernetes",
  },
  { name: "DB", icon: "bi-server", displayName: "Base de datos" },
];

const ProjectSelectButtons: FunctionComponent<ProjectProps> = (
  { projectType }: ProjectProps,
) => {
  return (
    <div className="d-flex justify-content-center mb-4">
      {projectButtons.map((pb) => (
        <button
          type="button"
          className={`btn btn-outline-primary mx-2 d-flex align-items-center justify-content-center 
                  ${projectType.value === pb.name ? "active" : ""}`}
          onClick={() => projectType.value = pb.name}
        >
          <i className={`bi ${pb.icon} fs-1`}></i>&nbsp; Proyectos{"  "}
          {pb.displayName}
        </button>
      ))}
    </div>
  );
};

export default ProjectSelectButtons;
