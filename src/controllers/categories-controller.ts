import mongoose from "mongoose";

import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import Category, { ICategory } from "../models/category-model";
import BlogPost, { IBlogPost } from "../models/blogPost-model";
import Joi from "joi";
import { validateRequest } from "../middleware/validate-request";

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let categories;
  try {
    //users = await User.find({}, "email name"); //sadece email pass döner
    categories = await Category.find({}, "-__v"); //pass dışındakiler döner
  } catch (_) {
    return next("Something went wrong, Couldnt find categories");
  }

  if (!categories) {
    return next("Couldnt find categories");
  }
  return res.status(200).json({
    categories: categories.map((category) => {
      return category.toJSON();
    }),
  });
};

export function categorySchema(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const schema = Joi.object({
    name: Joi.string().required().min(3),
  });
  validateRequest(req, next, schema);
}

export const createCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validationError = validationResult(req);
  if (!validationError.isEmpty()) {
    return next(validationError.array());
  }

  const { name } = req.body;
  const createdCategory = new Category({
    name,
    blogPosts: [],
  });

  try {
    await createdCategory.save();
  } catch (err) {
    return next("Creating category failed");
  }

  res.status(201).json({
    category: createdCategory.toJSON(),
  });
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
    return next("Something went wrong, couldnt find category");
  }
  if (!category) {
    return next("Category couldnt found");
  }

  let blogPosts: IBlogPost[] | null;
  try {
    blogPosts = await BlogPost.find({ categoryId });
  } catch (error) {
    return next("Error at deleting from blogPosts collection");
  }
  if (!blogPosts) {
    return next("Category couldnt found");
  }

  //User ve blogpost tablosundan category e sahip olanlar da silince
  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    category?.deleteOne({ session });

    await BlogPost.updateMany(
      { categoryId },
      { categoryId: null },
      { session }
    );

    await session.commitTransaction();
  } catch (error) {
    return next("Something went wrong, couldnt delete category");
  }
  res.status(200).json({
    message: "category deleted",
    category: category.toJSON(),
  });
};

//UPDATE YAZILACAK
