import mongoose from "mongoose";

import { NextFunction, Request, Response } from "express";
import HttpError from "../models/http-error";
import { validationResult } from "express-validator";
import Tag, { ITag } from "../models/tag-model";

export const getTags = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let tags;
  try {
    tags = await Tag.find({});
  } catch (_) {
    return next(new HttpError("Something went wrong, Couldnt find place", 500));
  }

  if (!tags) {
    return next(new HttpError("Couldnt find place", 404));
  }
  return res.json({
    users: tags.map((tag) => tag.toObject({ getters: true })),
  });
};

export const createTag = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validationError = validationResult(req);
  if (!validationError.isEmpty()) {
    return next(new HttpError("Invalid data sent", 422));
  }

  const { name } = req.body;
  const createdTag = new Tag({
    name,
  });

  try {
    await createdTag.save();
  } catch (err) {
    return next(new HttpError("Creating place failed", 500));
  }

  res.status(201).json({ createdTag });
};

export const deleteTag = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { categoryId } = req.body;
  let tag: ITag | null;
  try {
    tag = await Tag.findById(categoryId);
  } catch (error) {
    return next(
      new HttpError("Something went wrong, couldnt delete place", 500)
    );
  }
  if (!tag) {
    return next(new HttpError("Place couldnt found", 404));
  }

  //User ve blogpost tablosundan category e sahip olanlar da silince
  //   try {
  //     const session = await mongoose.startSession();
  //     session.startTransaction();

  //     category?.deleteOne({ session });
  //     //#region without populate way
  //     const user: IUser | null = await User.findById(place.creator);
  //     user?.places.splice(
  //       user?.places.findIndex((place) => place._id === placeId),
  //       1
  //     );
  //     await user?.save({ session });
  //     //#endregion
  //     await session.commitTransaction();
  //   } catch (error) {
  //     return next(
  //       new HttpError("Something went wrong, couldnt delete place", 500)
  //     );
  //   }
  res.status(200).json({ message: "place deleted" });
};

//UPDATE EKLENCEK
