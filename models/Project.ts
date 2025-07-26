/** Schema and model for GuiProject */
import mongoose from "mongoose";
import { Project } from "../types.ts";

const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  //no incluimos id, ya que mongoDB crea un campo _id por defecto
  username: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  paramsEncoded: { type: String, required: true },
  instancesEncoded: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  awsPrice: { type: Number },
  azrPrice: { type: Number },
  gcpPrice: { type: Number },
  ociPrice: { type: Number },
  currency: { type: String, required: true },
}, { timestamps: true });

export type ProjectModelType = mongoose.Document & Omit<Project, "id">;
export default mongoose.model<ProjectModelType>("GuiProject", ProjectSchema);
