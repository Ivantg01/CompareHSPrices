import { useEffect, useState } from "preact/hooks";
import { FunctionComponent } from "preact";
import { Signal } from "@preact/signals";
import { InfraInstancesPriceGroup, Project } from "../../types.ts";
import FormFieldReadonly from "../../components/app/FormFieldReadonly.tsx";
import InfraResultsTable from "../../components/app/InfraResultsTable.tsx";
import InfraSummaryTable from "../../components/app/InfraSummaryTable.tsx";
import InfraResultsChart from "./InfraResultsChart.tsx";

interface ProjectProps {
  projectType: Signal<string>;
  username: string;
}

const orderableFields = [
  "name",
  "createdAt",
  "awsPrice",
  "azrPrice",
  "gcpPrice",
  "ociPrice",
] as const;
type OrderField = typeof orderableFields[number];

const ProjectManagement: FunctionComponent<ProjectProps> = (
  { projectType, username }: ProjectProps,
) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [projectToView, setProjectToView] = useState<Project | null>(null);
  const [viewForm, setViewForm] = useState<Partial<Project>>({});
  const [viewParams, setViewParams] = useState<Record<string, string>>({});
  const [viewInstances, setViewInstances] = useState<InfraInstancesPriceGroup>({
    aws: [],
    azr: [],
    gcp: [],
    oci: [],
  });
  const [orderBy, setOrderBy] = useState<OrderField>("name");
  const [orderDir, setOrderDir] = useState<"asc" | "desc">("asc");

  // Fetch projects from API
  const fetchProjects = async (
    field: OrderField = orderBy,
    dir: "asc" | "desc" = orderDir,
  ) => {
    try {
      console.log(
        `Fetching projects type: ${projectType.value}, orderBy: ${field}, orderDir: ${dir}`,
      );
      const response = await fetch(
        `/api/project?username=${username}&type=${projectType.value}&orderBy=${field}&orderDir=${dir}`,
      );
      if (!response.ok) throw new Error("Error fetching projects");
      const data = await response.json();
      setProjects(data);
      setOrderBy(field);
      setOrderDir(dir);
    } catch (err) {
      console.error("Error reading projects:", err);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [projectType.value]);

  const handleSort = (field: OrderField) => {
    let dir: "asc" | "desc" = "asc";
    if (orderBy === field) {
      dir = orderDir === "asc" ? "desc" : "asc";
    }
    fetchProjects(field, dir);
  };

  const openDeleteModal = (project: Project) => {
    setProjectToDelete(project);
    setShowDeleteModal(true);
  };

  const openViewModal = (project: Project) => {
    setProjectToView(project);
    setViewForm({
      id: project.id,
      name: project.name,
      type: project.type,
      paramsEncoded: project.paramsEncoded,
      instancesEncoded: project.instancesEncoded,
      createdAt: project.createdAt,
    });
    setViewParams(JSON.parse(project.paramsEncoded) || {});
    setViewInstances(JSON.parse(project.instancesEncoded) || []);
    setShowViewModal(true);
  };

  const handleDelete = async () => {
    if (!projectToDelete) return;
    try {
      const response = await fetch("/api/project", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: projectToDelete.id }),
      });
      if (response.ok) {
        setProjects(
          projects.filter((project) => project.id !== projectToDelete.id),
        );
      } else {
        alert("Error al eliminar el proyecto");
      }
    } catch (error) {
      console.error(`Error deleting project ${projectToDelete.id}:`, error);
    }
    setShowDeleteModal(false);
    setProjectToDelete(null);
  };

  if (projects.length === 0) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <div className="text-center py-4">No hay proyectos registrados.</div>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center mt-5">
      <div
        className="table-responsive"
        style={{ width: "95%", maxWidth: "1200px" }}
      >
        <table className="table table-hover table-striped">
          <thead className="table-light">
            <tr>
              {orderableFields.map((field) => (
                <th
                  key={field}
                  onClick={() => handleSort(field)}
                  style={{ cursor: "pointer" }}
                >
                  {field === "name"
                    ? "Nombre del proyecto"
                    : field === "createdAt"
                    ? "Fecha de creación"
                    : field === "awsPrice"
                    ? "Precio AWS"
                    : field === "azrPrice"
                    ? "Precio Azure"
                    : field === "gcpPrice"
                    ? "Precio GCP"
                    : field === "ociPrice"
                    ? "Precio OCI"
                    : ""}
                  {orderBy === field && (
                    <i
                      className={`bi bi-arrow-${
                        orderDir === "asc" ? "up" : "down"
                      }`}
                    />
                  )}
                </th>
              ))}
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id}>
                <td className="text-center align-middle">
                  {project.name}
                </td>
                <td className="text-center align-middle">
                  {new Date(project.createdAt).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                  })}
                </td>
                <td className="text-center align-middle">
                  {project.awsPrice?.toFixed(2)} {project.currency}
                </td>
                <td className="text-center align-middle">
                  {project.azrPrice?.toFixed(2)} {project.currency}
                </td>
                <td className="text-center align-middle">
                  {project.gcpPrice?.toFixed(2)} {project.currency}
                </td>
                <td className="text-center align-middle">
                  {project.ociPrice?.toFixed(2)} {project.currency}
                </td>
                <td className="text-center align-middle">
                  <div className="d-flex gap-2 justify-content-center">
                    <button
                      onClick={() => openViewModal(project)}
                      type="button"
                      className="btn btn-sm btn-outline-primary rounded-circle"
                      data-bs-toggle="tooltip"
                      title="Ver projecto"
                    >
                      <i className="bi bi-eye"></i>
                    </button>
                    <button
                      onClick={() => openDeleteModal(project)}
                      type="button"
                      className="btn btn-sm btn-outline-danger rounded-circle"
                      data-bs-toggle="tooltip"
                      title="Eliminar projecto"
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Eliminación */}
      {showDeleteModal && projectToDelete && (
        <div
          className="modal show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Confirmar eliminación</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                >
                </button>
              </div>
              <div className="modal-body">
                ¿Estás seguro de eliminar el proyecto {projectToDelete.name}?
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDelete}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Edición */}
      {showViewModal && projectToView && (
        <div
          className="modal show d-block modal-dialog-centered modal-xl"
          style={{
            maxHeight: "90vh",
            overflowY: "auto",
            background: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content text-start">
              <div className="modal-header">
                <h5 className="modal-title">
                  Ver Proyecto
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowViewModal(false)}
                >
                </button>
              </div>
              <form>
                {/* Datos del proyecto */}
                <div className="modal-body row g-1">
                  <FormFieldReadonly
                    class="col-6"
                    label="Nombre"
                    name="name"
                    value={projectToView.name}
                  />
                  <FormFieldReadonly
                    class="col-6"
                    label="Fecha de creación"
                    name="createdAt"
                    value={new Date(String(viewForm.createdAt))
                      .toLocaleDateString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: false,
                      })}
                  />
                </div>
                {/* Datos de parametros */}
                <div className="modal-body row g-1">
                  <div className="row g-3">
                    <FormFieldReadonly
                      label="Nº nodos"
                      name="servers"
                      value={viewParams.servers}
                    />
                    <FormFieldReadonly
                      label="Nº vCPUs"
                      name="vCpus"
                      value={viewParams.vCpus}
                    />
                    <FormFieldReadonly
                      label="GB Memoria"
                      name="memory"
                      value={viewParams.memory}
                    />
                    {viewForm.type === "K8" && (
                      <FormFieldReadonly
                        label="GB Disco Boot"
                        name="boot"
                        value={viewParams.boot}
                      />
                    )}
                    <FormFieldReadonly
                      label="GB Disco almac."
                      name="storage"
                      value={viewParams.storage}
                    />
                    <FormFieldReadonly
                      label="GB Backup"
                      name="backup"
                      value={viewParams.backup}
                    />
                    <FormFieldReadonly
                      label="GB Tráfico/mes"
                      name="traffic"
                      value={viewParams.traffic}
                    />
                    <FormFieldReadonly
                      label="Nº Horas/mes"
                      name="hours"
                      value={viewParams.hours}
                    />
                    <FormFieldReadonly
                      label="Redundancia"
                      name="redundancy"
                      value={viewParams.redundancy}
                    />
                    <FormFieldReadonly
                      label="Tipo almac."
                      name="storageType"
                      value={viewParams.storageType}
                    />
                    <FormFieldReadonly
                      label="Reserva"
                      name="reservation"
                      value={viewParams.reservation}
                    />
                    <FormFieldReadonly
                      label="Moneda"
                      name="currency"
                      value={viewParams.currency}
                    />
                    <FormFieldReadonly
                      label="Uso"
                      name="familyUse"
                      value={viewParams.familyUse}
                    />
                  </div>
                  <div className="modal-body row g-1">
                    <FormFieldReadonly
                      class="col-12 col-md-6 col-lg-4 col-xl-4 mb-2"
                      label="Región AWS"
                      name="awsRegion"
                      value={viewParams.awsRegion}
                    />
                    <FormFieldReadonly
                      class="col-12 col-md-6 col-lg-4 col-xl-4 mb-2"
                      label="Región Azure"
                      name="azrRegion"
                      value={viewParams.azrRegion}
                    />
                    <FormFieldReadonly
                      class="col-12 col-md-6 col-lg-4 col-xl-4 mb-2"
                      label="Región GCP"
                      name="gcpRegion"
                      value={viewParams.gcpRegion}
                    />
                  </div>
                </div>
                <div className="row g-3 mt-1">
                  <hr />
                </div>
                {/* Datos de instancias */}
                {viewForm.instancesEncoded && (
                  <div className="modal-body row g-1">
                    <div className="col-12">
                      <div className="mt-5">
                        <h2 className="mb-4">
                          Resultados de Cálculo{" "}
                          <span className="tiny-text">(precios mensuales)</span>
                        </h2>
                        <InfraResultsTable
                          provider="AWS"
                          instances={viewInstances.aws}
                          currency={viewParams.currency}
                        />
                        <InfraResultsTable
                          provider="AZR"
                          instances={viewInstances.azr}
                          currency={viewParams.currency}
                        />
                        <InfraResultsTable
                          provider="GCP"
                          instances={viewInstances.gcp}
                          currency={viewParams.currency}
                        />
                        <InfraResultsTable
                          provider="OCI"
                          instances={viewInstances.oci}
                          currency={viewParams.currency}
                        />
                        <InfraSummaryTable
                          instances={viewInstances}
                          currency={viewParams.currency}
                        />
                        <InfraResultsChart
                          instances={viewInstances}
                          currency={viewParams.currency}
                        />
                      </div>
                    </div>
                  </div>
                )}
                {/* Cierre Final */}
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowViewModal(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectManagement;
