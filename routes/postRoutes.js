import express from "express";
import {
  createPost,
  getPosts,
  searchPosts,
  getPostsByCategoryAndSubcategory,
  getCaroucelPost,
  getPostBySlug,
  deletePost,
  updatePost,
  getPostById,
  getRelatedPosts
} from "../controllers/postsController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";
import multer from "multer";
const upload = multer();

const postRouter = express.Router();

// Post routes
postRouter.post(
  "/create-post",
  authMiddleware,
  upload.single("image"),
  createPost
); // Assuming you want to use the same controller for creating posts
postRouter.get(
  "/category/:categorySlug/subcategory/:subcategorySlug",
  getPostsByCategoryAndSubcategory
); // Assuming you want to use the same controller for getting posts by category and subcategory
postRouter.get("/search/:query", searchPosts); // Assuming you want to use the same controller for searching posts
postRouter.get("/posts", getPosts); // Assuming you want to use the same controller for getting posts
postRouter.get("/get-caroucel-posts", getCaroucelPost);
postRouter.get("/posts/:slug", getPostBySlug); // Assuming you want to use the same controller for getting post by slug
postRouter.get("/posts/id/:id", getPostById); // Assuming you want to use the same controller for getting post by ID
postRouter.delete("/:id", authMiddleware, deletePost);
postRouter.patch("/:id", upload.single("image"), authMiddleware, updatePost);
postRouter.get("/related/:slug", getRelatedPosts);

export { postRouter };
