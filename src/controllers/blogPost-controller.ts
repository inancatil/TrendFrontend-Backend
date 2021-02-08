import mongoose, { isValidObjectId } from "mongoose";

import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import BlogPost from "../models/blogPost-model";
import { IBlogPost } from "./../models/blogPost-model";
import User, { IUser } from "../models/user-model";
import Category, { ICategory } from "../models/category-model";
import Tag from "../models/tag-model";
import Joi from "joi";
import { validateRequest } from "../middleware/validate-request";
import { titleToUrlFormat } from "../utils";

export const getBlogPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let blogPosts;
  try {
    blogPosts = await BlogPost.find({})
      .populate({ path: "author", select: ["id", "name"] })
      .populate({ path: "category", select: ["id", "name"] })
      .populate({ path: "tags", select: ["id", "name"] });
  } catch (e) {
    return next("Something went wrong,1 Couldnt find posts");
  }

  if (!blogPosts) {
    return next("Couldnt find posts");
  }
  return res.json({
    blogPosts: blogPosts.map((post) => post.toJSON()),
  });
};

export const getBlogPostByTitle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  const blogPostTitle: string = req.params.bptitle;

  let blogPost;
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    blogPost = await BlogPost.findOne({ url: blogPostTitle }, {}, { session })
      .populate({ path: "author", select: ["id", "name"] })
      .populate({ path: "category", select: ["id", "name"] })
      .populate({ path: "tags", select: ["id", "name"] });

    const viewCount = blogPost?.viewCount ? blogPost.viewCount + 1 : 1;
    const x = await BlogPost.update({ url: blogPostTitle }, { $set: { viewCount } },
      { session, upsert: true })

    await session.commitTransaction();
  } catch (e) {
    return next("Something went wrong,1 Couldnt find posts");
  }

  if (!blogPost) {
    return next("Couldnt find posts");
  }
  return res.json({
    blogPost,
  });
};

export function blogPostSchema(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const schema = Joi.object({
    title: Joi.string().required(),
    categoryId: Joi.string().required(),
    tags: Joi.array(),
    content: Joi.string().min(15),
  });
  validateRequest(req, next, schema);
}

export const createBlogPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { title, content, imageUrl, author, date, tags, categoryId } = req.body;

  //#region find and select user
  let user: IUser | null;
  try {
    user = await User.findById(author);
  } catch (error) {
    return next("Couldnt find user, Creating blogpost failed");
  }

  if (!user) {
    return next("Couldnt find user, Creating blogpost failed");
  }
  //#endregion

  //#region find and select category
  let category: ICategory | null = null;

  try {
    category = await Category.findById(categoryId);
  } catch (error) {
    return next("Something went wrong. Couldn't find category id.");
  }

  if (categoryId && !category) {
    return next("Couldn't find category id.");
  }
  //#endregion

  let createdBlogPost: any;
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    const tagNames = tags.map((t: any) => t.value);
    const existingTags = await Tag.find({ name: { $in: tagNames } });
    const newTags = await Tag.insertMany(
      tags
        .filter((t: any) => t.isNew)
        .map((t: any) => {
          return { name: t.inputValue };
        }),
      { session }
    );

    const numOfTitles = await checkIfTitleExists(title);

    createdBlogPost = new BlogPost({
      url: titleToUrlFormat(title, numOfTitles),
      title,
      content,
      imageUrl,
      author,
      date,
      tags: existingTags.concat(newTags),
      category,
      viewCount: 0
    });

    const _createdBP = await createdBlogPost.save({ session });

    user.blogPosts.push(_createdBP._id);
    await user.save({ session });
    if (category) {
      category.blogPosts.push(_createdBP._id);
      await category.save({ session });
    }
    await session.commitTransaction();
  } catch (err) {
    return next(err);
  }

  res.status(201).json({
    blogPost: createdBlogPost.toJSON(),
  });
};

export const deleteBlogPostById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validationError = validationResult(req);
  if (!validationError.isEmpty()) {
    return next("Invalid data sent");
  }
  const blogPostId: string = req.params.bpid;

  //#region find blog post
  let blogPost: IBlogPost | null = null;
  try {
    blogPost = await BlogPost.findById(blogPostId);
  } catch (error) {
    return next("Sometihng went wrong. Couldn't delete blog post.");
  }
  if (!blogPost) {
    return next("Couldn't find blog post for provided id.");
  }
  //#endregion

  //#region find and select user
  let user: IUser | null;
  try {
    user = await User.findById(blogPost.author);
  } catch (error) {
    return next("Sometihng went wrong. Couldn't delete blog post from user.");
  }

  if (!user) {
    return next("Couldn't delete blog post from user.");
  }
  //#endregion

  //#region find and select category
  let category: ICategory | null;
  try {
    category = await Category.findById(blogPost.category);
  } catch (error) {
    return next("Sometihng went wrong. Couldn't find blog post from category.");
  }

  // if (!category) {
  //   return next("Couldn't delete blog post from category.");
  // }
  //#endregion

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    blogPost?.deleteOne({ session });
    //#region without populate way

    user?.blogPosts.splice(
      user?.blogPosts.findIndex(
        (blogPost) => blogPost.toHexString() === blogPostId
      ),
      1
    );
    await user?.save({ session });
    category?.blogPosts.splice(
      category?.blogPosts.findIndex(
        (blogPost) => blogPost.toHexString() === blogPostId
      ),
      1
    );
    if (category) {
      await category.save({ session });
    }

    //#endregion
    await session.commitTransaction();
  } catch (error) {
    return next("Something went wrong, couldnt delete post");
  }

  res.status(201).json({
    message: "Delete successful",
    blogPost: blogPost.toJSON(),
  });
};

export const updateBlogPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validationError = validationResult(req);
  if (!validationError.isEmpty()) {
    return next("Invalid data sent");
  }
  const blogPostId: string = req.params.bpid;
  const { title, content, imageUrl, author, date, tags, categoryId } = req.body;

  //#region find and select category
  let category: ICategory | null = null;

  try {
    category = await Category.findById(categoryId);
  } catch (error) {
    return next("Something went wrong. Couldn't find category id.");
  }
  if (categoryId && !category) {
    return next("Couldn't find category id.");
  }
  //#endregion
  let updatedPost: any = {}
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    const tagNames = tags.map((t: any) => t.value);
    const existingTags = await Tag.find({ name: { $in: tagNames } });
    const newTags = await Tag.insertMany(
      tags
        .filter((t: any) => t.isNew)
        .map((t: any) => {
          return { name: t.inputValue };
        }),
      { session }
    );

    const curPostDetails = await BlogPost.findOne({ _id: blogPostId }, {}, { session });
    const numOfTitles = await checkIfTitleExists(title);

    await BlogPost.updateOne({ _id: blogPostId }, {
      $set: {
        url: curPostDetails!.title !== title ? titleToUrlFormat(title, numOfTitles) : curPostDetails!.url,
        title,
        content,
        imageUrl,
        author,
        date,
        tags: existingTags.concat(newTags),
        category
      }
    }, { session, upsert: true })
    //might be improved. Not sure 100% working

    const oldCatId = curPostDetails?.category;
    if (oldCatId) {
      await Category.updateOne({ _id: oldCatId },
        { $pullAll: { blogPosts: [curPostDetails!._id] } },
        { session }
      );
    }

    if (category) {
      category.blogPosts.push(curPostDetails!._id);
      await category.save({ session });
    }

    await session.commitTransaction();
  } catch (error) {
    return next("Something went wrong, couldnt update post");
  }

  res.status(201).json({
    message: "Update successful",
    blogPost: updatedPost,
  });
};

const checkIfTitleExists = async (title: string): Promise<number> => {
  const x = await BlogPost.find({ title })
  return x.length
}