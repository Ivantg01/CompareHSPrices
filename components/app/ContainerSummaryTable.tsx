import { FunctionComponent } from "preact";
import { InfraInstancePrice } from "../../types.ts";

interface InfraSummaryTableProps {
  instances: {
    aws: InfraInstancePrice[];
    azr: InfraInstancePrice[];
    gcp: InfraInstancePrice[];
    oci: InfraInstancePrice[];
  };
  currency: string;
}

const ContainerSummaryTable: FunctionComponent<InfraSummaryTableProps> = (
  { instances, currency },
) => {
  const providers = ["AWS", "AZR", "GCP", "OCI"];

  const getCheapestInstance = (list: InfraInstancePrice[]) =>
    list.reduce(
      (min, inst) => inst.totalPrice < min.totalPrice ? inst : min,
      list[0],
    );

  // Construimos el objeto solo si hay instancias disponibles
  const cheapestByProvider: Partial<Record<string, InfraInstancePrice>> = {};
  if (instances.aws?.length) {
    cheapestByProvider.AWS = getCheapestInstance(instances.aws);
  }
  if (instances.azr?.length) {
    cheapestByProvider.AZR = getCheapestInstance(instances.azr);
  }
  if (instances.gcp?.length) {
    cheapestByProvider.GCP = getCheapestInstance(instances.gcp);
  }
  if (instances.oci?.length) {
    cheapestByProvider.OCI = getCheapestInstance(instances.oci);
  }
  const allInstances = Object.values(cheapestByProvider);
  const minPrice = Math.min(...allInstances.map((i) => i?.totalPrice ?? 0));
  const maxPrice = Math.max(...allInstances.map((i) => i?.totalPrice ?? 0));

  return (
    <div className="mt-5">
      <h4 className="mb-3">Instancia más barata por proveedor</h4>
      <div className="table-responsive shadow-sm rounded">
        <table className="table table-sm table-bordered table-hover align-middle small">
          <thead className="table-dark text-center">
            <tr>
              <th>Proveedor</th>
              <th>Nombre Familia</th>
              <th>Tipo</th>
              <th>Nombre Instancia</th>
              <th>Nodos (#)</th>
              <th>vCPUs</th>
              <th>Mem. (GB)</th>
              <th>Boot (GB)</th>
              <th>Almac. (GB)</th>
              <th>Backup (GB)</th>
              <th>Tráfico (GB)</th>
              <th>Total ({currency})</th>
            </tr>
          </thead>
          <tbody>
            {providers.map((provider) => {
              const inst =
                cheapestByProvider[provider as keyof typeof cheapestByProvider];
              if (!inst) {
                return (
                  <tr key={provider} className="table-warning">
                    <td className="fw-bold">{provider}</td>
                    <td colSpan={10} className="text-center text-muted">
                      No hay instancias disponibles
                    </td>
                  </tr>
                );
              }
              const rowClass = inst.totalPrice === minPrice
                ? "table-success"
                : inst.totalPrice === maxPrice
                ? "table-danger"
                : "";
              return (
                <tr key={provider} className={rowClass}>
                  <td className="fw-bold">{provider}</td>
                  <td>{inst.familyName}</td>
                  <td>{inst.familyUse}</td>
                  <td>{inst.instanceName}</td>
                  <td className="text-end">{inst.servers}</td>
                  <td className="text-end">{inst.vCpus}</td>
                  <td className="text-end">{inst.memory}</td>
                  <td className="text-end">{inst.boot}</td>
                  <td className="text-end">{inst.storage}</td>
                  <td className="text-end">{inst.backup}</td>
                  <td className="text-end">{inst.traffic}</td>
                  <td className="text-end fw-bold">
                    {inst.totalPrice.toFixed(2)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ContainerSummaryTable;
