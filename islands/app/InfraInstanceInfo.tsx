import { useState } from "preact/hooks";
import { InfraInstance } from "../../types.ts";

interface Props {
  cloud: string;
  familyName: string;
}

export default function InfraInstanceInfo({ cloud, familyName }: Props) {
  const [open, setOpen] = useState(false);
  const [instances, setInstances] = useState<InfraInstance[] | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInfraInstances: () => Promise<void> = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/infraInstance?cloud=${cloud}&familyName=${familyName}&orderBy=vCpuMin&orderDir=asc`,
      );
      if (response.ok) {
        const data = await response.json();
        setInstances(data);
      } else {
        setInstances([]);
      }
    } catch (error) {
      console.error("Error reading infra instances:", error);
      setInstances([]);
    } finally {
      setLoading(false);
    }
  };

  // Maneja la apertura del modal y carga los datos si es necesario
  const handleToggle = async () => {
    setOpen(true);
    if (instances === null && !loading) {
      await fetchInfraInstances();
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
                  Instancias de la familia {familyName} ({cloud})
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
                {!loading && instances && instances.length === 0 && (
                  <div class="text-danger">No hay datos disponibles.</div>
                )}
                {!loading && instances && instances.length > 0 && (
                  <div class="table-responsive">
                    <table class="table table-striped table-hover align-middle">
                      <thead class="table-primary">
                        <tr>
                          <th>Familia</th>
                          <th>vCPUs (min-max)</th>
                          <th>Memoria (min-max)</th>
                          <th>Disco local</th>
                        </tr>
                      </thead>
                      <tbody>
                        {instances.map((fam) => (
                          <tr>
                            <td>{fam.instanceName}</td>
                            <td>{fam.vCpuMin} - {fam.vCpuMax}</td>
                            <td>{fam.memoryMin} - {fam.memoryMax}</td>
                            <td>{fam.localDiskType}</td>
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
