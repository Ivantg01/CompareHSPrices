/** Schema and model for GuiInfraFamily */
import mongoose from "mongoose";
import { InfraFamily } from "../types.ts";

const Schema = mongoose.Schema;

const InfraFamilySchema = new Schema({
  //no incluimos id, ya que mongoDB crea un campo _id por defecto
  cloud: { type: String, required: true, sparse: true },
  familyName: { type: String, required: true, unique: true },
  processor: { type: String, required: true },
  use: { type: String, required: true },
}, { timestamps: true });

export type GuiInfraFamilyModelType =
  & mongoose.Document
  & Omit<InfraFamily, "id">;
export default mongoose.model<GuiInfraFamilyModelType>(
  "GuiInfraFamily",
  InfraFamilySchema,
);
