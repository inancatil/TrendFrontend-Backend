import { Router } from "express";
import { check } from "express-validator";
import * as blogPostController from "../controllers/blogPost-controller";
import { authorize } from "../middleware/authorize";

const blogPostRouter = Router();

blogPostRouter.get("/", authorize(), blogPostController.getBlogPosts);

/*
check("prop") controllerda tanımlı olan objenin prop larında hangisinin validate
olmasını istiyorsak onu yazıyoruz */
blogPostRouter.post(
  "/",
  authorize(),
  blogPostController.blogPostSchema,
  blogPostController.createBlogPost
);

blogPostRouter.patch(
  "/:bpid",
  authorize(),
  blogPostController.blogPostSchema,
  blogPostController.updateBlogPost
);

blogPostRouter.delete(
  "/:bpid",
  authorize(),
  blogPostController.deleteBlogPostById
);

export default blogPostRouter;
