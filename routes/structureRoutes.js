import express from "express";
import { createTableStructure } from "../controllers/tableController.js";

import { authMiddleware } from "../middleware/authmiddleware.js";

const structureRouter = express.Router();

// Table structure routes
structureRouter.post("/create-table", authMiddleware, createTableStructure); // Assuming you want to use the same controller for creating table structure


export { structureRouter };