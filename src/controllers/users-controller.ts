import { NextFunction, Request, Response } from "express";

import Joi from "joi";
import { validateRequest } from "../middleware/validate-request";
import * as userService from "../services/user-service";

export function authenticateSchema(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const schema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const { email, password } = req.body;
  const ipAddress = req.ip;
  userService
    .authenticate(email, password, ipAddress)
    .then(({ refreshToken, ...user }) => {
      setTokenCookie(res, refreshToken);
      res.json(user);
    })
    .catch((e) => {
      return next(e);
    });
}

export function refreshToken(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies.refreshToken;
  const ipAddress = req.ip;
  userService
    .refreshToken(token, ipAddress)
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
    token: Joi.string().empty(""),
  });
  validateRequest(req, next, schema);
}

export async function revokeToken(req: any, res: Response, next: NextFunction) {
  // accept token from request body or cookie
  const token = req.body.token || req.cookies.refreshToken;
  const ipAddress = req.ip;
  if (!token) return res.status(400).json({ message: "Token is required" });

  // users can revoke their own tokens and admins can revoke any tokens
  if (!req.user.ownsToken(token) && req.user.role !== "Admin") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  await userService
    .revokeToken(token, ipAddress)
    .then(() => res.json({ message: "Token revoked" }))
    .catch(next);
  return next;
}

export function getAll(req: Request, res: Response, next: NextFunction) {
  userService
    .getAll()
    .then((users) => res.json(users))
    .catch(next);
}

export function getById(req: any, res: Response, next: NextFunction) {
  // regular users can get their own record and admins can get any record
  if (req.params.id !== req.user.id && req.user.role !== "Admin") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  userService
    .getById(req.params.id)
    .then((user) => (user ? res.json(user) : res.sendStatus(404)))
    .catch(next);

  return next;
}

export function getRefreshTokens(req: any, res: Response, next: NextFunction) {
  // users can get their own refresh tokens and admins can get any user's refresh tokens
  if (req.params.id !== req.user.id && req.user.role !== "Admin") {
    return res.status(401).json({ message: "Unauthorized" });
  }

  userService
    .getRefreshTokens(req.params.id)
    .then((tokens) => (tokens ? res.json(tokens) : res.sendStatus(404)))
    .catch(next);
  return next;
}

// helper functions

export function setTokenCookie(res: Response, token: string) {
  // create http only cookie with refresh token that expires in 7 days
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };
  res.cookie("refreshToken", token, cookieOptions);
}

export function createNewUser(req: Request, res: Response, next: NextFunction) {
  const { name, email, password, role } = req.body;
  //add check here

  userService
    .createNewUser(name, email, password, role)
    .then((...user) => res.json(user))
    .catch((e) => {
      return next(e);
    });
  return next;
}
