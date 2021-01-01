import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  switch (true) {
    case typeof err === "string":
      // custom application error
      const is404 = err.toLowerCase().endsWith("not found");
      const statusCode = is404 ? 404 : 400;
      return res.status(statusCode).json({ error: { messages: [err] } });
    case err.name === "ValidationError":
      // mongoose validation error
      return res.status(400).json({ error: { messages: [err.message] } });
    case err.name === "UnauthorizedError":
      // jwt authentication error
      return res.status(401).json({ error: { messages: ["Unauthorized"] } });
    case err.name === "JoeValidationError":
      return res.status(400).json({ error: err });
    default:
      return res.status(500).json({ error: { messages: [err.message] } });
  }
}
