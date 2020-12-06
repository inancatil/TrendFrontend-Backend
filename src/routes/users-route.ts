import { Router } from "express";
import { check } from "express-validator";
import * as usersController from "../controllers/users-controller";
const usersRouter = Router();

usersRouter.get("/", usersController.getUsers);

usersRouter.post(
  "/signup",
  [
    check("name").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").not().isEmpty(),
  ],
  usersController.signup
);

usersRouter.post("/login", usersController.login);

export default usersRouter;
