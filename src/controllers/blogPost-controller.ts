import mongoose from "mongoose";

import { NextFunction, Request, Response } from "express";
import HttpError from "../models/http-error";
import { validationResult } from "express-validator";
import BlogPost from "../models/blogPost-model";
import { IBlogPost } from "./../models/blogPost-model";
import User, { IUser } from "../models/user-model";
import Category, { ICategory } from "../models/category-model";
import { correctResponse } from "../utils";

export const getBlogPosts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let blogPosts;
  try {
    blogPosts = await BlogPost.find({}); //pass dışındakiler döner
  } catch (_) {
    return next(new HttpError("Something went wrong, Couldnt find posts", 500));
  }

  if (!blogPosts) {
    return next(new HttpError("Couldnt find place", 404));
  }
  return res.json({
    blogPosts: blogPosts.map((post) => correctResponse(post.toObject({ getters: true }))),
  });
};

export const createBlogPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validationError = validationResult(req);
  if (!validationError.isEmpty()) {
    return next(new HttpError("Invalid data sent", 422));
  }
  const { title, content, imageUrl, author, date, tags, categoryId } = req.body;

  const createdBlogPost = new BlogPost({
    title,
    content,
    imageUrl,
    author,
    date,
    tags,
    categoryId,
  });

  //#region find and select user
  let user: IUser | null;
  try {
    user = await User.findById(author);
  } catch (error) {
    return next(new HttpError("Couldnt find user, Creating blogpost failed", 500));
  }

  if (!user) {
    return next(new HttpError("Couldnt find user, Creating blogpost failed", 404));
  }
  //#endregion


  //#region find and select category
  let category: ICategory | null = null;

  try {
    category = await Category.findById(categoryId);
  } catch (error) {
    return next(new HttpError("Something went wrong. Couldn't find category id.", 500));
  }

  if (categoryId && !category) {
    return next(new HttpError("Couldn't find category id.", 404));
  }
  //#endregion


  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    console.log(createdBlogPost)
    const _createdBP = await createdBlogPost.save({ session });
    console.log(_createdBP._id)
    user.blogPosts.push(_createdBP._id);
    await user.save({ session });
    if (category) {
      category.blogPosts.push(_createdBP._id);
      await category.save({ session });
    }
    await session.commitTransaction();
  } catch (err) {
    return next(new HttpError(err, 500));
  }

  res.status(201).json({ blogPost: correctResponse(createdBlogPost.toObject({ getters: true })) });
};

export const deleteBlogPostById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validationError = validationResult(req);
  if (!validationError.isEmpty()) {
    return next(new HttpError("Invalid data sent", 422));
  }
  const blogPostId: string = req.params.bpid;

  //#region find blog post
  let blogPost: IBlogPost | null = null;
  try {
    blogPost = await BlogPost.findById(blogPostId);
  } catch (error) {
    return next(new HttpError("Sometihng went wrong. Couldn't delete blog post.", 500));
  }
  if (!blogPost) {
    return next(new HttpError("Couldn't find blog post for provided id.", 404));
  }
  //#endregion

  //#region find and select user
  let user: IUser | null;
  try {
    user = await User.findById(blogPost.author);
  } catch (error) {
    return next(new HttpError("Sometihng went wrong. Couldn't delete blog post from user.", 500));
  }

  if (!user) {
    return next(new HttpError("Couldn't delete blog post from user.", 404));
  }
  //#endregion


  //#region find and select category
  let category: ICategory | null;
  try {
    category = await Category.findById(blogPost.categoryId);
  } catch (error) {
    return next(new HttpError("Sometihng went wrong. Couldn't delete blog post from category.", 500));
  }

  if (!category) {
    return next(new HttpError("Couldn't delete blog post from category.", 404));
  }
  //#endregion

  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    blogPost?.deleteOne({ session });
    //#region without populate way

    user?.blogPosts.splice(
      user?.blogPosts.findIndex((blogPost) => blogPost.toHexString() === blogPostId),
      1
    );
    await user?.save({ session });
    category?.blogPosts.splice(
      category?.blogPosts.findIndex((blogPost) => blogPost.toHexString() === blogPostId),
      1
    );
    await category?.save({ session });

    //#endregion
    await session.commitTransaction();
  } catch (error) {
    return next(
      new HttpError("Something went wrong, couldnt delete place", 500)
    );
  }

  res.status(201).json({ message: "Delete successful", blogPost: correctResponse(blogPost.toObject({ getters: true })) });
};

