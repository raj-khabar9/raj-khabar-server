import express from "express";

import {
  createCardPost,
  getAllCardPosts,
  getCardPostBySlug,
  getCardPostsByCategory,
  updateCardPost,
  deleteCardPost,
  deleteCardById
} from "../controllers/cardController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const cardRouter = express.Router();

cardRouter.post("/create-card", authMiddleware, createCardPost);
cardRouter.get(
  "/category/:parentSlug/subcategory/:subCategorySlug",
  getCardPostsByCategory
);

cardRouter.get("/get-all-card-posts", getAllCardPosts);

cardRouter.get("/get-card-post/:slug", getCardPostBySlug);

cardRouter.put(
  "/update/:slug",
  authMiddleware,
  updateCardPost
);

cardRouter.delete(
  "/delete/:parentSlug/:subCategorySlug/:slug",
  authMiddleware,
  deleteCardPost
);

cardRouter.delete("/delete/:id", authMiddleware, deleteCardById);

export { cardRouter };
