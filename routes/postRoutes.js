import express from "express";
import { createPost, getPosts } from "../controllers/postsController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const postRouter = express.Router();

// Post routes
postRouter.post("/create-post", authMiddleware, createPost); // Assuming you want to use the same controller for creating posts
postRouter.get("/posts", getPosts); // Assuming you want to use the same controller for getting posts
postRouter.get("/post/:query", getPosts); // Assuming you want to use the same controller for searching posts

export { postRouter };
