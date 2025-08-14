import express from "express";
import {
  bulkDeletePosts,
  bulkDeleteCards,
  bulkDeleteTablePosts,
  bulkDeleteTableStructures,
  bulkDeleteCategories,
  bulkDeleteSubcategories,
  bulkDeleteSocialMedia,
  bulkDeleteHeaderComponents,
  universalBulkDelete,
  getContentStatistics
} from "../controllers/bulkDeleteController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const bulkDeleteRouter = express.Router();

// Individual bulk delete routes
bulkDeleteRouter.delete("/posts", authMiddleware, bulkDeletePosts);
bulkDeleteRouter.delete("/cards", authMiddleware, bulkDeleteCards);
bulkDeleteRouter.delete("/table-posts", authMiddleware, bulkDeleteTablePosts);
bulkDeleteRouter.delete("/table-structures", authMiddleware, bulkDeleteTableStructures);
bulkDeleteRouter.delete("/categories", authMiddleware, bulkDeleteCategories);
bulkDeleteRouter.delete("/subcategories", authMiddleware, bulkDeleteSubcategories);
bulkDeleteRouter.delete("/social-media", authMiddleware, bulkDeleteSocialMedia);
bulkDeleteRouter.delete("/header-components", authMiddleware, bulkDeleteHeaderComponents);

// Universal bulk delete route
bulkDeleteRouter.delete("/universal", authMiddleware, universalBulkDelete);

// Content statistics (useful for bulk operations)
bulkDeleteRouter.get("/statistics", authMiddleware, getContentStatistics);

export { bulkDeleteRouter };
