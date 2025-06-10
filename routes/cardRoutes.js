import express from "express";

import {
  createCardPost,
  getAllCardPosts,
  getCardPostBySlug,
  getCardPostsByCategory,
  updateCardPost,
  deleteCardPost
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
  "/update/:parentSlug/:subCategorySlug/:slug",
  authMiddleware,
  updateCardPost
);

cardRouter.delete(
  "/delete/:parentSlug/:subCategorySlug/:slug",
  authMiddleware,
  deleteCardPost
);

export { cardRouter };
