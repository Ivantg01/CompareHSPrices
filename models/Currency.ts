/** Schema and model for GuiCurrency */
import mongoose from "mongoose";
import { Currency } from "../types.ts";

const Schema = mongoose.Schema;

const CurrencySchema = new Schema({
  //no incluimos id, ya que mongoDB crea un campo _id por defecto
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  rate: { type: Number, required: true },
  date: { type: String, required: true },
  base: { type: String, default: "USD" },
  active: { type: Boolean, default: false },
}, { timestamps: true });

export type CurrencyModelType = mongoose.Document & Omit<Currency, "id">;
export default mongoose.model<CurrencyModelType>("GuiCurrency", CurrencySchema);
