import { Router } from "express";
import { check } from "express-validator";
import * as usersController from "../controllers/users-controller";
import { authorize } from "../middleware/authorize";
const usersRouter = Router();

usersRouter.post(
  "/create-user",
  authorize(["Admin"]),
  usersController.createNewUser
);

usersRouter.post(
  "/authenticate",
  usersController.authenticateSchema,
  usersController.authenticate
);
usersRouter.post("/refresh-token", usersController.refreshToken);
usersRouter.post(
  "/revoke-token",
  authorize(),
  usersController.revokeTokenSchema,
  usersController.revokeToken
);
usersRouter.get("/", authorize(["Admin"]), usersController.getAll);
usersRouter.get("/:id", authorize(), usersController.getById);
usersRouter.get(
  "/:id/refresh-tokens",
  authorize(),
  usersController.getRefreshTokens
);

export default usersRouter;
