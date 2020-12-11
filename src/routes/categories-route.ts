import { Router } from "express";
import { check } from "express-validator";
import * as categoriesController from "../controllers/categories-controller";
import checkAuth from "../middleware/check-auth";

const categoriesRouter = Router();

categoriesRouter.get("/", categoriesController.getCategories);

categoriesRouter.use(checkAuth);

/*
check("prop") controllerda tanımlı olan objenin prop larında hangisinin validate
olmasını istiyorsak onu yazıyoruz */
categoriesRouter.post(
  "/",
  [check("name").isLength({ min: 3 })],
  categoriesController.createCategory
);

// placesRouter.patch(
//   "/:pid",
//   [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
//   placesController.updatePlace
// );

categoriesRouter.delete("/:pcid", categoriesController.deleteCategory);

export default categoriesRouter;