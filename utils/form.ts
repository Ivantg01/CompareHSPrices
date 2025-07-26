import * as db from "./db.ts";

//Contenido de pares valores y display para los campos Select
export const CLOUD_REGIONS_AWS = db.AmazonCloudRegions.filter((region) =>
  region.active
).map((region) => ({
  value: region.name,
  display: region.regionalDisplayName,
}));

export const CLOUD_REGIONS_AZR = db.AzureCloudRegions.filter((region) =>
  region.active
).map((region) => ({
  value: region.name,
  display: region.regionalDisplayName,
}));

export const CLOUD_REGIONS_GCP = db.GoogleCloudRegions.filter((region) =>
  region.active
).map((region) => ({
  value: region.name,
  display: region.regionalDisplayName,
}));

export const CLOUD_REGIONS_OCI = [{ value: "ALL", display: "Todas" }];

export const INFRA_FAMILIES_AWS = db.InfraFamilies.filter((family) =>
  family.cloud === "AWS"
).map((family) => ({
  value: family.familyName,
  display: family.familyName,
}));

export const INFRA_FAMILIES_AZR = db.InfraFamilies.filter((family) =>
  family.cloud === "AZR"
).map((family) => ({
  value: family.familyName,
  display: family.familyName,
}));

export const INFRA_FAMILIES_GCP = db.InfraFamilies.filter((family) =>
  family.cloud === "GCP"
).map((family) => ({
  value: family.familyName,
  display: family.familyName,
}));

export const INFRA_FAMILIES_OCI = db.InfraFamilies.filter((family) =>
  family.cloud === "OCI" && !family.familyName.endsWith("db") &&
  family.familyName !== "ATP serverless" // Exclude db families and serverless
).map((family) => ({
  value: family.familyName,
  display: family.familyName,
}));

export const INFRA_INSTANCES_AWS = db.InfraInstances.filter((instance) =>
  instance.cloud === "AWS"
).map((instance) => ({
  value: instance.instanceName,
  display: instance.instanceName,
}));

export const INFRA_INSTANCES_AZR = db.InfraInstances.filter((instance) =>
  instance.cloud === "AZR"
).map((instance) => ({
  value: instance.instanceName,
  display: instance.instanceName,
}));

export const INFRA_INSTANCES_GCP = db.InfraInstances.filter((instance) =>
  instance.cloud === "GCP"
).map((instance) => ({
  value: instance.instanceName,
  display: instance.instanceName,
}));

export const INFRA_INSTANCES_OCI = db.InfraInstances.filter((instance) =>
  instance.cloud === "OCI"
).map((instance) => ({
  value: instance.instanceName,
  display: instance.instanceName,
}));

export const STORAGE_TYPES = [
  { value: "ssd", display: "SSD" },
  { value: "hdd", display: "HDD" },
  { value: "pssd", display: "Premium SSD" },
];

export const REDUNDANCY_TYPES = [
  { value: "LRS", display: "Local" },
  { value: "ZRS", display: "Regional" },
];

export const CURRENCIES = db.Currencies.filter((c) => c.active).map((c) => (
  { value: c.code, display: c.name }
));

export const RESERVATIONS = [
  { value: "od", display: "Bajo demanda" },
  { value: "1y", display: "1 año" },
  { value: "3y", display: "3 años" },
];

export const FAMILY_USE = [
  { value: "ALL", display: "Todos" },
  { value: "PG", display: "Propósito general" },
  { value: "PV", display: "Procesado variable" },
  { value: "OC", display: "Optimizado CPU" },
  { value: "OM", display: "Optimizado memoria" },
  { value: "OA", display: "Optimizado disco" },
];

export const DB_SW_EDITION = [
  { value: "SE", display: "Standard Edition" },
  { value: "EE", display: "Enterprise Edition" },
  { value: "HP", display: "Enterprise Edition High Performance" },
  { value: "EP", display: "Enterprise Edition Extreme Performance" },
];

export const YES_NO = [ //Bring Your Own License
  { value: "N", display: "No" },
  { value: "Y", display: "Sí" },
];

export const CLOUD_PROVIDER = [
  { value: "AWS", display: "AWS" },
  { value: "AZR", display: "Azure" },
  { value: "GCP", display: "GCP" },
  { value: "OCI", display: "OCI" },
];

//Comprueba los campos de tipo select del formulario de cloud
export function validateFormFields(
  formData: FormData,
  errors: string[],
  values: Record<string, string>,
) {
  // Validación de campos
  const numericFields = [
    "servers",
    "vCpus",
    "memory",
    "storage",
    "backup",
    "traffic",
    "hours",
  ];
  //añade boot como opcional para contenedores
  if (formData.get("boot")) {
    numericFields.push("boot");
  }

  // Validar campos numéricos
  numericFields.forEach((field) => {
    const value = formData.get(field)?.toString().trim();
    if (!value) {
      errors.push(`El campo ${field.replace("_", " ")} es requerido`);
    } else if (isNaN(Number(value))) {
      errors.push(`El campo ${field.replace("_", " ")} debe ser numérico`);
    }
    values[field] = value || "";
  });
}

//Comprueba los campos de tipo select del formulario de cloud
export function validateFormSelects(
  formData: FormData,
  errors: string[],
  values: Record<string, string>,
) {
  const selectFields = [
    { name: "redundancy", options: REDUNDANCY_TYPES },
    { name: "storageType", options: STORAGE_TYPES },
    { name: "currency", options: CURRENCIES },
    { name: "reservation", options: RESERVATIONS },
    { name: "familyUse", options: FAMILY_USE },
    { name: "awsRegion", options: CLOUD_REGIONS_AWS },
    { name: "azrRegion", options: CLOUD_REGIONS_AZR },
    { name: "gcpRegion", options: CLOUD_REGIONS_GCP },
  ];

  selectFields.forEach(({ name, options }) => {
    const value = formData.get(name)?.toString();
    const isValid = options.some((opt) => opt.value === value);
    if (!value || !isValid) {
      errors.push(`Selección inválida para ${name.replace("_", " ")}`);
    }
    values[name] = value || "";
  });
}

//Comprueba los campos de tipo select del formulario de cloud para base de datos
export function validateFormSelectsDatabase(
  formData: FormData,
  errors: string[],
  values: Record<string, string>,
) {
  const selectFields = [
    { name: "redundancy", options: REDUNDANCY_TYPES },
    { name: "storageType", options: STORAGE_TYPES },
    { name: "currency", options: CURRENCIES },
    { name: "reservation", options: RESERVATIONS },
    { name: "familyUse", options: FAMILY_USE },
    { name: "awsRegion", options: CLOUD_REGIONS_AWS },
    { name: "azrRegion", options: CLOUD_REGIONS_AZR },
    { name: "gcpRegion", options: CLOUD_REGIONS_GCP },
    { name: "softwareEdition", options: DB_SW_EDITION },
    { name: "byol", options: YES_NO },
    { name: "highAvailability", options: YES_NO },
  ];

  selectFields.forEach(({ name, options }) => {
    const value = formData.get(name)?.toString();
    const isValid = options.some((opt) => opt.value === value);
    if (!value || !isValid) {
      errors.push(`Selección inválida para ${name.replace("_", " ")}`);
    }
    values[name] = value || "";
  });
}

export function validateFormSelectsStatsInfra(
  formData: FormData,
  errors: string[],
  values: Record<string, string>,
) {
  const selectFields = [
    { name: "cloud", options: CLOUD_PROVIDER },
    { name: "currency", options: CURRENCIES },
    { name: "reservation", options: RESERVATIONS },
    { name: "awsFamily", options: INFRA_FAMILIES_AWS },
    { name: "azrFamily", options: INFRA_FAMILIES_AZR },
    { name: "gcpFamily", options: INFRA_FAMILIES_GCP },
    { name: "ociFamily", options: INFRA_FAMILIES_OCI },
    { name: "awsRegion", options: CLOUD_REGIONS_AWS },
    { name: "azrRegion", options: CLOUD_REGIONS_AZR },
    { name: "gcpRegion", options: CLOUD_REGIONS_GCP },
  ];

  selectFields.forEach(({ name, options }) => {
    const value = formData.get(name)?.toString();
    const isValid = options.some((opt) => opt.value === value);
    if (!value || !isValid) {
      errors.push(`Selección inválida para ${name.replace("_", " ")}`);
    }
    values[name] = value || "";
  });
}

export function validateFormSelectsStatsRegion(
  formData: FormData,
  errors: string[],
  values: Record<string, string>,
) {
  const selectFields = [
    { name: "cloud", options: CLOUD_PROVIDER },
    { name: "currency", options: CURRENCIES },
    { name: "reservation", options: RESERVATIONS },
    { name: "awsInstance", options: INFRA_INSTANCES_AWS },
    { name: "azrInstance", options: INFRA_INSTANCES_AZR },
    { name: "gcpFamily", options: INFRA_FAMILIES_GCP },
    { name: "ociFamily", options: INFRA_FAMILIES_OCI },
  ];

  selectFields.forEach(({ name, options }) => {
    const value = formData.get(name)?.toString();
    const isValid = options.some((opt) => opt.value === value);
    if (!value || !isValid) {
      errors.push(`Selección inválida para ${name.replace("_", " ")}`);
    }
    values[name] = value || "";
  });
}
