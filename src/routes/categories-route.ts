import { Router } from "express";
import { check } from "express-validator";
import * as categoriesController from "../controllers/categories-controller";
import { authorize } from "../middleware/authorize";

const categoriesRouter = Router();

categoriesRouter.get("/", categoriesController.getCategories);

/*
check("prop") controllerda tanımlı olan objenin prop larında hangisinin validate
olmasını istiyorsak onu yazıyoruz */
categoriesRouter.post(
  "/",
  authorize(),
  categoriesController.categorySchema,
  categoriesController.createCategory
);

// placesRouter.patch(
//   "/:pid",
//   [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
//   placesController.updatePlace
// );

categoriesRouter.delete(
  "/:pcid",
  authorize(["Admin"]),
  categoriesController.deleteCategory
);

export default categoriesRouter;
