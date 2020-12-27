import { Router } from "express";
import { check } from "express-validator";
import * as tagsController from "../controllers/tags-controller";
import { authorize } from "../middleware/authorize";

const tagsRouter = Router();

tagsRouter.get("/", tagsController.getTags);

/*
check("prop") controllerda tanımlı olan objenin prop larında hangisinin validate
olmasını istiyorsak onu yazıyoruz */
tagsRouter.post("/", authorize(), tagsController.createTags);

// placesRouter.patch(
//   "/:pid",
//   [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
//   placesController.updatePlace
// );

tagsRouter.delete("/:pid", authorize(), tagsController.deleteTag);

export default tagsRouter;
