import mongoose from "mongoose";

import { NextFunction, Request, Response } from "express";
import HttpError from "../models/http-error";
import { validationResult } from "express-validator";
import Category, { ICategory } from "../models/category-model";
import User, { IUser } from "../models/user-model";
import BlogPost, { IBlogPost } from "../models/blogPost-model";
import { decodeBase64 } from "bcryptjs";

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let categories;
  try {
    //users = await User.find({}, "email name"); //sadece email pass döner
    categories = await Category.find({}); //pass dışındakiler döner
  } catch (_) {
    return next(new HttpError("Something went wrong, Couldnt find place", 500));
  }

  if (!categories) {
    return next(new HttpError("Couldnt find place", 404));
  }
  return res.json({
    categories: categories.map((category) =>
      category.toObject({ getters: true })
    ),
  });
};

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validationError = validationResult(req);
  if (!validationError.isEmpty()) {
    return next(new HttpError("Invalid data sent", 422));
  }

  const { name } = req.body;
  const createdCategory = new Category({
    name,
    blogPosts: [],
  });

  try {
    await createdCategory.save();
  } catch (err) {
    return next(new HttpError("Creating place failed", 500));
  }

  res.status(201).json({ createdCategory });
};

export const deleteCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const categoryId = req.params.pcid;
  let category: ICategory | null;
  try {
    category = await Category.findById(categoryId);
  } catch (error) {
    return next(new HttpError("Something went wrong, couldnt find place", 500));
  }
  if (!category) {
    return next(new HttpError("Place couldnt found", 404));
  }

  let blogPosts: IBlogPost[] | null;
  try {
    blogPosts = await BlogPost.find({ categoryId });
  } catch (error) {
    return next(
      new HttpError("Error at deleting from blogPosts collection", 500)
    );
  }
  if (!blogPosts) {
    return next(new HttpError("Place couldnt found", 404));
  }

  let users: IUser[] | null;
  let blogIds = blogPosts.map((post) => post._id);
  try {
    users = await User.find({
      blogPosts: {
        $all: blogIds,
      },
    });
  } catch (error) {
    return next(
      new HttpError("Something went wrong, couldnt delete place from user", 500)
    );
  }
  if (!users) {
    return next(new HttpError("Error at deleting from user collection", 404));
  }

  console.log(category);
  console.log(blogPosts);
  console.log(users);

  //User ve blogpost tablosundan category e sahip olanlar da silince
  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    category?.deleteOne({ session });

    //#region without populate way
    users.forEach(async (user) => {
      const userSchema: IUser = user;
      userSchema?.blogPosts.sort().splice(
        userSchema?.blogPosts.findIndex(
          (post) => post.toString() === categoryId
        ),
        category?.blogPosts.length
      );
      await userSchema?.save({ session });
    });

    //#endregion
    await session.commitTransaction();
  } catch (error) {
    return next(
      new HttpError("Something went wrong, couldnt delete place", 500)
    );
  }
  res.status(200).json({ message: "place deleted" });
};

//UPDATE YAZILACAK
