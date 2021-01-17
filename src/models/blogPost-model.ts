import mongoose, { Schema, Document } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import { ITag } from "./tag-model";
import { IUser } from "./user-model";
import { ICategory } from "./category-model";
export interface IBlogPost extends Document {
  title: string;
  content: string;
  imageUrl: string;
  author: mongoose.Types.ObjectId | IUser;
  date: Date;
  tags: mongoose.Types.ObjectId[] | ITag[];
  category: mongoose.Types.ObjectId | null | ICategory;
}
const blogPostSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  imageUrl: { type: String },
  author: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  date: { type: Date, required: true },
  tags: [{ type: mongoose.Types.ObjectId, ref: "Tag" }],
  category: {
    type: mongoose.Types.ObjectId,
    ref: "Category",
  },
});

blogPostSchema.plugin(uniqueValidator);

blogPostSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (_: any, ret: any) {
    // remove these props when object is serialized
    delete ret._id;
  },
});

const BlogPost = mongoose.model<IBlogPost>("BlogPost", blogPostSchema);

export default BlogPost;
