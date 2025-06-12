import express from "express";

import {
  createTablePost,
  getTablePosts,
  getTablePostBySlug,
  UpdateTablePost,
  deleteTablePost,
  getTablePostsByCategoryAndSubcategory
} from "../controllers/tableController.js";

import { authMiddleware } from "../middleware/authmiddleware.js";

const tablePostRouter = express.Router();

// Route to create a new table post
tablePostRouter.post("/create-table-post", authMiddleware, createTablePost);
tablePostRouter.get("/get-table-posts", getTablePosts);
tablePostRouter.get("/get-table-post/:slug", getTablePostBySlug);
tablePostRouter.put(
  "/update-table-post/:slug",
  authMiddleware,
  UpdateTablePost
);
tablePostRouter.delete(
  "/delete-table-post/:id",
  authMiddleware,
  deleteTablePost
);
tablePostRouter.get(
  "/get-table-posts/category/:categorySlug/subcategory/:subcategorySlug",
  getTablePostsByCategoryAndSubcategory
);

export { tablePostRouter };
