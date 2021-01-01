import mongoose from "mongoose";

import { NextFunction, Request, Response } from "express";
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
    return next("Something went wrong, Couldnt find tag");
  }

  if (!tags) {
    return next("Couldnt find tag");
  }
  return res.json({
    tags: tags.map((tag) => tag.toJSON()),
  });
};

export const createTags = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validationError = validationResult(req);
  if (!validationError.isEmpty()) {
    return next("Invalid data sent");
  }

  const { tags } = req.body;
  let newTags = await Tag.find({ $nin: tags });
  console.log(tags);
  console.log(newTags);
  try {
    //await createdTag.save();
    const promises = newTags.map(function (tag: ITag) {
      //here i am assigning foreign key
      let alldata = new Tag(tag);
      return alldata.save();
    });
    await Promise.all(promises);
  } catch (err) {
    return next("Creating tag failed");
  }

  res.status(201).json({ tags });
};

export const deleteTag = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { category } = req.body;
  let tag: ITag | null;
  try {
    tag = await Tag.findById(category);
  } catch (error) {
    return next("Something went wrong, couldnt delete tag");
  }
  if (!tag) {
    return next("Tag couldnt found");
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
  //       "Something went wrong, couldnt delete place", 500)
  //     );
  //   }
  res.status(200).json({ message: "Tag deleted" });
};

//UPDATE EKLENCEK
