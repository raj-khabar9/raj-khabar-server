import express from "express";
import {
  createPost,
  getPosts,
  searchPosts,
  getPostsByCategoryAndSubcategory,
  getCaroucelPost
} from "../controllers/postsController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const postRouter = express.Router();

// Post routes
postRouter.post("/create-post", authMiddleware, createPost); // Assuming you want to use the same controller for creating posts
postRouter.get(
  "/category/:categorySlug/subcategory/:subcategorySlug",
  getPostsByCategoryAndSubcategory
); // Assuming you want to use the same controller for getting posts by category and subcategory
postRouter.get("/search/:query", searchPosts); // Assuming you want to use the same controller for searching posts
postRouter.get("/posts", getPosts); // Assuming you want to use the same controller for getting posts
postRouter.get("/get-caroucel-posts", getCaroucelPost);

export { postRouter };
