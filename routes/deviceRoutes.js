import express from "express";
import {
  registerDevice,
  updateFCMToken,
  updateNotificationPreferences,
  getAllDevices,
  getDeviceById,
  deleteDevice,
  getDevicesCount
} from "../controllers/deviceRegistrationController.js";
import { authMiddleware } from "../middleware/authmiddleware.js";

const deviceRouter = express.Router();

// Public routes (no authentication required for device registration)
deviceRouter.post("/register", registerDevice);
deviceRouter.put("/update-token", updateFCMToken);
deviceRouter.put("/notification-preferences", updateNotificationPreferences);

// Protected routes (require authentication)
deviceRouter.get("/all", authMiddleware, getAllDevices);
deviceRouter.get("/:deviceId", authMiddleware, getDeviceById);
deviceRouter.delete("/:deviceId", authMiddleware, deleteDevice);
deviceRouter.get("/stats/count", authMiddleware, getDevicesCount);

export { deviceRouter };
