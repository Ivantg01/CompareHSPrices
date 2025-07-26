import { useEffect, useState } from "preact/hooks";
import { FunctionComponent } from "preact";
import { Signal } from "@preact/signals";
import { Region } from "../../types.ts";

interface RegionProps {
  cloudRegion: Signal<string>;
}

const orderableFields = [
  "name",
  "regionalDisplayName",
  "regionalName",
  "active",
] as const;
type OrderField = typeof orderableFields[number];

const RegionManagement: FunctionComponent<RegionProps> = (
  { cloudRegion }: RegionProps,
) => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [regionToDelete, setRegionToDelete] = useState<Region | null>(
    null,
  );
  const [regionToEdit, setRegionToEdit] = useState<Region | null>(null);
  const [editForm, setEditForm] = useState<Partial<Region>>({});
  const [orderBy, setOrderBy] = useState<OrderField>("name");
  const [orderDir, setOrderDir] = useState<"asc" | "desc">("asc");

  // Fetch regions from API
  const fetchRegions = async (
    field: OrderField = orderBy,
    dir: "asc" | "desc" = orderDir,
  ) => {
    try {
      console.log(
        `Fetching regions for cloud: ${cloudRegion.value}, orderBy: ${field}, orderDir: ${dir}`,
      );
      const response = await fetch(
        `/api/region?cloud=${cloudRegion.value}&orderBy=${field}&orderDir=${dir}`,
      );
      if (!response.ok) throw new Error("Error fetching regions");
      const data = await response.json();
      setRegions(data);
      setOrderBy(field);
      setOrderDir(dir);
    } catch (err) {
      console.error("Error reading regions:", err);
    }
  };

  useEffect(() => {
    fetchRegions();
  }, [cloudRegion.value]);

  const handleSort = (field: OrderField) => {
    let dir: "asc" | "desc" = "asc";
    if (orderBy === field) {
      dir = orderDir === "asc" ? "desc" : "asc";
    }
    fetchRegions(field, dir);
  };

  const toggleActive = async (region: Region) => {
    try {
      const response = await fetch("/api/region", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cloud: cloudRegion.value,
          id: region.id,
          active: !region.active,
        }),
      });
      if (response.ok) {
        setRegions((prev) =>
          prev.map((c) => c.id === region.id ? { ...c, active: !c.active } : c)
        );
      }
    } catch (err) {
      console.error("Error updating regions:", err);
    }
  };

  const openDeleteModal = (region: Region) => {
    setRegionToDelete(region);
    setShowDeleteModal(true);
  };

  const openEditModal = (region: Region) => {
    setRegionToEdit(region);
    setEditForm({
      id: region.id,
      name: region.name,
      displayName: region.displayName,
      regionalDisplayName: region.regionalDisplayName,
      regionalName: region.regionalName,
      active: region.active,
    });
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    if (!regionToDelete) return;
    try {
      const response = await fetch("/api/region", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: regionToDelete.id }),
      });
      if (response.ok) {
        setRegions(
          regions.filter((region) => region.id !== regionToDelete.id),
        );
      } else {
        alert("Error al eliminar la region");
      }
    } catch (error) {
      console.error(`Error deleting region ${regionToDelete.id}:`, error);
    }
    setShowDeleteModal(false);
    setRegionToDelete(null);
  };

  const handleEditSubmit = async (e: Event) => {
    e.preventDefault();
    if (!regionToEdit) return;
    try {
      const response = await fetch(`/api/region`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (response.ok) {
        // Actualiza el estado local con editForm, combinando los datos existentes
        setRegions(
          regions.map((u) =>
            u.id === regionToEdit.id ? { ...u, ...editForm } : u
          ),
        );
        setShowEditModal(false);
        setRegionToEdit(null);
      } else {
        alert("Error al actualizar la region");
      }
    } catch (error) {
      console.error("Error updating region:", error);
    }
  };

  if (regions.length === 0) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <div className="text-center py-4">No hay region registradas.</div>
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
                    ? "Nombre"
                    : field === "regionalDisplayName"
                    ? "Nombre regional"
                    : field !== "regionalName"
                    ? field === "active" ? "Activo" : "Actualización"
                    : "Geografía"}
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
            {regions.map((region) => (
              <tr key={region.id}>
                <td className="text-center align-middle">
                  {region.name}
                </td>
                <td className="text-center align-middle">
                  {region.regionalDisplayName}
                </td>
                <td className="text-center align-middle">
                  {region.regionalName}
                </td>
                <td className="text-center align-middle">
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      region.active
                        ? "btn-outline-success"
                        : "btn-outline-secondary"
                    }`}
                    onClick={() => toggleActive(region)}
                  >
                    {region.active ? "Activo" : "Inactivo"}
                  </button>
                </td>
                <td className="text-center align-middle">
                  <div className="d-flex gap-2 justify-content-center">
                    <button
                      onClick={() => openEditModal(region)}
                      type="button"
                      className="btn btn-sm btn-outline-primary rounded-circle"
                      data-bs-toggle="tooltip"
                      title="Editar region"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      onClick={() => openDeleteModal(region)}
                      type="button"
                      className="btn btn-sm btn-outline-danger rounded-circle"
                      data-bs-toggle="tooltip"
                      title="Eliminar region"
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
      {showDeleteModal && regionToDelete && (
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
                ¿Estás seguro de eliminar la región {regionToDelete.name}?
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
      {showEditModal && regionToEdit && (
        <div
          className="modal show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content text-start">
              <div className="modal-header">
                <h5 className="modal-title">Editar región</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowEditModal(false)}
                >
                </button>
              </div>
              <form onSubmit={handleEditSubmit}>
                <div className="modal-body row gx-3">
                  <div className="mb-3 d-flex justify-content-between">
                    <div className="col">
                      <label className="form-label">Name</label>
                      <input
                        type="text"
                        className="form-control readonly-highlight"
                        value={regionToEdit.name}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={editForm.active}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            active: e.currentTarget.checked,
                          })}
                      />
                      <label className="form-check-label">Activo</label>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Nombre regional</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.regionalDisplayName || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          regionalDisplayName: e.currentTarget.value,
                        })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Geografía</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.regionalName || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          regionalName: e.currentTarget.value,
                        })}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={editForm.name === "" ||
                      editForm.regionalDisplayName === ""}
                  >
                    Guardar cambios
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

export default RegionManagement;
