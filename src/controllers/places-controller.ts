import mongoose from "mongoose";

import { NextFunction, Request, Response } from "express";
import HttpError from "../models/http-error";
import { validationResult } from "express-validator";
import Place, { IPlace } from "../models/place-model";
import User, { IUser } from "./../models/user-model";

export const getAllPlaces = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let places;
  try {
    places = await Place.find({});
  } catch (_) {
    return next(new HttpError("Something went wrong, Couldnt find place", 500));
  }

  if (!places) {
    return next(new HttpError("Couldnt find place", 404));
  }
  return res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
};

export const getPlaceById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const placeId = req.params.pid; //{pid:"p1"} *Tanımladıgımız dynamic pid key olarak geliyor

  let place;
  try {
    place = await Place.findById(placeId);
  } catch (_) {
    return next(new HttpError("Something went wrong, Couldnt find place", 500));
  }

  if (!place) {
    return next(new HttpError("Couldnt find place", 404));
  }
  return res.json({ place: place.toObject({ getters: true }) });
};

export const getPlacesByUserId = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const userId = req.params.uid; //{pid:"p1"} *Tanımladıgımız dynamic pid key olarak geliyor
  let places;
  try {
    places = await Place.find({ creator: userId });
  } catch (_) {
    return next(
      new HttpError(
        "Something went wrong, Couldnt find place with user id",
        500
      )
    );
  }

  if (!places || places.length === 0) {
    return next(new HttpError("Couldnt find place for user", 404));
  }
  return res.json({
    places: places.map((place: any) => place.toObject({ getters: true })),
  });
};

export const createPlace = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validationError = validationResult(req);
  if (!validationError.isEmpty()) {
    return next(new HttpError("Invalid data sent", 422));
  }
  const { title, description, address, creator } = req.body;
  const createdPlace = new Place({
    title,
    description,
    address,
    creator,
  });

  let user: IUser | null;
  try {
    user = await User.findById(creator);
  } catch (error) {
    return next(new HttpError("Couldnt find user, Creating place failed", 500));
  }

  if (!user) {
    return next(new HttpError("Couldnt find user, Creating place failed", 404));
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await createdPlace.save({ session });
    user.places.push(createdPlace);
    await user.save({ session });
    await session.commitTransaction();
  } catch (err) {
    return next(new HttpError("Creating place failed", 500));
  }

  res.status(201).json({ createdPlace });
};

export const updatePlace = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const validationError = validationResult(req);
  if (!validationError.isEmpty()) {
    return next(new HttpError("Invalid data sent", 422));
  }
  const { title, description } = req.body;
  const placeId = req.params.pid;

  let place: IPlace | null;
  try {
    place = await Place.findById(placeId);
  } catch (_) {
    return next(new HttpError("Something went wrong, Couldnt find place", 500));
  }

  place!.title = title;
  place!.description = description;

  try {
    await place?.save();
  } catch (error) {
    return next(
      new HttpError("Something went wrong, couldnt update place", 500)
    );
  }

  res.status(200).json({ place: place?.toObject({ getters: true }) });
};

export const deletePlace = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const placeId = req.params.pid;
  let place: IPlace | null;
  try {
    place = await Place.findById(placeId);
  } catch (error) {
    return next(
      new HttpError("Something went wrong, couldnt delete place", 500)
    );
  }
  if (!place) {
    return next(new HttpError("Place couldnt found", 404));
  }
  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    place?.deleteOne({ session });
    //#region without populate way
    const user: IUser | null = await User.findById(place.creator);
    user?.places.splice(
      user?.places.findIndex((place) => place._id === placeId),
      1
    );
    await user?.save({ session });
    //#endregion
    await session.commitTransaction();
  } catch (error) {
    return next(
      new HttpError("Something went wrong, couldnt delete place", 500)
    );
  }
  res.status(200).json({ message: "place deleted" });
};
