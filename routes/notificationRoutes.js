import express from "express";
import {
  sendTestNotification,
  sendNotificationToSpecificDevices,
  sendCategoryNotification,
  getNotificationStats,
  bulkUpdateNotificationPreferences,
  debugPostNotification
} from "../controllers/notificationController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const notificationRouter = express.Router();

// Debug routes (no auth required for testing)
notificationRouter.post("/test", sendTestNotification);
notificationRouter.get("/debug-devices", getNotificationStats);
notificationRouter.post("/debug-post", debugPostNotification);

// Protected routes (require authentication)
notificationRouter.post("/specific-devices", authMiddleware, sendNotificationToSpecificDevices);
notificationRouter.post("/category", authMiddleware, sendCategoryNotification);
notificationRouter.get("/stats", authMiddleware, getNotificationStats);
notificationRouter.put("/bulk-preferences", authMiddleware, bulkUpdateNotificationPreferences);

export { notificationRouter };
