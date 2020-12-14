import mongoose, { Schema, Document } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import { IBlogPost } from "./blogPost-model";
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  blogPosts: mongoose.Types.ObjectId[];
  role: string
}
const userSchema: Schema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  blogPosts: [
    { type: mongoose.Types.ObjectId, required: true, ref: "BlogPost" },
  ],
  role: { type: String, required: true }
});

userSchema.plugin(uniqueValidator);

const User = mongoose.model<IUser>("User", userSchema);

export default User;
