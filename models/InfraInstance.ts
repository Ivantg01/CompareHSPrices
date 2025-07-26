/** Schema and model for GuiInfraInstance */
import mongoose from "mongoose";
import { InfraInstance } from "../types.ts";

const Schema = mongoose.Schema;

const InfraInstanceSchema = new Schema({
  //no incluimos id, ya que mongoDB crea un campo _id por defecto
  cloud: { type: String, required: true, sparse: true },
  familyName: { type: String, required: true, sparse: true },
  familyUse: { type: String, required: true },
  instanceName: { type: String, required: true, unique: true },
  vCpuMin: { type: Number, required: true },
  vCpuMax: { type: Number, required: true },
  memoryMin: { type: Number, required: true },
  memoryMax: { type: Number, required: true },
  localDisk: { type: Boolean, required: true },
  localDiskType: { type: String },
}, { timestamps: true });

export type GuiInfraInstanceModelType =
  & mongoose.Document
  & Omit<InfraInstance, "id">;
export default mongoose.model<GuiInfraInstanceModelType>(
  "GuiInfraInstance",
  InfraInstanceSchema,
);
