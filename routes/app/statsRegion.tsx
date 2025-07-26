import { Handlers, PageProps } from "$fresh/server.ts";
import { signal } from "@preact/signals";
import FormField from "../../components/app/FormField.tsx";
import * as form from "../../utils/form.ts";
import { ChartDataset, RegionalName } from "../../types.ts";
import StatsInfraChartByRegion from "../../islands/app/StatsInfraChartByRegion.tsx";
import StatsSelectRegion from "../../islands/app/StatsSelectRegion.tsx";
import * as db from "../../utils/db.ts";
import InfraFamilyInfo from "../../islands/app/InfraFamilyInfo.tsx";
import InfraInstanceInfo from "../../islands/app/InfraInstanceInfo.tsx";

interface FormData {
  values?: Record<string, string>;
  dataset?: ChartDataset[];
  errors?: string[];
  username?: string;
}

interface UserCtx {
  username: string;
}

export const handler: Handlers = {
  async POST(req, ctx) {
    const formData = await req.formData();
    const errors: string[] = [];
    const values: Record<string, string> = {};
    const username = (ctx.state.user as UserCtx).username ?? ""; //para posible personalización

    // Validar campos y selects
    form.validateFormSelectsStatsRegion(formData, errors, values);
    if (errors.length > 0) return ctx.render({ errors, values });

    //llamada a la API de busqueda de instancias
    try {
      //llama a /api/statsInfra con un GET y le envía los datos del formulario
      const response = await fetch(
        `${Deno.env.get("BACKEND_API_URL")}/api/statsInfra?searchBy=region&${
          new URLSearchParams(values).toString()
        }`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );
      if (!response.ok) {
        throw new Error("Error buscando precios de regiones");
      }
      const data = await response.json();
      return ctx.render({ values, dataset: data, username });
    } catch (error) {
      return ctx.render({
        errors: [`Error de red o servidor: ${error}`],
        values,
        username,
      });
    }
  },
};

function Page({ data }: PageProps<FormData>) {
  // Señal para actualizar el regianlName seleccionado
  const regionalNameSignal = signal<RegionalName>("Europa");
  const instance = data?.values !== undefined
    ? data.values?.cloud === "AWS"
      ? data.values?.awsInstance
      : (data.values?.cloud === "AZR")
      ? data.values?.azrInstance
      : (data.values?.cloud === "GCP")
      ? data.values?.gcpFamily
      : (data.values?.cloud === "OCI")
      ? data.values?.ociFamily
      : ""
    : "";
  //busca familyName de la instance seleccionada en la tabla InfraInstances
  const familyName = data?.values !== undefined
    ? data.values?.cloud === "AWS"
      ? db.InfraInstances.filter((i) =>
        i.instanceName === data.values?.awsInstance
      )[0]?.familyName
      : (data.values?.cloud === "AZR")
      ? db.InfraInstances.filter((i) =>
        i.instanceName === data.values?.azrInstance
      )[0]?.familyName
      : (data.values?.cloud === "GCP")
      ? data.values?.gcpFamily
      : (data.values?.cloud === "OCI")
      ? data.values?.ociFamily
      : ""
    : "";

  const cloud = data?.values !== undefined ? data.values?.cloud : "";
  const allRegions = [
    ...db.AmazonCloudRegions.map((r) => ({
      name: r.name,
      displayName: r.displayName,
      regionalName: r.regionalName,
    })),
    ...db.AzureCloudRegions.map((r) => ({
      name: r.name,
      displayName: r.displayName,
      regionalName: r.regionalName,
    })),
    ...db.GoogleCloudRegions.map((r) => ({
      name: r.name,
      displayName: r.displayName,
      regionalName: r.regionalName,
    })),
  ];

  return (
    <div>
      <main className="container mt-5">
        <h1 className="mb-4">
          Precios de Máquinas Virtuales por{" "}
          <span className="text-primary">Regiones</span>
        </h1>
        <form method="post" className="card shadow">
          <div className="card-body">
            <div className="row g-3">
              <FormField
                label="Cloud"
                name="cloud"
                type="select"
                options={form.CLOUD_PROVIDER}
                value={data?.values?.cloud ||
                  form.CLOUD_PROVIDER[0].value}
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
            </div>

            <div className="row g-3">
              <FormField
                label="Instancia AWS"
                class="col-12 col-md-6 col-lg-3 col-xl-3 mb-2"
                name="awsInstance"
                type="select"
                options={form.INFRA_INSTANCES_AWS}
                value={data?.values?.awsInstance ||
                  form.INFRA_INSTANCES_AWS[0].value}
              >
                <InfraFamilyInfo cloud="AWS" />
              </FormField>

              <FormField
                label="Instancia Azure"
                class="col-12 col-md-6 col-lg-3 col-xl-3 mb-2"
                name="azrInstance"
                type="select"
                options={form.INFRA_INSTANCES_AZR}
                value={data?.values?.azrInstance ||
                  form.INFRA_INSTANCES_AZR[0].value}
              >
                <InfraFamilyInfo cloud="AZR" />
              </FormField>

              <FormField
                label="Instancia base GCP"
                class="col-12 col-md-6 col-lg-3 col-xl-3 mb-2"
                name="gcpFamily"
                type="select"
                options={form.INFRA_FAMILIES_GCP}
                value={data?.values?.gcpFamily ||
                  form.INFRA_FAMILIES_GCP[0].value}
              >
                <InfraFamilyInfo cloud="GCP" />
              </FormField>

              <FormField
                label="Instancia base OCI"
                class="col-12 col-md-6 col-lg-3 col-xl-3 mb-2"
                name="ociFamily"
                type="select"
                options={form.INFRA_FAMILIES_OCI}
                value={data?.values?.ociFamily ||
                  form.INFRA_FAMILIES_OCI[0].value}
              >
                <InfraFamilyInfo cloud="OCI" />
              </FormField>
            </div>
          </div>
          <div className="card-footer">
            <button type="submit" className="btn btn-primary w-100">
              Generar Gráfico
            </button>
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

        {data?.dataset && (
          <div class="mt-5">
            <div className="d-flex align-items-center mb-4">
              <h2 class="mb-0">
                Resultados de la Búsqueda{" "}
                <span class="tiny-text">(precios por hora)</span>
              </h2>{" "}
              <span className="ms-0">
                <InfraInstanceInfo cloud={cloud} familyName={familyName} />
              </span>
            </div>
            <StatsSelectRegion regionalNameSignal={regionalNameSignal} />
            <StatsInfraChartByRegion
              dataset={data.dataset}
              currency={data.values?.currency ?? "USD"}
              title={`Histórico de precios en ${cloud} para ${instance}`}
              regionalNameSignal={regionalNameSignal}
              allRegions={allRegions}
            />
          </div>
        )}
      </main>
    </div>
  );
}

export default Page;
