import express from "express";
import { createHeaderComponent } from "../controllers/headerComponentController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const headerComponentRouter = express.Router();

headerComponentRouter.post(
  "/header/create-component",
  authMiddleware,
  createHeaderComponent
);

export { headerComponentRouter };
