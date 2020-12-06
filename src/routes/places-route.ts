import { Router } from "express";
import { check } from "express-validator";
import * as placesController from "../controllers/places-controller";
import checkAuth from "../middleware/check-auth";

const placesRouter = Router();

placesRouter.get("/", placesController.getAllPlaces);

placesRouter.get("/:pid", placesController.getPlaceById);

placesRouter.get("/user/:uid", placesController.getPlacesByUserId);

placesRouter.use(checkAuth);

/*
check("prop") controllerda tanımlı olan objenin prop larında hangisinin validate
olmasını istiyorsak onu yazıyoruz */
placesRouter.post(
  "/",
  [
    check("title").not().isEmpty(),
    check("description").isLength({ min: 5 }),
    check("address").not().isEmpty(),
    check("creator").not().isEmpty(),
  ],
  placesController.createPlace
);

placesRouter.patch(
  "/:pid",
  [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
  placesController.updatePlace
);

placesRouter.delete("/:pid", placesController.deletePlace);

export default placesRouter;
