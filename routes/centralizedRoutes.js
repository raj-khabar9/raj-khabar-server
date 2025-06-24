import express from "express";

const centralizedRouter = express.Router();
import { authMiddleware } from "../middleware/authmiddleware.js";
import { getCategoryOverview } from "../controllers/centralizedDataController.js";

// Centralized routes for fetching essential data
centralizedRouter.get("/category/:slug/overview", getCategoryOverview);

export { centralizedRouter };
