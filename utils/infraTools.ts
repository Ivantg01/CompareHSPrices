import { FormParamsInfra, InfraInstance } from "../types.ts";
import * as log from "@std/log";
import InfraInstanceModel from "../models/InfraInstance.ts";
import AmazonCloudPriceModel from "../models/AmazonCloudPrice.ts";
import AzureCloudPriceModel from "../models/AzureCloudPrice.ts";
import GoogleCloudPriceModel from "../models/GoogleCloudPrice.ts";
import OracleCloudPriceModel from "../models/OracleCloudPrice.ts";
import { cloudStorageCodes } from "./dbDefaultContent.ts";

// Buscar todas las instancias que cumplan los requisitos mínimos
export const searchValidInfraInstances = async (
  vCpus: number,
  memory: number,
) => {
  const validInstances = await InfraInstanceModel.find({
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

/** CALCULADORAS DE PRECIO DE INFRAESTRUCTURA, pago por hora y servidor */

//Calcula el precio de la infraestructura para una instancia concreta
export const calculateInfraPrice = async (
  inst: InfraInstance,
  params: FormParamsInfra,
): Promise<number> => {
  switch (inst.cloud) {
    case "AWS":
      return await calculateInfraPriceAws(inst, params);
    case "AZR":
      return await calculateInfraPriceAzr(inst, params);
    case "GCP":
      return await calculateInfraPriceGcp(inst, params);
    case "OCI":
      return await calculateInfraPriceOci(inst, params);
    default:
      log.error(`Cloud desconocida para calculateInfraPrice: ${inst.cloud}`);
      return 0;
  }
};

const calculateInfraPriceAws = async (
  inst: InfraInstance,
  params: FormParamsInfra,
): Promise<number> => {
  //Ej. searchCode = af-south-1/ec2/cmp/c6in.2xlarge/od
  const searchCode =
    `${params.awsRegion}/ec2/cmp/${inst.instanceName}/${params.reservation}`;
  const result = await AmazonCloudPriceModel.findOne({ searchCode }, {
    price: 1,
  });
  if (result?.price != null) {
    return result.price * params.servers * params.hours;
  }
  return 0;
};

const calculateInfraPriceAzr = async (
  inst: InfraInstance,
  params: FormParamsInfra,
): Promise<number> => {
  //Ej. searchCode = switzerlandnorth/vm/cmp/B16as_v2/od
  const searchCode =
    `${params.azrRegion}/vm/cmp/${inst.instanceName}/${params.reservation}`;
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

// Calcula el precio de la infraestructura para Google Cloud Platform
// Se suma el coste separado de la CPU y la RAM, por sus GB correspondientes * nº servers
const calculateInfraPriceGcp = async (
  inst: InfraInstance,
  params: FormParamsInfra,
): Promise<number> => {
  //Ej. searchCode = europe-southwest1/ce/cmp/cpu/od//C2
  //Google separa la CPU de la RAM en dos precios SKU
  let searchCode =
    `${params.gcpRegion}/ce/cmp/cpu/${params.reservation}//${inst.familyName}`;
  const resultCpu = await GoogleCloudPriceModel.findOne({ searchCode }, {
    price: 1,
  });
  //Ej. searchCode = europe-southwest1/ce/cmp/ram/od//G2
  searchCode =
    `${params.gcpRegion}/ce/cmp/ram/${params.reservation}//${inst.familyName}`;
  const resultRam = await GoogleCloudPriceModel.findOne({ searchCode }, {
    price: 1,
  });
  if (resultCpu?.price != null && resultRam?.price != null) {
    //visualizamos los precios de CPU y RAM
    return (resultCpu.price * Math.max(params.vCpus, inst.vCpuMin) +
      resultRam.price * Math.max(params.memory, inst.memoryMin)) *
      params.servers * params.hours;
  }
  return 0;
};

//En OCI 1 OCPU = 2 vCPUs. El precio infra se compone de OCPU + RAM
const calculateInfraPriceOci = async (
  inst: InfraInstance,
  params: FormParamsInfra,
): Promise<number> => {
  const codeMap = {
    "B92306": "Standard E3 OCPU",
    "B93113": "Standard E4 OCPU",
    "B97384": "Standard E5 OCPU",
    "B111129": "Standard E6 OCPU",
    "B93121": "Dense E4 OCPU",
    "B98202": "Dense E5 OCPU",
    "B94176": "Standard3 OCPU",
    "B93311": "Optimized3 OCPU",
    "B92307": "Standard E3 RAM",
    "B93114": "Standard E4 RAM",
    "B97385": "Standard E5 RAM",
    "B111130": "Standard E6 RAM",
    "B93122": "Dense E4 RAM",
    "B98203": "Dense E5 RAM",
    "B94177": "Standard3 RAM",
    "B93312": "Optimized3 RAM",
  };
  function getCodeByDesc(desc: string | undefined): string | undefined {
    return Object.keys(codeMap).find((code) =>
      desc?.endsWith(codeMap[code as keyof typeof codeMap])
    );
  }
  // buscamos el precio de la OCPU
  let partNumber = getCodeByDesc(inst.familyName + " OCPU");
  if (partNumber) {
    const resultOcpu = await OracleCloudPriceModel.findOne({ partNumber }, {
      value: 1,
    });
    if (resultOcpu?.value != null) {
      // buscamos el precio de la RAM
      partNumber = getCodeByDesc(inst.familyName + " RAM");
      if (partNumber) {
        const resultRam = await OracleCloudPriceModel.findOne({ partNumber }, {
          value: 1,
        });
        if (resultRam?.value != null) {
          return (resultOcpu.value * Math.max(params.vCpus, inst.vCpuMin) +
            resultRam.value * Math.max(params.memory, inst.memoryMin)) *
            params.servers * params.hours;
        }
      }
    }
  }
  return 0;
};

/** CALCULADORAS DE PRECIO DE ALMACENAMIENTO BOOT, pago por mes, capacidad y servidor */

export const calculateBootPriceAws = async (
  params: FormParamsInfra,
): Promise<number> => {
  if (!params.boot) return 0;
  //Ej. searchCode = eu-central-1/ec2/str/gp2 y hay 3 tipos de almacenamiento: gp3, gp2 y sc1
  const awsStorageType = params.storageType === "pssd"
    ? "gp3"
    : params.storageType === "ssd"
    ? "gp2"
    : "st1";
  const searchCode = `${params.awsRegion}/ec2/str/${awsStorageType}`;
  // buscamos el precio del almacenamiento
  const result = await AmazonCloudPriceModel.findOne({ searchCode }, {
    price: 1,
  });
  if (result?.price != null) {
    // multiplicamos por el tamaño del disco y el número de servidores
    return result.price * params.boot * params.servers;
  }
  return 0;
};
export const calculateBootPriceAzr = async (
  params: FormParamsInfra,
): Promise<number> => {
  if (!params.boot) return 0;
  //Ej. searchCode = germanywestcentral/str/pssd/P3 ZRS/od
  const diskName = cloudStorageCodes.find((d) =>
    d.cloud === "AZR" &&
    d.storageType === params.storageType &&
    d.redundancy === params.redundancy &&
    d.sizeMin >= (params.boot || 0)
  )?.diskName;
  const searchCode = params.azrRegion + "/str/" + params.storageType + "/" +
    diskName + "/od"; //No hay descuentos de reservas en discos de Azure
  const result = await AzureCloudPriceModel.findOne({ searchCode }, {
    price: 1,
  });
  if (result?.price != null) {
    return result.price * params.servers;
  }
  return 0;
};
export const calculateBootPriceGcp = async (
  params: FormParamsInfra,
): Promise<number> => {
  if (!params.boot) return 0;
  //Ej. searchCode = europe-southwest1/ce/str/pd-balanced/od Hay 3 tipos junto con regional/local
  const gcpStorageType = params.storageType === "pssd"
    ? "pd-ssd"
    : params.storageType === "ssd"
    ? "pd-balanced"
    : "pd-standard";
  const searchCode = `${params.gcpRegion}/ce/str/${gcpStorageType}` +
    (params.redundancy === "ZRS" ? "-regional" : "") + "/od";
  // buscamos el precio del almacenamiento
  const result = await GoogleCloudPriceModel.findOne({ searchCode }, {
    price: 1,
  });
  if (result?.price != null) {
    // multiplicamos por el tamaño del disco y el número de servidores
    return result.price * params.boot * params.servers;
  }
  return 0;
};
export const calculateBootPriceOci = async (
  params: FormParamsInfra,
): Promise<number> => {
  if (!params.boot) return 0;
  // Precio es (B91961 + B91962 * VPU) * #GB donde VPU es 0 para hdd, 10 para ssd y 20 para pssd
  // B91961 es el precio base del disco y B91962 es el precio por VPU o performance unit
  const vpu = params.storageType === "pssd"
    ? 20
    : params.storageType === "ssd"
    ? 10
    : 0;
  const b91961 = await OracleCloudPriceModel.findOne({ partNumber: "B91961" }, {
    value: 1,
  });
  if (b91961?.value != null) {
    const b91962 = await OracleCloudPriceModel.findOne(
      { partNumber: "B91962" },
      { value: 1 },
    );
    if (b91962?.value != null) {
      // multiplicamos por el tamaño del disco y el número de servidores
      return (b91961.value + b91962.value * vpu) * params.boot *
        params.servers;
    }
  }
  return 0;
};

/** CALCULADORAS DE PRECIO DE ALMACENAMIENTO, pago por mes, capacidad y servidor */

export const calculateStoragePriceAws = async (
  params: FormParamsInfra,
): Promise<number> => {
  //Ej. searchCode = eu-central-1/ec2/str/gp2 y hay 3 tipos de almacenamiento: gp3, gp2 y sc1
  const awsStorageType = params.storageType === "pssd"
    ? "gp3"
    : params.storageType === "ssd"
    ? "gp2"
    : "st1";
  const searchCode = `${params.awsRegion}/ec2/str/${awsStorageType}`;
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
  params: FormParamsInfra,
): Promise<number> => {
  //Ej. searchCode = germanywestcentral/str/pssd/P3 ZRS/od
  const diskName = cloudStorageCodes.find((d) =>
    d.cloud === "AZR" &&
    d.storageType === params.storageType &&
    d.redundancy === params.redundancy &&
    d.sizeMin >= params.storage
  )?.diskName;
  const searchCode = params.azrRegion + "/str/" + params.storageType + "/" +
    diskName + "/od"; //No hay descuentos de reservas en discos de Azure
  const result = await AzureCloudPriceModel.findOne({ searchCode }, {
    price: 1,
  });
  if (result?.price != null) {
    return result.price * params.servers;
  }
  return 0;
};

export const calculateStoragePriceGcp = async (
  params: FormParamsInfra,
): Promise<number> => {
  //Ej. searchCode = europe-southwest1/ce/str/pd-balanced/od Hay 3 tipos junto con regional/local
  const gcpStorageType = params.storageType === "pssd"
    ? "pd-ssd"
    : params.storageType === "ssd"
    ? "pd-balanced"
    : "pd-standard";
  const searchCode = `${params.gcpRegion}/ce/str/${gcpStorageType}` +
    (params.redundancy === "ZRS" ? "-regional" : "") + "/od";
  // buscamos el precio del almacenamiento
  const result = await GoogleCloudPriceModel.findOne({ searchCode }, {
    price: 1,
  });
  if (result?.price != null) {
    // multiplicamos por el tamaño del disco y el número de servidores
    return result.price * params.storage * params.servers;
  }
  return 0;
};

export const calculateStoragePriceOci = async (
  params: FormParamsInfra,
): Promise<number> => {
  // Precio es (B91961 + B91962 * VPU) * #GB donde VPU es 0 para hdd, 10 para ssd y 20 para pssd
  // B91961 es el precio base del disco y B91962 es el precio por VPU o performance unit
  const vpu = params.storageType === "pssd"
    ? 20
    : params.storageType === "ssd"
    ? 10
    : 0;
  const b91961 = await OracleCloudPriceModel.findOne({ partNumber: "B91961" }, {
    value: 1,
  });
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
  return 0;
};

/** CALCULADORAS DE PRECIO DE ALMACENAMIENTO DE BACKUP, pago por mes, capacidad y servidor */

export const calculateBackupPriceAws = async (
  params: FormParamsInfra,
): Promise<number> => {
  //Ej. searchCode =eu-west-3/ec2/str/sc1 es cold hdd
  const searchCode = params.awsRegion + "/ec2/str/sc1";
  const result = await AmazonCloudPriceModel.findOne({ searchCode }, {
    price: 1,
  });
  if (result?.price != null) {
    return result.price * params.servers * params.backup;
  }
  return 0;
};

export const calculateBackupPriceAzr = async (
  params: FormParamsInfra,
): Promise<number> => {
  //Ej. searchCode = germanywestcentral/str/blob/Cool ZRS/od
  const searchCode = params.azrRegion + "/str/blob/Cool ZRS/od";
  const result = await AzureCloudPriceModel.findOne({ searchCode }, {
    price: 1,
  });
  if (result?.price != null) {
    return result.price * params.servers * params.backup;
  }
  return 0;
};

export const calculateBackupPriceGcp = async (
  params: FormParamsInfra,
): Promise<number> => {
  //Ej. searchCode = europe-west3/cs/str/nearline
  const searchCode = params.gcpRegion + "/cs/str/nearline";
  const result = await GoogleCloudPriceModel.findOne({ searchCode }, {
    price: 1,
  });
  if (result?.price != null) {
    return result.price * params.servers * params.backup;
  }
  return 0;
};

export const calculateBackupPriceOci = async (
  params: FormParamsInfra,
): Promise<number> => {
  // Precio es B93000 * #GB donde B93000 es el precio almacenamiento infrecuente
  const partNumber = "B93000";
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
  params: FormParamsInfra,
): Promise<number> => {
  //Ej. searchCode = eu-west-3/net/dt/out///10240
  const searchCode = params.awsRegion + "/net/dt/out///10240";
  const result = await AmazonCloudPriceModel.findOne({ searchCode }, {
    price: 1,
  });
  if (result?.price != null) {
    return result.price * params.servers * params.traffic;
  }
  return 0;
};

export const calculateTrafficPriceAzr = async (
  params: FormParamsInfra,
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
  params: FormParamsInfra,
): Promise<number> => {
  //Ej. searchCode = europe-west3/ce/net/egress/od/EMEA
  const searchCode = params.gcpRegion + "/ce/net/egress/od/EMEA";
  const result = await GoogleCloudPriceModel.findOne({ searchCode }, {
    price: 1,
  });
  if (result?.price != null) {
    return result.price * params.servers * params.traffic;
  }
  return 0;
};

export const calculateTrafficPriceOci = async (
  params: FormParamsInfra,
): Promise<number> => {
  // Precio es B88327 * #GB donde B88327 es el precio de outbound data transfer
  const partNumber = "B88327";
  const result = await OracleCloudPriceModel.findOne({ partNumber }, {
    value: 1,
  });
  if (result?.value != null) {
    return result.value * params.servers * params.traffic;
  }
  return 0;
};

/** CALCULADORAS DE PRECIO DE Kubernetes SLA, pago por hora y cluster */

export const calculateK8sPriceAws = async (
  params: FormParamsInfra,
): Promise<number> => {
  //Ej. searchCode = eu-west-3/net/dt/out///10240
  const searchCode = params.awsRegion + "/eks/ctr";
  const result = await AmazonCloudPriceModel.findOne({ searchCode }, {
    price: 1,
  });
  if (result?.price != null) {
    return result.price * params.hours;
  }
  return 0;
};

export const calculateK8sPriceAzr = async (
  params: FormParamsInfra,
): Promise<number> => {
  //Ej. searchCode = germanywestcentral/aks/k8/sla
  const searchCode = params.azrRegion + "/aks/k8/sla";
  const result = await AzureCloudPriceModel.findOne({ searchCode }, {
    price: 1,
  });
  if (result?.price != null) {
    return (result.price) * params.hours;
  }
  return 0;
};

export const calculateK8sPriceGcp = async (
  params: FormParamsInfra,
): Promise<number> => {
  //Ej. searchCode = global/gke/k8///zonal Hay dos tipos zonal y regional
  const redundancy = params.redundancy === "ZRS" ? "regional" : "zonal";
  const searchCode = "global/gke/k8///" + redundancy;
  const result = await GoogleCloudPriceModel.findOne({ searchCode }, {
    price: 1,
  });
  if (result?.price != null) {
    return result.price * params.hours;
  }
  return 0;
};

export const calculateK8sPriceOci = async (
  params: FormParamsInfra,
): Promise<number> => {
  // Precio es B96545 * cludter donde B96545 es el precio OCI kubernetes engine
  const partNumber = "B96545";
  const result = await OracleCloudPriceModel.findOne({ partNumber }, {
    value: 1,
  });
  if (result?.value != null) {
    return result.value * params.hours;
  }
  return 0;
};
