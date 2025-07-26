import * as log from "@std/log";
import AmazonCloudPriceStatModel from "../models/AmazonCloudPriceStat.ts";
import AzureCloudPriceStatModel from "../models/AzureCloudPriceStat.ts";
import GoogleCloudPriceStatModel from "../models/GoogleCloudPriceStat.ts";
import OracleCloudPriceStatModel from "../models/OracleCloudPriceStat.ts";
import { ChartDataset } from "../types.ts";

// Busca históricos de infraestructura para comparar familias

//Calcula el precio de la infraestructura para una familia concreta
export const searchInfraByFamilyStats = async (
  params: Record<string, string>,
  rate: number,
): Promise<ChartDataset[]> => {
  switch (params.cloud) {
    case "AWS":
      return await calculateInfraPriceByFamilyAws(params, rate);
    case "AZR":
      return await calculateInfraPriceByFamilyAzr(params, rate);
    case "GCP":
      return await calculateInfraPriceByFamilyGcp(params, rate);
    case "OCI":
      return await calculateInfraPriceByFamilyOci(params, rate);
    default:
      log.error(`Cloud desconocida para searchInfraStats: ${params.cloud}`);
      return [];
  }
};

// Busca históricos de infraestructura para AWS por familia
export const calculateInfraPriceByFamilyAws = async (
  params: Record<string, string>,
  rate: number,
): Promise<ChartDataset[]> => {
  try {
    const filter = {
      regionCode: params.awsRegion,
      leaseContractLength: params.reservation,
      instanceType: { $regex: `^${params.awsFamily.toLowerCase()}\\.` }, // Coincide con "infra.size"
    };
    //console.log("Searching: " + JSON.stringify(filter));

    const stats = await AmazonCloudPriceStatModel.find(filter, {
      price: 1,
      dateCode: 1,
      instanceType: 1,
    });

    if (!stats || stats.length === 0) {
      return [];
    }
    // Transformar los resultados a ChartDataset
    return stats.map((stat) => ({
      dateCode: stat.dateCode,
      label: stat.instanceType ? stat.instanceType : "unknown",
      value: stat.price * rate,
    }));
  } catch (error) {
    log.error("Error looking for AWS infra stats: " + error);
    throw error;
  }
};

// Busca históricos de infraestructura para Azure por familia
export const calculateInfraPriceByFamilyAzr = async (
  params: Record<string, string>,
  rate: number,
): Promise<ChartDataset[]> => {
  try {
    const filter = {
      armRegionName: params.azrRegion,
      reservationTerm: params.reservation,
      productName: `Virtual Machines ${params.azrFamily} Series`,
    };
    //console.log("Searching: " + JSON.stringify(filter));

    const stats = await AzureCloudPriceStatModel.find(filter, {
      price: 1,
      dateCode: 1,
      skuName: 1,
    });

    if (!stats || stats.length === 0) {
      return [];
    }
    // Transformar los resultados a ChartDataset
    // El precio de Azure por 1y y 2y es el precio total por esos años
    const reservationFix = params.reservation === "1y"
      ? 365 * 24
      : params.reservation === "3y"
      ? 3 * 365 * 24
      : 1;
    return stats.map((stat) => ({
      dateCode: stat.dateCode,
      label: stat.skuName.replace("Standard_", "").replace("_", " "),
      value: stat.price * rate / reservationFix,
    }));
  } catch (error) {
    log.error("Error looking for AZR infra stats: " + error);
    throw error;
  }
};

// Busca históricos de infraestructura para Google Cloud por familia
export const calculateInfraPriceByFamilyGcp = async (
  params: Record<string, string>,
  rate: number,
): Promise<ChartDataset[]> => {
  try {
    const filter = {
      serviceRegion: params.gcpRegion,
      usageType: params.reservation,
      virtualMachineType: params.gcpFamily,
    };
    //console.log("Searching: " + JSON.stringify(filter));

    const stats = await GoogleCloudPriceStatModel.find(filter, {
      price: 1,
      dateCode: 1,
      virtualMachineType: 1,
      resourceGroup: 1,
    });

    if (!stats || stats.length === 0) {
      return [];
    }
    // Transformar los resultados a ChartDataset
    return stats.map((stat) => ({
      dateCode: stat.dateCode,
      label: `${stat.virtualMachineType}_${stat.resourceGroup}`,
      value: stat.price * rate,
    }));
  } catch (error) {
    log.error("Error looking for GCP infra stats: " + error);
    throw error;
  }
};

// Busca históricos de infraestructura para Oracle Cloud por familia
export const calculateInfraPriceByFamilyOci = async (
  params: Record<string, string>,
  rate: number,
): Promise<ChartDataset[]> => {
  try {
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

    const partNumberOcpu = getCodeByDesc(params.ociFamily + " OCPU");
    const partNumberRam = getCodeByDesc(params.ociFamily + " RAM");

    const filter = { partNumber: { $in: [partNumberOcpu, partNumberRam] } };
    //console.log("Searching: " + params.gcpFamily + JSON.stringify(filter));

    const stats = await OracleCloudPriceStatModel.find(filter, {
      value: 1,
      dateCode: 1,
      displayName: 1,
    });

    if (!stats || stats.length === 0) {
      return [];
    }
    // Transformar los resultados a ChartDataset
    return stats.map((stat) => ({
      dateCode: stat.dateCode,
      label: `${stat.displayName}`,
      value: stat.value * rate,
    }));
  } catch (error) {
    log.error("Error looking for OCI infra stats: " + error);
    throw error;
  }
};

// Busca históricos de infraestructura para comparar regiones

//Calcula el precio de la infraestructura para una instancia por region
export const searchInfraByRegionStats = async (
  params: Record<string, string>,
  rate: number,
): Promise<ChartDataset[]> => {
  switch (params.cloud) {
    case "AWS":
      return await calculateInfraPriceByRegionAws(params, rate);
    case "AZR":
      return await calculateInfraPriceByRegionAzr(params, rate);
    case "GCP":
      return await calculateInfraPriceByRegionGcp(params, rate);
    case "OCI":
      return await calculateInfraPriceByFamilyOci(params, rate);
    default:
      log.error(`Cloud desconocida para searchInfraStats: ${params.cloud}`);
      return [];
  }
};

// Busca históricos de infraestructura para AWS por region
export const calculateInfraPriceByRegionAws = async (
  params: Record<string, string>,
  rate: number,
): Promise<ChartDataset[]> => {
  try {
    const filter = {
      leaseContractLength: params.reservation,
      instanceType: params.awsInstance,
    };

    const stats = await AmazonCloudPriceStatModel.find(filter, {
      price: 1,
      dateCode: 1,
      regionCode: 1,
    });

    if (!stats || stats.length === 0) {
      return [];
    }
    // Transformar los resultados a ChartDataset
    return stats.map((stat) => ({
      dateCode: stat.dateCode,
      label: stat.regionCode,
      value: stat.price * rate,
    }));
  } catch (error) {
    log.error("Error looking for AWS infra stats: " + error);
    throw error;
  }
};

// Busca históricos de infraestructura para Azure por region
export const calculateInfraPriceByRegionAzr = async (
  params: Record<string, string>,
  rate: number,
): Promise<ChartDataset[]> => {
  try {
    const skuName = params.azrInstance.replace("Standard_", "")
      .replace("_", " ");
    const filter = {
      reservationTerm: params.reservation,
      skuName: skuName,
    };
    const stats = await AzureCloudPriceStatModel.find(filter, {
      price: 1,
      dateCode: 1,
      armRegionName: 1,
    });

    if (!stats || stats.length === 0) {
      return [];
    }

    // El precio de Azure por 1y y 2y es el precio total por esos años
    const reservationFix = params.reservation === "1y"
      ? 365 * 24
      : params.reservation === "3y"
      ? 3 * 365 * 24
      : 1;

    // Transformar los resultados a ChartDataset
    return stats.map((stat) => ({
      dateCode: stat.dateCode,
      label: stat.armRegionName,
      value: stat.price * rate / reservationFix,
    }));
  } catch (error) {
    log.error("Error looking for AZR infra stats: " + error);
    throw error;
  }
};

// Busca históricos de infraestructura para Google Cloud por region
export const calculateInfraPriceByRegionGcp = async (
  params: Record<string, string>,
  rate: number,
): Promise<ChartDataset[]> => {
  try {
    const vmType = ["M1", "M2"].includes(params.gcpFamily)
      ? "M1-M2"
      : params.gcpFamily;
    const filter = {
      usageType: params.reservation,
      virtualMachineType: vmType,
    };
    //console.log("Searching: " + JSON.stringify(filter));

    const stats = await GoogleCloudPriceStatModel.find(filter, {
      price: 1,
      dateCode: 1,
      serviceRegion: 1,
      virtualMachineType: 1,
      resourceGroup: 1,
    });

    if (!stats || stats.length === 0) {
      return [];
    }
    // Transformar los resultados a ChartDataset
    return stats.map((stat) => ({
      dateCode: stat.dateCode,
      label: `${stat.serviceRegion} ${stat.resourceGroup}`,
      value: stat.price * rate,
    }));
  } catch (error) {
    log.error("Error looking for GCP infra stats: " + error);
    throw error;
  }
};

// No hay búsqueda de regiones OCI ya que no OCI no hay precios diferentes por región
//export const calculateInfraPriceByRegionOci = async ...export
