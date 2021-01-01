import mongoose, { Schema, Document } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
export interface ICategory extends Document {
  name: string;
  blogPosts: mongoose.Types.ObjectId[];
}
const categorySchema: Schema = new Schema({
  name: { type: String, required: true },
  blogPosts: [
    { type: mongoose.Types.ObjectId, required: true, ref: "BlogPost" },
  ],
});

categorySchema.plugin(uniqueValidator);

categorySchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (_: any, ret: any) {
    // remove these props when object is serialized
    delete ret._id;
  },
});

const Category = mongoose.model<ICategory>("Category", categorySchema);

export default Category;
