import * as log from "@std/log";
import "@std/dotenv/load";
import mongoose from "mongoose";
import {
  Currency,
  InfraFamily,
  InfraInstance,
  Region,
  User,
} from "../types.ts";
import UserModel from "../models/Users.ts";
import CurrencyModel from "../models/Currency.ts";
import InfraFamilyModel from "../models/InfraFamily.ts";
import InfraInstanceModel from "../models/InfraInstance.ts";
import DatabaseInstanceModel from "../models/DatabaseInstance.ts";

import {
  defaultDatabaseInstances,
  defaultInfraFamilies,
  defaultInfraInstances,
  defaultUsers,
} from "./dbDefaultContent.ts";
import AmazonCloudRegionModel from "../models/AmazonCloudRegion.ts";
import AzureCloudRegionModel from "../models/AzureCloudRegion.ts";
import GoogleCloudRegionModel from "../models/GoogleCloudRegion.ts";

/** Connection to a mongoDB database using MONGO_URI env */
export async function dbConnect() {
  const uri = Deno.env.get("MONGO_URI");
  if (!uri) {
    log.error("MONGO_URI not found in environment variables.");
    return;
  }
  try {
    await mongoose.connect(uri);
    log.info(`Connected to MongoDB: ${uri}`);
  } catch (e) {
    log.error("Error connecting to MongoDB: " + e);
  }
}

/** Disconnect from the mongoDB database */
export async function dbDisconnect() {
  try {
    await mongoose.disconnect();
    log.info("Disconnected from MongoDB");
  } catch (error) {
    log.error("Error disconnecting from MongoDB: " + error);
  }
}

// Gui types ======================================================================

/** Set Users to the database */
export async function setUsers() {
  try {
    await UserModel.collection.drop();
    const result = await UserModel.insertMany(defaultUsers);
    log.info(`Users added to database: ${result.length}`);
  } catch (error) {
    log.error("Error adding Users to database: " + error);
  }
}

/** Get all Users from the database */
export async function getUsers(): Promise<User[]> {
  try {
    const users = await UserModel.find();
    log.info(`Users read from database: ${users.length}`);
    return (users.map((user) => ({
      username: user.username,
      email: user.email,
      name: user.name,
      surname: user.surname,
      password: user.password,
      role: user.role,
      active: user.active,
      id: String(user._id),
    })));
  } catch (error) {
    log.error("Error reading Users from database: " + error);
    throw error;
  }
}

/** Get all Currency from the database */
export async function getActiveCurrencies(): Promise<Currency[]> {
  try {
    const currencies = await CurrencyModel.find({ active: true });
    log.info(`Currencies read from database: ${currencies.length}`);
    const data = currencies.map((currency) => ({
      code: currency.code,
      name: currency.name,
      rate: currency.rate,
      date: currency.date,
      active: currency.active,
    }));
    //Añade a currencies el USD con rate 1
    data.push({
      code: "USD",
      name: "US Dollar",
      rate: 1,
      date: new Date().toISOString(),
      active: true,
    });
    return data;
  } catch (error) {
    log.error("Error reading Currencies from database: " + error);
    throw error;
  }
}

export const getCurrencyRate = (currencyCode: string) =>
  Currencies.find((c) => c.code === currencyCode)?.rate ?? 1;

/** Get all AWS Regions from the database */
export async function getAmazonCloudRegions(): Promise<Region[]> {
  try {
    //busca todas las regiones de amazon ordenadas por nombre
    const region = await AmazonCloudRegionModel.find().sort({
      regionalDisplayName: 1,
    });
    log.info(`AmazonCloudRegion read from database: ${region.length}`);
    return (region.map((region) => ({
      name: region.name,
      displayName: region.displayName,
      regionalDisplayName: region.regionalDisplayName,
      regionalName: region.regionalName,
      active: region.active,
      id: String(region._id),
      cloud: "AWS",
    })));
  } catch (error) {
    log.error("Error reading Region from database: " + error);
    throw error;
  }
}

/** Get all Azure Regions from the database */
export async function getAzureCloudRegions(): Promise<Region[]> {
  try {
    const region = await AzureCloudRegionModel.find().sort({
      regionalDisplayName: 1,
    });
    log.info(`AzureCloudRegion read from database: ${region.length}`);
    return (region.map((region) => ({
      name: region.name,
      displayName: region.displayName,
      regionalDisplayName: region.regionalDisplayName,
      regionalName: region.regionalName,
      active: region.active,
      id: String(region._id),
      cloud: "AZR",
    })));
  } catch (error) {
    log.error("Error reading AzureCloudRegion from database: " + error);
    throw error;
  }
}

/** Get all Google Regions from the database */
export async function getGoogleCloudRegions(): Promise<Region[]> {
  try {
    const region = await GoogleCloudRegionModel.find().sort({
      regionalDisplayName: 1,
    });
    log.info(`GoogleCloudRegion read from database: ${region.length}`);
    return (region.map((region) => ({
      name: region.name,
      displayName: region.displayName,
      regionalDisplayName: region.regionalDisplayName,
      regionalName: region.regionalName,
      active: region.active,
      id: String(region._id),
      cloud: "GCP",
    })));
  } catch (error) {
    log.error("Error reading GoogleCloudRegion from database: " + error);
    throw error;
  }
}

/** Set InfraFamilies to the database */
export async function setInfraFamilies() {
  try {
    await InfraFamilyModel.collection.drop();
    const result = await InfraFamilyModel.insertMany(defaultInfraFamilies);
    log.info(`InfraFamilies added to database: ${result.length}`);
  } catch (error) {
    log.error("Error adding InfraFamilies to database: " + error);
  }
}

/** Get InfraFamilies to the database */
export async function getInfraFamilies(): Promise<InfraFamily[]> {
  try {
    const infraFamilies = await InfraFamilyModel.find().sort({
      cloud: 1,
      familyName: 1,
    });
    log.info(`InfraFamilies read from database: ${infraFamilies.length}`);
    return (infraFamilies.map((family) => ({
      cloud: family.cloud,
      familyName: family.familyName,
      processor: family.processor,
      use: family.use,
      id: String(family._id),
    })));
  } catch (error) {
    log.error("Error reading InfraFamilies from database: " + error);
    throw error;
  }
}

/** Set infraInstances to the database */
export async function setInfraInstances() {
  try {
    await InfraInstanceModel.collection.drop();
    const result = await InfraInstanceModel.insertMany(defaultInfraInstances);
    log.info(`InfraInstances added to database: ${result.length}`);
  } catch (error) {
    log.error("Error adding InfraInstances to database: " + error);
  }
}

/** Get InfraInstances from the database */

export async function getInfraInstances(): Promise<InfraInstance[]> {
  try {
    const infraInstance = await InfraInstanceModel.find().sort({
      cloud: 1,
      instanceName: 1,
    });
    log.info(`InfraInstance read from database: ${infraInstance.length}`);
    return (infraInstance.map((instance) => ({
      cloud: instance.cloud,
      familyName: instance.familyName,
      familyUse: instance.familyUse,
      instanceName: instance.instanceName,
      vCpuMin: instance.vCpuMin,
      vCpuMax: instance.vCpuMax,
      memoryMin: instance.memoryMin,
      memoryMax: instance.memoryMax,
      localDisk: instance.localDisk,
      localDiskType: instance.localDiskType,
      id: String(instance._id),
    })));
  } catch (error) {
    log.error("Error reading InfraInstance from database: " + error);
    throw error;
  }
}

/** Set databaseInstances to the database */
export async function setDatabaseInstances() {
  try {
    await DatabaseInstanceModel.collection.drop();
    const result = await DatabaseInstanceModel.insertMany(
      defaultDatabaseInstances,
    );
    log.info(`DatabaseInstances added to database: ${result.length}`);
  } catch (error) {
    log.error("Error adding DatabaseInstances to database: " + error);
  }
}

/** Read all static data from the database */
export let InfraFamilies: InfraFamily[] = [];
export let InfraInstances: InfraInstance[] = [];
export let Currencies: Currency[] = [];
export let AmazonCloudRegions: Region[] = [];
export let AzureCloudRegions: Region[] = [];
export let GoogleCloudRegions: Region[] = [];

export async function dbReadConfigData() {
  Currencies = await getActiveCurrencies();
  AmazonCloudRegions = await getAmazonCloudRegions();
  AzureCloudRegions = await getAzureCloudRegions();
  GoogleCloudRegions = await getGoogleCloudRegions();
  InfraFamilies = await getInfraFamilies();
  InfraInstances = await getInfraInstances();
}
