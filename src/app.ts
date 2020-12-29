import express, { NextFunction, Request, Response } from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import {
  usersRouter,
  categoriesRouter,
  tagsRouter,
  blogPostRouter,
} from "./routes";
import HttpError from "./models/http-error";
import User from "./models/user-model";
import bcrypt from "bcryptjs";
import { errorHandler } from "./middleware/error-handler";
import cors from "cors";

const app = express();

async function createTestUser() {
  // create test user if the db is empty
  if ((await User.countDocuments({})) === 1) {
    const user = new User({
      name: "Test",
      email: "test",
      blogPosts: [],
      password: bcrypt.hashSync("test", 10),
      role: "Admin",
    });
    await user.save();
  }
}

//createTestUser();

app.use(bodyParser.json());

app.use(cookieParser());
app.use(
  cors({
    origin: (_, callback) => callback(null, true),
    credentials: true,
  })
);

app.use("/api/users", usersRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/tags", tagsRouter);
app.use("/api/blogPosts", blogPostRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new HttpError("Couldnt find this route", 404);
  throw error;
});

app.use(errorHandler);

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.e6ma4.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }
  )
  .then(() => {
    app.listen(4000, () => {
      console.log("Server started");
    });
  })
  .catch((err) => {
    console.log(err);
  });
