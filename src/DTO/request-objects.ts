import { Request } from "express";
export interface IGetUserAuthInfoRequest extends Request {
  userData: {
    userId: string; // or any other type
    email: string;
  };
}
