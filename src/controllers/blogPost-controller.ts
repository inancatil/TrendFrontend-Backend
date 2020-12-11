import mongoose from "mongoose";

import { NextFunction, Request, Response } from "express";
import HttpError from "../models/http-error";
import { validationResult } from "express-validator";
import BlogPost from "../models/blogPost-model";
import { IBlogPost } from "./../models/blogPost-model";

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
    users: blogPosts.map((post) => post.toObject({ getters: true })),
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

  try {
    await createdBlogPost.save();
  } catch (err) {
    return next(new HttpError("Creating place failed", 500));
  }

  res.status(201).json({ createdBlogPost });
};
