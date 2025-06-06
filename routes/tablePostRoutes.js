import express from "express";

import {
  createTablePost,
  getTablePosts,
  getTablePostsByCategoryAndSubcategory
} from "../controllers/tableController.js";

import { authMiddleware } from "../middleware/authmiddleware.js";

const tablePostRouter = express.Router();

// Route to create a new table post
tablePostRouter.post("/create-table-post", authMiddleware, createTablePost);
tablePostRouter.get("/get-table-posts", getTablePosts);
tablePostRouter.get(
  "/get-table-posts/category/:categorySlug/subcategory/:subcategorySlug",
  getTablePostsByCategoryAndSubcategory
);

export { tablePostRouter };
