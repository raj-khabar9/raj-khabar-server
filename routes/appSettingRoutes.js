import express from "express";
import { getAppSettings, updateAdsSetting } from "../controllers/appSettingController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const appSettingRouter = express.Router();

// Public endpoint to get current settings
appSettingRouter.get("/", getAppSettings);

// Protected endpoint to update ads setting
appSettingRouter.put("/update", authMiddleware, updateAdsSetting);

export { appSettingRouter };
