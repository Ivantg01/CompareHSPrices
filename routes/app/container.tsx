import { Handlers, PageProps } from "$fresh/server.ts";
import FormField from "../../components/app/FormField.tsx";
import { InfraInstancesPriceGroup } from "../../types.ts";
import ContainerResultsTable from "../../components/app/ContainerResultsTable.tsx";
import ContainerSummaryTable from "../../components/app/ContainerSummaryTable.tsx";
import InfraResultsChart from "../../islands/app/InfraResultsChart.tsx";
import SaveProject from "../../islands/app/SaveProject.tsx";
import * as form from "../../utils/form.ts";

interface FormData {
  values?: Record<string, string>;
  instances?: InfraInstancesPriceGroup;
  errors?: string[];
  username?: string;
}

interface UserCtx {
  username: string;
}

export const handler: Handlers<FormData> = {
  async POST(req, ctx) {
    const formData = await req.formData();
    const errors: string[] = [];
    const values: Record<string, string> = {};
    const username = (ctx.state.user as UserCtx).username ?? ""; //para grabar el proyecto

    // Validar campos numéricos y selects
    form.validateFormFields(formData, errors, values);
    form.validateFormSelects(formData, errors, values);
    if (errors.length > 0) return ctx.render({ errors, values });

    //llamada a la API de busqueda de instancias
    try {
      //llama a /api/infra con un POST y le envía los datos del formulario
      const response = await fetch(
        `${Deno.env.get("BACKEND_API_URL")}/api/infra`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...values,
          }),
        },
      );
      if (!response.ok) {
        throw new Error("Error buscando infraestructura");
      }

      const data = await response.json();
      return ctx.render({ values, instances: data.instances, username });
    } catch (error) {
      return ctx.render({
        errors: [`Error de red o servidor: ${error}`],
        values,
      });
    }
  },
};

export default function Page({ data }: PageProps<FormData>) {
  return (
    <div class="container mt-5">
      <h1 class="mb-4">
        Comparador de <span class="text-primary">Contenedores Kubernetes</span>
      </h1>

      <form method="post" class="card shadow">
        <div class="card-body">
          <div className="row g-3">
            <FormField
              label="Nº nodos"
              name="servers"
              value={data?.values?.servers || "1"}
            />
            <FormField
              label="Nº vCPUs"
              name="vCpus"
              value={data?.values?.vCpus || "4"}
            />
            <FormField
              label="GB Memoria"
              name="memory"
              value={data?.values?.memory || "16"}
            />
            <FormField
              label="GB Disco Boot"
              name="boot"
              value={data?.values?.boot || "64"}
            />
            <FormField
              label="GB Disco almac."
              name="storage"
              value={data?.values?.storage || "512"}
            />
            <FormField
              label="GB Backup"
              name="backup"
              value={data?.values?.backup || "2048"}
            />
            <FormField
              label="GB Tráfico/mes"
              name="traffic"
              value={data?.values?.traffic || "1000"}
            />
            <FormField
              label="Nº Horas/mes"
              name="hours"
              value={data?.values?.hours || "720"}
            />

            <FormField
              label="Redundancia"
              name="redundancy"
              type="select"
              options={form.REDUNDANCY_TYPES}
              value={data?.values?.redundancy || form.REDUNDANCY_TYPES[0].value}
            />

            <FormField
              label="Tipo almac."
              name="storageType"
              type="select"
              options={form.STORAGE_TYPES}
              value={data?.values?.storageType || form.STORAGE_TYPES[0].value}
            />

            <FormField
              label="Reserva"
              name="reservation"
              type="select"
              options={form.RESERVATIONS}
              value={data?.values?.reservation || form.RESERVATIONS[0].value}
            />

            <FormField
              label="Moneda"
              name="currency"
              type="select"
              options={form.CURRENCIES}
              value={data?.values?.currency || form.CURRENCIES[0].value}
            />

            <FormField
              label="Uso"
              name="familyUse"
              type="select"
              options={form.FAMILY_USE}
              value={data?.values?.familyUse || form.FAMILY_USE[0].value}
            />
          </div>

          <div className="row g-3 mt-1">
            <hr />
          </div>

          <div className="row g-3">
            <FormField
              label="Región AWS"
              class="col-12 col-md-6 col-lg-4 col-xl-4 mb-2"
              name="awsRegion"
              type="select"
              options={form.CLOUD_REGIONS_AWS}
              value={data?.values?.awsRegion || "eu-south-2"}
            />

            <FormField
              label="Región Azure"
              class="col-12 col-md-6 col-lg-4 col-xl-4 mb-2"
              name="azrRegion"
              type="select"
              options={form.CLOUD_REGIONS_AZR}
              value={data?.values?.azrRegion || "spaincentral"}
            />

            <FormField
              label="Región GCP"
              class="col-12 col-md-6 col-lg-4 col-xl-4 mb-2"
              name="gcpRegion"
              type="select"
              options={form.CLOUD_REGIONS_GCP}
              value={data?.values?.gcpRegion || "europe-southwest1"}
            />
          </div>
        </div>
        <div class="card-footer">
          <button type="submit" class="btn btn-primary w-100">
            Calcular Instancias
          </button>
          {data?.instances && (
            <SaveProject
              type="K8"
              instances={data.instances}
              values={data?.values}
              username={data?.username || ""}
            />
          )}
        </div>
      </form>

      {data?.errors && (
        <div class="alert alert-danger mt-4">
          <h5>Errores:</h5>
          <ul>
            {data.errors.map((error, index) => <li key={index}>{error}</li>)}
          </ul>
        </div>
      )}

      {data?.instances && (
        <div class="mt-5">
          <h2 class="mb-4">
            Resultados de Cálculo{" "}
            <span class="tiny-text">(precios mensuales)</span>
          </h2>
          <ContainerResultsTable
            provider="AWS"
            instances={data.instances.aws}
            currency={data.values?.currency || "USD"}
          />
          <ContainerResultsTable
            provider="AZR"
            instances={data.instances.azr}
            currency={data.values?.currency || "USD"}
          />
          <ContainerResultsTable
            provider="GCP"
            instances={data.instances.gcp}
            currency={data.values?.currency || "USD"}
          />
          <ContainerResultsTable
            provider="OCI"
            instances={data.instances.oci}
            currency={data.values?.currency || "USD"}
          />
          <ContainerSummaryTable
            instances={data.instances}
            currency={data.values?.currency ?? "USD"}
          />
          <InfraResultsChart
            instances={data.instances}
            currency={data.values?.currency ?? "USD"}
          />
        </div>
      )}
    </div>
  );
}
