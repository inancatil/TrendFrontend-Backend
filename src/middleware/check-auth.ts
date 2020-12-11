import { NextFunction, Response, Request } from "express";
import { sign, verify } from "jsonwebtoken";
import HttpError from "../models/http-error";

export default function (req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return next(new HttpError("Auth failed. Login first.", 401));
    }
    verify(token, `${process.env.JWT_KEY}`);
    //???????????????????????????????????????
    // const decodedToken: any = verify(token, `${process.env.JWT_KEY}`);
    // req.body.userData = {
    //   userId: decodedToken.userId,
    //   email: decodedToken.email,
    // };
    next();
  } catch (error) {
    return next(new HttpError("Auth failed. Login first.", 401));
  }
}
