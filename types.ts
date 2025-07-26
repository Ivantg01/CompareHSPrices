/** @module types */

// GUI User
export type User = {
  id: string;
  username: string;
  email: string;
  name: string;
  surname: string;
  password: string;
  role: string;
  active: boolean;
};

// GUI Currency
export type Currency = {
  id?: string;
  code: string;
  name: string;
  rate: number;
  date: string;
  active: boolean;
};

// GUI Cloud Region
/** Cloud Region type */
export type Region = {
  id?: string;
  cloud?: string;
  name: string;
  displayName: string;
  regionalDisplayName: string;
  regionalName: string;
  active: boolean;
};

export type RegionalName =
  | "África"
  | "América"
  | "Asia Pacífico"
  | "Europa"
  | "Oriente Medio"
  | "Todas";

//GUI Infra Families
export type InfraFamily = {
  id?: string;
  cloud: string;
  familyName: string;
  processor: string;
  use: boolean;
};

//GUI Infra Instance architecture description
export type InfraInstance = {
  id?: string;
  cloud: string;
  familyName: string;
  familyUse: string;
  instanceName: string;
  vCpuMin: number;
  vCpuMax: number;
  memoryMin: number;
  memoryMax: number;
  localDisk: boolean;
  localDiskType: string;
};

//GUI Infra instance search return data
export type InfraInstancePrice = {
  cloud: string;
  familyName: string;
  familyUse: string;
  instanceName: string;
  servers: number;
  vCpus: number;
  memory: number;
  storageType: string;
  boot?: number; // Opcional para contenedores
  storage: number;
  backup: number;
  traffic: number;
  infraPrice: number;
  bootPrice?: number; // Opcional para contenedores
  storagePrice: number;
  backupPrice: number;
  trafficPrice: number;
  k8sPrice?: number; // Opcional para contenedores
  totalPrice: number;
};

//Grupo de precios de instancias de Infra de todas las cloud
export type InfraInstancesPriceGroup = {
  aws: InfraInstancePrice[];
  azr: InfraInstancePrice[];
  gcp: InfraInstancePrice[];
  oci: InfraInstancePrice[];
};

// Form parameters for Infra and Container search
export interface FormParamsInfra {
  servers: number;
  vCpus: number;
  memory: number;
  boot?: number; // Opcional para contenedores
  storage: number;
  backup: number;
  traffic: number;
  hours: number;
  redundancy: string;
  storageType: string;
  reservation: string;
  currency: string;
  familyUse: string;
  awsRegion: string;
  azrRegion: string;
  gcpRegion: string;
}

// Form parameters for Database search
//crea un tipo FormParamsDatabase que extiende de FormParamsInfra sin boot
export interface FormParamsDatabase extends Omit<FormParamsInfra, "boot"> {
  softwareEdition: string;
  byol: string;
  highAvailability: string;
}

// Projectos grabados de comparativas
export interface Project {
  id?: string;
  username: string;
  name: string;
  type: "VM" | "K8" | "DB";
  paramsEncoded: string;
  instancesEncoded: string;
  createdAt: string;
  awsPrice?: number;
  azrPrice?: number;
  gcpPrice?: number;
  ociPrice?: number;
  currency: string;
}

// Dataset for charts
export interface ChartDataset {
  dateCode: string;
  label: string;
  value: number;
}
