import { useState } from "preact/hooks";
import { InfraFamily } from "../../types.ts";

interface Props {
  cloud: string;
}

export default function InfraFamilyInfo({ cloud }: Props) {
  const [open, setOpen] = useState(false);
  const [families, setFamilies] = useState<InfraFamily[] | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInfraFamilies: () => Promise<void> = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/infraFamily?cloud=${cloud}&orderBy=familyName&orderDir=asc`,
      );
      if (response.ok) {
        const data = await response.json();
        setFamilies(data);
      } else {
        setFamilies([]);
      }
    } catch (error) {
      console.error("Error reading infra families:", error);
      setFamilies([]);
    } finally {
      setLoading(false);
    }
  };

  // Maneja la apertura del modal y carga los datos si es necesario
  const handleToggle = async () => {
    setOpen(true);
    if (families === null && !loading) {
      await fetchInfraFamilies();
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <span
        role="button"
        tabIndex={0}
        class="ms-2"
        onClick={handleToggle}
        style={{ cursor: "pointer", color: "#0d6efd" }}
        aria-label="Mostrar información"
      >
        <i class="bi bi-info-circle-fill fs-6"></i>
      </span>

      {/* Modal */}
      {open && (
        <div
          class="modal fade show"
          style={{
            display: "block",
            background: "rgba(0,0,0,0.4)",
            zIndex: 1050,
          }}
          aria-modal="true"
          role="dialog"
        >
          <div class="modal-dialog modal-xl modal-dialog-centered">
            <div class="modal-content shadow-lg">
              <div class="modal-header bg-primary text-white">
                <h5 class="modal-title">
                  Familias de máquinas virtuales ({cloud})
                </h5>
                <button
                  type="button"
                  class="btn-close btn-close-white"
                  aria-label="Cerrar"
                  onClick={handleClose}
                >
                </button>
              </div>
              <div class="modal-body" style={{ background: "#f8f9fa" }}>
                {loading && <div class="text-center">Cargando...</div>}
                {!loading && families && families.length === 0 && (
                  <div class="text-danger">No hay datos disponibles.</div>
                )}
                {!loading && families && families.length > 0 && (
                  <div class="table-responsive">
                    <table class="table table-striped table-hover align-middle">
                      <thead class="table-primary">
                        <tr>
                          <th>Familia</th>
                          <th>Procesador</th>
                          <th>Uso</th>
                        </tr>
                      </thead>
                      <tbody>
                        {families.map((fam) => (
                          <tr>
                            <td>{fam.familyName}</td>
                            <td>{fam.processor}</td>
                            <td>{fam.use}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div class="modal-footer">
                <button
                  type="button"
                  class="btn btn-outline-primary"
                  onClick={handleClose}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {open && (
        <div
          class="modal-backdrop fade show"
          style={{ zIndex: 1040 }}
          onClick={handleClose}
        >
        </div>
      )}
    </>
  );
}
