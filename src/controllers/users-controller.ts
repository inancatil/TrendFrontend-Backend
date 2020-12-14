import express, { NextFunction, Request, Response } from "express";
import HttpError from "../models/http-error";
import { validationResult } from "express-validator";
import User, { IUser } from "../models/user-model";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { correctResponse } from "../utils";


import Joi from "joi"
import { validateRequest } from "../middleware/validate-request"
import * as userService from "../services/user-service"


export function authenticateSchema(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const schema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required()
  });
  validateRequest(req, next, schema);
}

export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { email, password } = req.body;
  const ipAddress = req.ip;
  userService.authenticate(email, password, ipAddress)
    .then(({ refreshToken, ...user }) => {
      setTokenCookie(res, refreshToken);
      res.json(user);
    })
    .catch(next);
}

export function refreshToken(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.cookies.refreshToken;
  const ipAddress = req.ip;
  userService.refreshToken(token, ipAddress)
    .then(({ refreshToken, ...user }) => {
      setTokenCookie(res, refreshToken);
      res.json(user);
    })
    .catch(next);
}

export function revokeTokenSchema(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const schema = Joi.object({
    token: Joi.string().empty('')
  });
  validateRequest(req, next, schema);
}

export async function revokeToken(
  req: any,
  res: Response,
  next: NextFunction
) {
  // accept token from request body or cookie
  const token = req.body.token || req.cookies.refreshToken;
  const ipAddress = req.ip;
  if (!token) return res.status(400).json({ message: 'Token is required' });

  // users can revoke their own tokens and admins can revoke any tokens
  if (!req.user.ownsToken(token) && req.user.role !== "Admin") {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await userService.revokeToken(token, ipAddress)
    .then(() => res.json({ message: 'Token revoked' }))
    .catch(next);
  return next;
}

export function getAll(
  req: Request,
  res: Response,
  next: NextFunction
) {
  userService.getAll()
    .then(users => res.json(users))
    .catch(next);
}

export function getById(
  req: any,
  res: Response,
  next: NextFunction
) {
  // regular users can get their own record and admins can get any record
  if (req.params.id !== req.user.id && req.user.role !== "Admin") {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  userService.getById(req.params.id)
    .then(user => user ? res.json(user) : res.sendStatus(404))
    .catch(next);

  return next;
}

export function getRefreshTokens(
  req: any,
  res: Response,
  next: NextFunction
) {
  // users can get their own refresh tokens and admins can get any user's refresh tokens
  if (req.params.id !== req.user.id && req.user.role !== "Admin") {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  userService.getRefreshTokens(req.params.id)
    .then(tokens => tokens ? res.json(tokens) : res.sendStatus(404))
    .catch(next);
  return next;
}

// helper functions

export function setTokenCookie(res: Response, token: string) {
  // create http only cookie with refresh token that expires in 7 days
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  };
  res.cookie('refreshToken', token, cookieOptions);
}




// export const getUsers = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   let users;
//   try {
//     //users = await User.find({}, "email name"); //sadece email pass döner
//     users = await User.find({}, "-password"); //pass dışındakiler döner
//   } catch (_) {
//     return next(new HttpError("Something went wrong, Couldnt find place", 500));
//   }

//   if (!users) {
//     return next(new HttpError("Couldnt find place", 404));
//   }
//   return res.json({
//     users: users.map((user) => correctResponse(user.toObject({ getters: true }))),
//   });
// };

// export const signup = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const validationError = validationResult(req);
//   if (!validationError.isEmpty()) {
//     return next(new HttpError("Invalid email", 422));
//   }
//   const { name, email, password } = req.body;
//   //#region Check if user email has already in database
//   let existingUser;
//   try {
//     existingUser = await User.findOne({ email });
//   } catch (error) {
//     return next(new HttpError("Signup fail, try again later", 500));
//   }
//   if (existingUser) {
//     return next(new HttpError("User exists already, please login", 422));
//   }
//   //#endregion

//   let hashedPassword: string;
//   try {
//     hashedPassword = await bcrypt.hash(password, 12);
//   } catch (error) {
//     return next(new HttpError("Couldnt create user, please try again", 500));
//   }

//   const createdUser = new User({
//     name,
//     email,
//     password: hashedPassword,
//     blogPosts: [],
//   });
//   try {
//     await createdUser.save();
//   } catch (error) {
//     return next(new HttpError("Creating user failed", 500));
//   }

//   let token: string;
//   try {
//     token = jwt.sign(
//       { userId: createdUser.id, email: createdUser.email },
//       `${process.env.JWT_KEY}`,
//       { expiresIn: "1h" }
//     );
//   } catch (error) {
//     return next(new HttpError("Signup fail, try again later", 500));
//   }
//   res
//     .status(201)
//     .json({
//       userData: { id: createdUser._id, name: createdUser.name, email: createdUser.email, blogPosts: createdUser.blogPosts },
//       authData: { token, userId: createdUser._id }
//     });
// };

// export const login = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { email, password } = req.body;
//   let user: IUser | null;
//   try {
//     user = await User.findOne({ email });
//   } catch (error) {
//     return next(new HttpError("Couldnt find user or password is wrong", 500));
//   }

//   if (!user) {
//     return next(new HttpError("login fail or password is wrong", 401));
//   }

//   let isValidPass: boolean;
//   try {
//     isValidPass = await bcrypt.compare(password, user.password);
//   } catch (error) {
//     return next(new HttpError("login fail or password is wrong", 401));
//   }

//   if (!isValidPass) {
//     return next(new HttpError("login fail or password is wrong", 401));
//   }

//   let token: string;
//   try {
//     token = jwt.sign(
//       { userId: user.id, email: user.email },
//       `${process.env.JWT_KEY}`,
//       { expiresIn: "1h" }
//     );
//   } catch (error) {
//     return next(new HttpError("Login fail, try again later", 500));
//   }

//   res.json({
//     userData: { id: user.id, name: user.name, email: user.email, blogPosts: user.blogPosts },
//     authData: { token, userId: user.id },
//   });
// };

