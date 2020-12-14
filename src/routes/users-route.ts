import { Router } from "express";
import { check } from "express-validator";
import * as usersController from "../controllers/users-controller";
import { authorize } from "../middleware/authorize";
const usersRouter = Router();


usersRouter.post('/authenticate', usersController.authenticateSchema, usersController.authenticate);
usersRouter.post('/refresh-token', usersController.refreshToken);
usersRouter.post('/revoke-token', authorize(), usersController.revokeTokenSchema, usersController.revokeToken);
usersRouter.get('/', authorize(["Admin"]), usersController.getAll);
usersRouter.get('/:id', authorize(), usersController.getById);
usersRouter.get('/:id/refresh-tokens', authorize(), usersController.getRefreshTokens);



// usersRouter.get("/", usersController.getUsers);

// usersRouter.post(
//   "/signup",
//   [
//     check("name").not().isEmpty(),
//     check("email").normalizeEmail().isEmail(),
//     check("password").not().isEmpty(),
//   ],
//   usersController.signup
// );

// usersRouter.post("/login", usersController.login);

export default usersRouter;
