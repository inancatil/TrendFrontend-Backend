import mongoose, { Schema, Document, Types } from "mongoose";
import { IPlace } from "./place-model";
import uniqueValidator from "mongoose-unique-validator";
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  places: IPlace[];
}
const userSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  places: [{ type: mongoose.Types.ObjectId, required: true, ref: "Place" }],
});

userSchema.plugin(uniqueValidator);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
