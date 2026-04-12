import express from "express";
import {
  createAdType,
  getAllAdTypes,
  getAdTypeBySlug,
  updateAdType,
  deleteAdType,
  validateAdType
} from "../controllers/adTypeController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const adTypeRouter = express.Router();

// Ad Type routes
// Public read endpoints
adTypeRouter.get("/all", getAllAdTypes);
adTypeRouter.get("/:slug", getAdTypeBySlug);

// Protected write endpoints
adTypeRouter.post("/create", authMiddleware, validateAdType, createAdType);
adTypeRouter.put("/update/:slug", authMiddleware, validateAdType, updateAdType);
adTypeRouter.delete("/delete/:slug", authMiddleware, deleteAdType);

export { adTypeRouter };
