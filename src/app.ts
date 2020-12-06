import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";

import { placesRouter, usersRouter } from "./routes";
import HttpError, { ICustomErrorHandler } from "./models/http-error";

const app = express();

app.use(bodyParser.json());
app.use("/api/places", placesRouter);
app.use("/api/users", usersRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new HttpError("Couldnt find this route", 404);
  throw error;
});

app.use(
  (
    error: ICustomErrorHandler,
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    if (res.headersSent) {
      return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || "An unknown error" });
  }
);

/*
admin
L0Mmy8OtpyG8BjKj
 */
mongoose
  .connect(
    "mongodb+srv://admin:L0Mmy8OtpyG8BjKj@cluster0.e6ma4.mongodb.net/trendfrontenddb?retryWrites=true&w=majority",
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
  )
  .then(() => {
    app.listen(80, () => {
      console.log("Server started");
    });
  })
  .catch((err) => {
    console.log(err);
  });
