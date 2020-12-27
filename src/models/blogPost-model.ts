import mongoose, { Schema, Document } from "mongoose";
import uniqueValidator from "mongoose-unique-validator";
import { ITag } from "./tag-model";
export interface IBlogPost extends Document {
  title: string;
  content: string;
  imageUrl: string;
  author: mongoose.Types.ObjectId;
  date: string;
  tags: ITag[];
  categoryId: mongoose.Types.ObjectId | null;
}
const blogPostSchema: Schema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  imageUrl: { type: String },
  author: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  date: { type: String, required: true },
  tags: [{ type: mongoose.Types.ObjectId, ref: "Tag" }],
  categoryId: {
    type: mongoose.Types.ObjectId,
    ref: "Category",
  },
});

blogPostSchema.plugin(uniqueValidator);

const BlogPost = mongoose.model<IBlogPost>("BlogPost", blogPostSchema);

export default BlogPost;
