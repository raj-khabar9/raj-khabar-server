import express from "express";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
  getAllCategories,
  getAllSubcategoriesOfCategory
} from "../controllers/categoriesController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const categoryRouter = express.Router();

// Category routes
categoryRouter.post("/create-category", authMiddleware, createCategory);
categoryRouter.put("/update-category/:slug", authMiddleware, updateCategory); // Assuming you want to use the same controller for updating
categoryRouter.delete("/delete-category/:slug", authMiddleware, deleteCategory); // Assuming you want to use the same controller for deleting

//routes to get all categories
categoryRouter.get("/all", getAllCategories); // Assuming you want to use the same controller for getting all categories

// Sub-category routes
categoryRouter.post("/create-sub-category", authMiddleware, createSubcategory); // Assuming you want to use the same controller for creating sub-categories
categoryRouter.put(
  "/update-sub-category/:slug",
  authMiddleware,
  updateSubcategory
);
categoryRouter.delete(
  "/delete-sub-category/:slug",
  authMiddleware,
  deleteSubcategory
);

categoryRouter.get("/all-subcategories/:slug", getAllSubcategoriesOfCategory);

export { categoryRouter };
