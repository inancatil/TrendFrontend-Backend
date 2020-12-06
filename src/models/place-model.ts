import mongoose, { Schema, Document } from "mongoose";
import { IUser } from "./user-model";

export interface IPlace extends Document {
  title: string;
  description: string;
  address: string;
  creator: string;
}
export const placeSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
});

const Place = mongoose.model<IPlace>("Place", placeSchema);

export default Place;
