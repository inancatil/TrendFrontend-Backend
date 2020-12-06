import { NextFunction, Response, Request } from "express";
import { sign, verify } from "jsonwebtoken";
import HttpError from "../models/http-error";

export default function (req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return next(new HttpError("Auth failed. Login first.", 401));
    }
    verify(token, "supersecret_dont_share");
    //???????????????????????????????????????
    // const decodedToken: any = verify(token, "supersecret_dont_share");
    // req.body.userData = {
    //   userId: decodedToken.userId,
    //   email: decodedToken.email,
    // };
    next();
  } catch (error) {
    return next(new HttpError("Auth failed. Login first.", 401));
  }
}
