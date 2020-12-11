import { Router } from "express";
import { check } from "express-validator";
import * as tagsController from "../controllers/tags-controller";
import checkAuth from "../middleware/check-auth";

const tagsRouter = Router();

tagsRouter.get("/", tagsController.getTags);

tagsRouter.use(checkAuth);

/*
check("prop") controllerda tanımlı olan objenin prop larında hangisinin validate
olmasını istiyorsak onu yazıyoruz */
tagsRouter.post(
  "/",
  [check("name").isLength({ min: 3 })],
  tagsController.createTag
);

// placesRouter.patch(
//   "/:pid",
//   [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
//   placesController.updatePlace
// );

tagsRouter.delete("/:pid", tagsController.deleteTag);

export default tagsRouter;
