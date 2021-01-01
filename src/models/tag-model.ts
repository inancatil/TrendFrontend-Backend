import mongoose, { Schema, Document } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
export interface ITag extends Document {
  name: string;
}
const tagSchema: Schema = new Schema({
  name: { type: String, required: true },
});

tagSchema.plugin(uniqueValidator);

tagSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (_: any, ret: any) {
    // remove these props when object is serialized
    delete ret._id;
  },
});

const Tag = mongoose.model<ITag>("Tag", tagSchema);

export default Tag;
