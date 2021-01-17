import jwt from "express-jwt";
import { Request, Response, NextFunction } from "express";
import User from "../models/user-model";
import RefreshToken from "../models/refreshToken-model";
import { IRole } from "../helpers/role";

export function authorize(roles: IRole[] = []) {
  // roles param can be a single role string (e.g. Role.User or 'User')
  // or an array of roles (e.g. [Role.Admin, Role.User] or ['Admin', 'User'])
  // if (typeof roles === "string") {
  //   roles = [roles];
  // }

  return [
    // authenticate JWT token and attach user to request object (req.user)
    jwt({ secret: `${process.env.JWT_KEY}`, algorithms: ["HS256"] }),

    // authorize based on user role
    async (req: any, res: any, next: any) => {
      const user = await User.findById(req.user.id);
      if (!user || (roles.length && !roles.includes(user.role))) {
        // user no longer exists or role not authorized

        return res.status(401).json({ message: "Unauthorized" });
      }
      // authentication and authorization successful
      req.user.role = user.role;
      const refreshTokens = await RefreshToken.find({ userId: user.id });
      req.user.ownsToken = (token: string) =>
        !!refreshTokens.find((x) => x.token === token);
      next();
    },
  ];
}
