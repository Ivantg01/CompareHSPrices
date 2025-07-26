import { FormParamsDatabase, InfraInstance } from "../types.ts";
import * as log from "@std/log";
import DatabaseInstanceModel from "../models/DatabaseInstance.ts";
import AmazonCloudPriceModel from "../models/AmazonCloudPrice.ts";
import AzureCloudPriceModel from "../models/AzureCloudPrice.ts";
import GoogleCloudPriceModel from "../models/GoogleCloudPrice.ts";
import OracleCloudPriceModel from "../models/OracleCloudPrice.ts";
import { cloudStorageCodes } from "./dbDefaultContent.ts";

// Buscar todas las instancias que cumplan los requisitos mínimos
export const searchValidDatabaseInstances = async (
  vCpus: number,
  memory: number,
) => {
  const validInstances = await DatabaseInstanceModel.find({
    vCpuMax: { $gte: vCpus },
    memoryMax: { $gte: memory },
  }).lean();
  log.debug(
    `Instancias válidas encontradas (vCPUs ${vCpus}, memoria: ${memory}): ${validInstances.length}`,
  );
  // Seleccionar la instancia más pequeña por familia
  const uniqueByFamily = Object.values(
    validInstances.reduce((acc, inst) => {
      const key = inst.familyName;
      const current = acc[key];
      if (
        !current ||
        inst.vCpuMin < current.vCpuMin ||
        (inst.vCpuMin === current.vCpuMin &&
          inst.memoryMin < current.memoryMin)
      ) {
        acc[key] = inst;
      }
      return acc;
    }, {} as Record<string, typeof validInstances[0]>),
  );
  return uniqueByFamily;
};

/** CALCULADORAS DE PRECIO DE BASE DE DATOS, pago por hora y servidor */

//Calcula el precio del servicio de base de datos para una instancia concreta
export const calculateDatabasePrice = async (
  inst: InfraInstance,
  params: FormParamsDatabase,
): Promise<number> => {
  switch (inst.cloud) {
    case "AWS":
      return await calculateDatabasePriceAws(inst, params);
    case "AZR":
      return await calculateDatabasePriceAzr(inst, params);
    case "GCP":
      return await calculateDatabasePriceGcp(inst, params);
    case "OCI":
      return await calculateDatabasePriceOci(inst, params);
    default:
      log.error(`Cloud desconocida para calculateDatabasePrice: ${inst.cloud}`);
      return 0;
  }
};

const calculateDatabasePriceAws = async (
  inst: InfraInstance,
  params: FormParamsDatabase,
): Promise<number> => {
  //Ej. searchCode = eu-west-3/rds/cmp/db.r6i.2xlarge/od/Single-AZ  Multi-Az = 2*Single-Az = 2x servers
  const searchCode =
    `${params.awsRegion}/rds/cmp/${inst.instanceName}/${params.reservation}/Single-AZ`;
  const result = await AmazonCloudPriceModel.findOne({ searchCode }, {
    price: 1,
  });
  if (result?.price != null) {
    return result.price * params.servers * params.hours;
  }
  return 0;
};

const calculateDatabasePriceAzr = async (
  inst: InfraInstance,
  params: FormParamsDatabase,
): Promise<number> => {
  //Ej. searchCode = germanywestcentral/sql/cpu/D4s_v3/od
  //elimina de params.instanceName el prefijo "Standard_" Ej Standard_A8m_v2
  const instanceName = inst.instanceName.replace("Standard_", "");
  const searchCode =
    `${params.azrRegion}/sql/cpu/${instanceName}/${params.reservation}`;
  const result = await AzureCloudPriceModel.findOne({ searchCode }, {
    price: 1,
  });
  if (result?.price != null) {
    if (params.reservation === "od") {
      return result.price * params.servers * params.hours;
    } else if (params.reservation === "1y") { // Si es 1 año, se divide entre las horas de 1 año
      return (result.price / (365 * 24)) * params.servers * params.hours;
    } else if (params.reservation === "3y") { // Si es 3 años, se divide entre las horas de 3 años
      return (result.price / (3 * 365 * 24)) * params.servers * params.hours;
    }
  }
  return 0;
};

// Calcula el precio de la base de datos para Google Cloud Platform
// Se suma el coste separado de la CPU y la RAM, por sus GB correspondientes * nº servers
const calculateDatabasePriceGcp = async (
  inst: InfraInstance,
  params: FormParamsDatabase,
): Promise<number> => {
  //no hay descuentos por reserva
  if (params.reservation !== "od") return 0;
  //Ej. searchCode = europe-west3/sql/app/cpu//zonal o regional (regiona = zonal x 2 = 2 servers)
  //Google separa la CPU de la RAM en dos precios SKU
  let searchCode = `${params.gcpRegion}/sql/app/cpu//zonal`;
  const resultCpu = await GoogleCloudPriceModel.findOne({ searchCode }, {
    price: 1,
  });
  //Ej. searchCode = europe-west3/sql/app/ram//zonal
  searchCode = `${params.gcpRegion}/sql/app/ram//zonal`;
  const resultRam = await GoogleCloudPriceModel.findOne({ searchCode }, {
    price: 1,
  });
  if (resultCpu?.price != null && resultRam?.price != null) {
    return (resultCpu.price * Math.max(params.vCpus, inst.vCpuMin) +
      resultRam.price * Math.max(params.memory, inst.memoryMin)) *
      params.servers * params.hours;
  }
  return 0;
};

//En OCI 1 OCPU = 2 vCPUs. El precio base de datos se compone de OCPU + RAM
const calculateDatabasePriceOci = async (
  inst: InfraInstance,
  params: FormParamsDatabase,
): Promise<number> => {
  const codeMap = {
    "B90569": "SE",
    "B90570": "EE",
    "B90571": "HP",
    "B90572": "EP",
    "B90573": "BYOL",
  };
  function getCodeByDesc(desc: string | undefined): string | undefined {
    return Object.keys(codeMap).find((code) =>
      desc?.endsWith(codeMap[code as keyof typeof codeMap])
    );
  }
  //Dos grupos: Autonomous ATP serverless y las VMs
  let partNumber;
  if (inst.familyName === "ATP serverless") {
    //B95702 Oracle Autonomous Transaction Processing - ECPU
    //B95704 Oracle Autonomous Transaction Processing - ECPU BYOL
    partNumber = (params.byol === "Y") ? "B95702" : "B95704";
  } else {
    //B90573 Oracle Autonomous Data Warehouse - ECPU - BYOL
    partNumber = (params.byol === "Y")
      ? "B90573"
      : getCodeByDesc(params.softwareEdition);
  }
  if (partNumber) {
    const result = await OracleCloudPriceModel.findOne({ partNumber }, {
      value: 1,
    });
    if (result?.value != null) {
      return result.value * Math.max(params.vCpus, inst.vCpuMin) *
        params.servers * params.hours;
    }
  }

  return 0;
};

/** CALCULADORAS DE PRECIO DE ALMACENAMIENTO, pago por mes, capacidad y servidor */

export const calculateStoragePriceAws = async (
  params: FormParamsDatabase,
): Promise<number> => {
  //Ej. searchCode = eu-west-3/rds/str/gp//Single-AZ y hay 3 tipos de almacenamiento: gp3, gp y hdd
  //Existen Single-AZ y Multi-AZ, siendo Multi-AZ el doble de precio que Single-AZ o 2x servers
  const awsStorageType = params.storageType === "pssd"
    ? "gp3"
    : params.storageType === "ssd"
    ? "gp"
    : "hdd";
  const searchCode = `${params.awsRegion}/rds/str/${awsStorageType}//Single-AZ`;
  // buscamos el precio del almacenamiento
  const result = await AmazonCloudPriceModel.findOne({ searchCode }, {
    price: 1,
  });
  if (result?.price != null) {
    // multiplicamos por el tamaño del disco y el número de servidores
    return result.price * params.storage * params.servers;
  }
  return 0;
};

export const calculateStoragePriceAzr = async (
  params: FormParamsDatabase,
): Promise<number> => {
  //Ej. searchCode = germanywestcentral/sql/str/storage
  const searchCode = params.azrRegion + "/sql/str/storage"; //No hay descuentos de reservas en discos de Azure
  const result = await AzureCloudPriceModel.findOne({ searchCode }, {
    price: 1,
  });
  if (result?.price != null) {
    return result.price * params.storage * params.servers;
  }
  return 0;
};

export const calculateStoragePriceGcp = async (
  params: FormParamsDatabase,
): Promise<number> => {
  //Ej. searchCode = europe-west3/sql/app/standard//zonal o regional = 2x zonal = x2 servers
  //Realmente Google no ofrece pssd, pero se asocia a ssd
  const gcpStorageType = params.storageType === "pssd"
    ? "ssd"
    : params.storageType === "ssd"
    ? "ssd"
    : "standard";
  const searchCode = `${params.gcpRegion}/sql/app/${gcpStorageType}//zonal`;
  // buscamos el precio del almacenamiento
  const result = await GoogleCloudPriceModel.findOne({ searchCode }, {
    price: 1,
  });
  if (result?.price != null) {
    return result.price * params.storage * params.servers;
  }
  return 0;
};

export const calculateStoragePriceOci = async (
  //inst: InfraInstance,
  params: FormParamsDatabase,
): Promise<number> => {
  //B95706 Oracle Autonomous Database Storage for Transaction Processing
  //B91961 Oracle Database Storage for Transaction Processing
  //B91962 Oracle Database Storage for Transaction Processing - Performance Unit
  //Dos grupos: Autonomous ATP serverless y las VMs
  /*if (inst.familyName === "ATP serverless") {
    //B95702 Oracle Autonomous Transaction Processing - ECPU
    //B95704 Oracle Autonomous Transaction Processing - ECPU BYOL
    const b95702 = await OracleCloudPriceModel.findOne(
      { partNumber: "B95702" },
      { value: 1 },
    );
    if (b95702?.value != null) {
      return b95702.value * params.storage * params.servers;
    }
  } else {*/
  // Precio es (B91961 + B91962 * VPU) * #GB donde VPU es 0 para hdd, 10 para ssd y 20 para pssd
  // B91961 es el precio base del disco y B91962 es el precio por VPU o performance unit
  const vpu = params.storageType === "pssd"
    ? 20
    : params.storageType === "ssd"
    ? 10
    : 0;
  const b91961 = await OracleCloudPriceModel.findOne(
    { partNumber: "B91961" },
    {
      value: 1,
    },
  );
  if (b91961?.value != null) {
    const b91962 = await OracleCloudPriceModel.findOne(
      { partNumber: "B91962" },
      { value: 1 },
    );
    if (b91962?.value != null) {
      // multiplicamos por el tamaño del disco y el número de servidores
      return (b91961.value + b91962.value * vpu) * params.storage *
        params.servers;
    }
  }
  /*}*/
  return 0;
};

/** CALCULADORAS DE PRECIO DE ALMACENAMIENTO DE BACKUP, pago por mes, capacidad y servidor */

export const calculateBackupPriceAws = async (
  params: FormParamsDatabase,
): Promise<number> => {
  //Ej. searchCode eu-central-1/rds/snp es snapshot
  const searchCode = params.awsRegion + "/rds/snp";
  const result = await AmazonCloudPriceModel.findOne({ searchCode }, {
    price: 1,
  });
  if (result?.price != null) {
    return result.price * 1 * params.backup; //solo cuenta el backup del nodo activo
  }
  return 0;
};

export const calculateBackupPriceAzr = async (
  params: FormParamsDatabase,
): Promise<number> => {
  //Ej. searchCode = germanywestcentral/sql/str/backup
  const searchCode = params.azrRegion + "/sql/str/backup";
  const result = await AzureCloudPriceModel.findOne({ searchCode }, {
    price: 1,
  });
  if (result?.price != null) {
    return result.price * 1 * params.backup; //solo cuenta el backup del nodo activo
  }
  return 0;
};

export const calculateBackupPriceGcp = async (
  params: FormParamsDatabase,
): Promise<number> => {
  //Ej. searchCode = europe-west3/cs/str/nearline
  const searchCode = params.gcpRegion + "/sql/app/backup//zonal";
  const result = await GoogleCloudPriceModel.findOne({ searchCode }, {
    price: 1,
  });
  if (result?.price != null) {
    return result.price * 1 * params.backup; //solo cuenta el backup del nodo activo
  }
  return 0;
};

export const calculateBackupPriceOci = async (
  params: FormParamsDatabase,
): Promise<number> => {
  // Precio es B90230 * #GB donde B90230 es el precio Database Backup Cloud - Object Storage
  const partNumber = "B90230";
  const result = await OracleCloudPriceModel.findOne({ partNumber }, {
    value: 1,
  });
  if (result?.value != null) {
    return result.value * params.servers * params.backup;
  }
  return 0;
};

/** CALCULADORAS DE PRECIO DE TRAFICO, pago por mes, capacidad y servidor */

export const calculateTrafficPriceAws = async (
  params: FormParamsDatabase,
): Promise<number> => {
  //Ej. searchCode = eu-west-3/net/dt/out///10240
  const searchCode = params.awsRegion + "/net/dt/out///10240";
  const result = await AmazonCloudPriceModel.findOne({ searchCode }, {
    price: 1,
  });
  if (result?.price != null) {
    return result.price * 1 * params.traffic; //solo cuenta el trafico del nodo activo
  }
  return 0;
};

export const calculateTrafficPriceAzr = async (
  params: FormParamsDatabase,
): Promise<number> => {
  //Ej. searchCode = germanywestcentral/net/egress/std//100
  //Las primeras 100 GB de tráfico son gratis, por lo que hay que restarlas
  if (params.traffic <= 100) return 0;
  //spaincentral todavía no tiene asignado un precio
  const azrRegion = params.azrRegion === "spaincentral"
    ? "germanywestcentral"
    : params.azrRegion;
  const searchCode = azrRegion + "/net/egress/std//100";
  const result = await AzureCloudPriceModel.findOne({ searchCode }, {
    price: 1,
  });
  if (result?.price != null) {
    return (result.price) * params.servers * (params.traffic - 100);
  }
  return 0;
};

export const calculateTrafficPriceGcp = async (
  params: FormParamsDatabase,
): Promise<number> => {
  //Ej. searchCode = europe-west3/ce/net/egress/od/EMEA
  const searchCode = params.gcpRegion + "/ce/net/egress/od/EMEA";
  const result = await GoogleCloudPriceModel.findOne({ searchCode }, {
    price: 1,
  });
  if (result?.price != null) {
    return result.price * 1 * params.traffic; //solo cuenta el trafico del nodo activo
  }
  return 0;
};

export const calculateTrafficPriceOci = async (
  params: FormParamsDatabase,
): Promise<number> => {
  // Precio es B88327 * #GB donde B88327 es el precio de outbound data transfer
  const partNumber = "B90230";
  const result = await OracleCloudPriceModel.findOne({ partNumber }, {
    value: 1,
  });
  if (result?.value != null) {
    return result.value * params.servers * params.traffic;
  }
  return 0;
};
