/** Schema and model for GuiUser */
import mongoose from "mongoose";
import { User } from "../types.ts";

const Schema = mongoose.Schema;

const UserSchema = new Schema({
  //no incluimos id, ya que mongoDB crea un campo _id por defecto
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  surname: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  active: { type: Boolean, required: true },
}, { timestamps: true });

export type GuiUserModelType = mongoose.Document & Omit<User, "id">;
export default mongoose.model<GuiUserModelType>("GuiUser", UserSchema);
