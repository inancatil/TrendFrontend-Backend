import { Router } from "express";
import { check } from "express-validator";
import * as blogPostController from "../controllers/blogPost-controller";
import checkAuth from "../middleware/check-auth";

const blogPostRouter = Router();

blogPostRouter.get("/", blogPostController.getBlogPosts);

blogPostRouter.use(checkAuth);

/*
check("prop") controllerda tanımlı olan objenin prop larında hangisinin validate
olmasını istiyorsak onu yazıyoruz */
blogPostRouter.post("/", blogPostController.createBlogPost);

// placesRouter.patch(
//   "/:pid",
//   [check("title").not().isEmpty(), check("description").isLength({ min: 5 })],
//   placesController.updatePlace
// );

blogPostRouter.delete("/:bpid", blogPostController.deleteBlogPostById);

export default blogPostRouter;
