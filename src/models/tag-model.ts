import mongoose, { Schema, Document } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
export interface ITag extends Document {
  name: string;
}
const tagSchema: Schema = new Schema({
  name: { type: String, required: true },
});

tagSchema.plugin(uniqueValidator);

const Tag = mongoose.model<ITag>("Tag", tagSchema);

export default Tag;
