import express from "express";
import {
  sendTestNotification,
  sendNotificationToSpecificDevices,
  sendCategoryNotification,
  getNotificationStats,
  bulkUpdateNotificationPreferences
} from "../controllers/notificationController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const notificationRouter = express.Router();

// Protected routes (require authentication)
notificationRouter.post("/test", authMiddleware, sendTestNotification);
notificationRouter.post("/specific-devices", authMiddleware, sendNotificationToSpecificDevices);
notificationRouter.post("/category", authMiddleware, sendCategoryNotification);
notificationRouter.get("/stats", authMiddleware, getNotificationStats);
notificationRouter.put("/bulk-preferences", authMiddleware, bulkUpdateNotificationPreferences);

export { notificationRouter };
