import { useEffect, useState } from "preact/hooks";
import { FunctionComponent } from "preact";
import { Currency } from "../../types.ts";

const orderableFields = ["code", "name", "rate", "active", "date"] as const;
type OrderField = typeof orderableFields[number];

const CurrencyManagement: FunctionComponent = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currencyToDelete, setCurrencyToDelete] = useState<Currency | null>(
    null,
  );
  const [currencyToEdit, setCurrencyToEdit] = useState<Currency | null>(null);
  const [editForm, setEditForm] = useState<Partial<Currency>>({});
  const [orderBy, setOrderBy] = useState<OrderField>("code");
  const [orderDir, setOrderDir] = useState<"asc" | "desc">("asc");

  // Fetch currencies from API
  const fetchCurrencies = async (
    field: OrderField = orderBy,
    dir: "asc" | "desc" = orderDir,
  ) => {
    try {
      const response = await fetch(
        `/api/currency?orderBy=${field}&orderDir=${dir}`,
      );
      if (!response.ok) throw new Error("Error fetching currencies");
      const data = await response.json();
      setCurrencies(data);
      setOrderBy(field);
      setOrderDir(dir);
    } catch (err) {
      console.error("Error reading currencies:", err);
    }
  };

  useEffect(() => {
    fetchCurrencies();
  }, []);

  const handleSort = (field: OrderField) => {
    let dir: "asc" | "desc" = "asc";
    if (orderBy === field) {
      dir = orderDir === "asc" ? "desc" : "asc";
    }
    fetchCurrencies(field, dir);
  };

  const toggleActive = async (currency: Currency) => {
    try {
      const response = await fetch("/api/currency", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: currency.id, active: !currency.active }),
      });
      if (response.ok) {
        setCurrencies((prev) =>
          prev.map((c) =>
            c.id === currency.id ? { ...c, active: !c.active } : c
          )
        );
      }
    } catch (err) {
      console.error("Error updating currencies:", err);
    }
  };

  const openDeleteModal = (currency: Currency) => {
    setCurrencyToDelete(currency);
    setShowDeleteModal(true);
  };

  const openEditModal = (currency: Currency) => {
    setCurrencyToEdit(currency);
    setEditForm({
      id: currency.id,
      code: currency.code,
      name: currency.name,
      rate: currency.rate,
      date: currency.date,
      active: currency.active,
    });
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    if (!currencyToDelete) return;
    try {
      const response = await fetch("/api/currency", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: currencyToDelete.id }),
      });
      if (response.ok) {
        setCurrencies(
          currencies.filter((currency) => currency.id !== currencyToDelete.id),
        );
      } else {
        alert("Error al eliminar la moneda");
      }
    } catch (error) {
      console.error(`Error deleting currency ${currencyToDelete.id}:`, error);
    }
    setShowDeleteModal(false);
    setCurrencyToDelete(null);
  };

  const handleEditSubmit = async (e: Event) => {
    e.preventDefault();
    if (!currencyToEdit) return;
    try {
      const response = await fetch(`/api/currency`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (response.ok) {
        // Actualiza el estado local con editForm, combinando los datos existentes
        setCurrencies(
          currencies.map((u) =>
            u.id === currencyToEdit.id ? { ...u, ...editForm } : u
          ),
        );
        setShowEditModal(false);
        setCurrencyToEdit(null);
      } else {
        alert("Error al actualizar la moneda");
      }
    } catch (error) {
      console.error("Error updating currency:", error);
    }
  };

  if (currencies.length === 0) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <div className="text-center py-4">No hay monedas registradas.</div>
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
                  {field === "code"
                    ? "Código"
                    : field === "name"
                    ? "Nombre"
                    : field === "rate"
                    ? "Tasa"
                    : field === "active"
                    ? "Activo"
                    : "Actualización"}
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
            {currencies.map((currency) => (
              <tr key={currency.id}>
                <td className="text-center align-middle">
                  {currency.code}
                </td>
                <td className="text-center align-middle">{currency.name}</td>
                <td className="text-center align-middle">
                  {currency.rate.toFixed(4)}
                </td>
                <td className="text-center align-middle">
                  <button
                    type="button"
                    className={`btn btn-sm ${
                      currency.active
                        ? "btn-outline-success"
                        : "btn-outline-secondary"
                    }`}
                    onClick={() => toggleActive(currency)}
                  >
                    {currency.active ? "Activo" : "Inactivo"}
                  </button>
                </td>
                <td className="text-center align-middle">
                  {new Date(currency.date).toLocaleDateString("es-ES", {
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
                  <div className="d-flex gap-2 justify-content-center">
                    <button
                      onClick={() => openEditModal(currency)}
                      type="button"
                      className="btn btn-sm btn-outline-primary rounded-circle"
                      data-bs-toggle="tooltip"
                      title="Editar moneda"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      onClick={() => openDeleteModal(currency)}
                      type="button"
                      className="btn btn-sm btn-outline-danger rounded-circle"
                      data-bs-toggle="tooltip"
                      title="Eliminar moneda"
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
      {showDeleteModal && currencyToDelete && (
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
                ¿Estás seguro de eliminar la moneda {currencyToDelete.code}?
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
      {showEditModal && currencyToEdit && (
        <div
          className="modal show d-block"
          style={{ background: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content text-start">
              <div className="modal-header">
                <h5 className="modal-title">Editar moneda</h5>
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
                      <label className="form-label">Moneda</label>
                      <input
                        type="text"
                        className="form-control readonly-highlight"
                        value={currencyToEdit.code}
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
                    <label className="form-label">Nombre</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.name || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          name: e.currentTarget.value,
                        })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Ratio</label>
                    <input
                      type="number"
                      step="0.00000000000001"
                      className="form-control"
                      value={editForm.rate || 0}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          rate: Number(e.currentTarget.value),
                        })}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Actualización</label>
                    <input
                      type="text"
                      className="form-control"
                      value={editForm.date || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          date: e.currentTarget.value,
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
                    disabled={editForm.rate === 0 || editForm.name === ""}
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

export default CurrencyManagement;
