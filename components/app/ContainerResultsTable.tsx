import { FunctionComponent } from "preact";
import { InfraInstancePrice } from "../../types.ts";
import InfraFamilyInfo from "../../islands/app/InfraFamilyInfo.tsx";

interface InfraResultsTableProps {
  provider: string;
  instances: InfraInstancePrice[];
  currency: string;
}

const InfraResultsTable: FunctionComponent<InfraResultsTableProps> = (
  props: InfraResultsTableProps,
) => {
  const totalPrices = props.instances.map((i) => i.totalPrice);
  const maxTotal = Math.max(...totalPrices);
  const minTotal = Math.min(...totalPrices);

  return (
    <div className="mt-5">
      <div className="d-flex align-items-center mb-3">
        <img
          src={`/images/cloud${props.provider}.png`}
          alt={`cloud${props.provider} icon`}
          style={{ width: "40px", height: "40px", marginRight: "0.75em" }}
        />
        <h4 className="mb-0">
          {props.instances.length} Instancias en {props.provider}
        </h4>
        <InfraFamilyInfo cloud={props.provider} />
      </div>

      <div className="table-responsive shadow-sm rounded">
        <table className="table table-sm table-bordered table-hover align-middle small">
          <thead className="text-center table-primary">
            <tr>
              <th>Nombre Familia</th>
              <th>Tipo</th>
              <th>Nombre Instancia</th>
              <th>Srv (#)</th>
              <th>vCPUs (#)</th>
              <th>Mem. (GB)</th>
              <th>Boot (GB)</th>
              <th>Almac. (GB)</th>
              <th>Backup (GB)</th>
              <th>Infra ({props.currency})</th>
              <th>Boot ({props.currency})</th>
              <th>Almac. ({props.currency})</th>
              <th>Backup ({props.currency})</th>
              <th>Tráfico ({props.currency})</th>
              <th>K8s ({props.currency})</th>
              <th>Total ({props.currency})</th>
            </tr>
          </thead>
          <tbody>
            {props.instances.map((instance, index) => {
              const rowClass = instance.totalPrice === minTotal
                ? "table-success"
                : instance.totalPrice === maxTotal
                ? "table-danger"
                : "";

              return (
                <tr key={index} className={rowClass}>
                  <td>{instance.familyName}</td>
                  <td>{instance.familyUse}</td>
                  <td>{instance.instanceName}</td>
                  <td className="text-end">{instance.servers}</td>
                  <td className="text-end">{instance.vCpus}</td>
                  <td className="text-end">{instance.memory}</td>
                  <td className="text-end">{instance.boot}</td>
                  <td className="text-end">{instance.storage}</td>
                  <td className="text-end">{instance.backup}</td>
                  <td className="text-end">{instance.infraPrice.toFixed(2)}</td>
                  <td className="text-end">
                    {instance.bootPrice?.toFixed(2)}
                  </td>
                  <td className="text-end">
                    {instance.storagePrice.toFixed(2)}
                  </td>
                  <td className="text-end">
                    {instance.backupPrice.toFixed(2)}
                  </td>
                  <td className="text-end">
                    {instance.trafficPrice.toFixed(2)}
                  </td>
                  <td className="text-end">
                    {instance.k8sPrice?.toFixed(2)}
                  </td>
                  <td className="text-end fw-bold">
                    {instance.totalPrice.toFixed(2)}
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

export default InfraResultsTable;
