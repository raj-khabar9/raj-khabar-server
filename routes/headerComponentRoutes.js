import express from "express";
import {
  createHeaderComponent,
  getAllHeaderComponents,
  getHeaderComponentById,
  updateHeaderComponent,
  deleteHeaderComponent
} from "../controllers/headerComponentController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const headerComponentRouter = express.Router();

// Create header component
headerComponentRouter.post(
  "/header/create-component",
  authMiddleware,
  createHeaderComponent
);

// Get all header components with pagination and filtering
headerComponentRouter.get(
  "/header/components",
  authMiddleware,
  getAllHeaderComponents
);

// Get single header component by ID
headerComponentRouter.get(
  "/header/components/:id",
  authMiddleware,
  getHeaderComponentById
);

// Update header component
headerComponentRouter.put(
  "/header/components/:id",
  authMiddleware,
  updateHeaderComponent
);

// Delete header component
headerComponentRouter.delete(
  "/header/components/:id",
  authMiddleware,
  deleteHeaderComponent
);

export { headerComponentRouter };
