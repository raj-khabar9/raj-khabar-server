import express from "express";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  getCategoriesBySlug,
  updateSubcategory,
  deleteSubcategory,
  getAllCategories,
  getAllSubcategoriesOfCategory,
  getCategoriesWithSubcategories
} from "../controllers/categoriesController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";
import multer from "multer";
const upload = multer();

const categoryRouter = express.Router();

// Category routes
categoryRouter.post(
  "/create-category",
  authMiddleware,
  upload.single("icon"),
  createCategory
);
categoryRouter.put(
  "/update-category/:slug",
  authMiddleware,
  upload.single("icon"),
  updateCategory
); // Assuming you want to use the same controller for updating
categoryRouter.delete("/delete-category/:slug", authMiddleware, deleteCategory); // Assuming you want to use the same controller for deleting

//routes to get all categories
categoryRouter.get("/all", getAllCategories); // Assuming you want to use the same controller for getting all categories
categoryRouter.get("/get-category/:slug", getCategoriesBySlug);
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
categoryRouter.get("/getcategories", getCategoriesWithSubcategories); // Assuming you want to use the same controller for getting all categories with subcategories

export { categoryRouter };
