import {
  sendNotificationToAllDevices,
  sendNotificationToMultipleDevices,
  sendNotificationToDevice,
  sendPostNotification
} from "../utils/firebaseNotification.js";
import DeviceRegistration from "../models/device_registration.js";

// Send test notification to all devices
export const sendTestNotification = async (req, res) => {
  try {
    const { title, body, data } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: "Title and body are required"
      });
    }

    const notification = {
      title,
      body,
      data: data || {}
    };

    const result = await sendNotificationToAllDevices(notification);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Test notification sent successfully",
        result
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to send test notification",
        error: result.error
      });
    }
  } catch (error) {
    console.error("Error sending test notification:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Send notification to specific devices
export const sendNotificationToSpecificDevices = async (req, res) => {
  try {
    const { deviceIds, title, body, data } = req.body;

    if (!deviceIds || !Array.isArray(deviceIds) || deviceIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Device IDs array is required"
      });
    }

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: "Title and body are required"
      });
    }

    // Get FCM tokens for the specified devices
    const devices = await DeviceRegistration.find({
      deviceId: { $in: deviceIds },
      fcmToken: { $exists: true, $ne: null },
      notificationEnabled: true
    });

    if (devices.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No devices found with valid FCM tokens"
      });
    }

    const fcmTokens = devices.map(device => device.fcmToken);

    const notification = {
      title,
      body,
      data: data || {}
    };

    const result = await sendNotificationToMultipleDevices(fcmTokens, notification);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Notification sent successfully",
        result
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to send notification",
        error: result.error
      });
    }
  } catch (error) {
    console.error("Error sending notification to specific devices:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Send notification to devices by category preference
export const sendCategoryNotification = async (req, res) => {
  try {
    const { category, title, body, data } = req.body;

    if (!category || !title || !body) {
      return res.status(400).json({
        success: false,
        message: "Category, title, and body are required"
      });
    }

    // For now, sending to all devices
    // This can be extended to filter by user preferences
    const notification = {
      title,
      body,
      data: {
        ...data,
        category,
        type: 'category_notification'
      }
    };

    const result = await sendNotificationToAllDevices(notification);

    if (result.success) {
      return res.status(200).json({
        success: true,
        message: "Category notification sent successfully",
        result
      });
    } else {
      return res.status(500).json({
        success: false,
        message: "Failed to send category notification",
        error: result.error
      });
    }
  } catch (error) {
    console.error("Error sending category notification:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get notification statistics
export const getNotificationStats = async (req, res) => {
  try {
    const totalDevices = await DeviceRegistration.countDocuments({});
    const enabledDevices = await DeviceRegistration.countDocuments({ notificationEnabled: true });
    const devicesWithFCM = await DeviceRegistration.countDocuments({ 
      fcmToken: { $exists: true, $ne: null } 
    });
    const disabledDevices = totalDevices - enabledDevices;

    return res.status(200).json({
      success: true,
      stats: {
        totalDevices,
        enabledDevices,
        devicesWithFCM,
        disabledDevices,
        notificationCoverage: totalDevices > 0 ? Math.round((enabledDevices / totalDevices) * 100) : 0,
        fcmCoverage: totalDevices > 0 ? Math.round((devicesWithFCM / totalDevices) * 100) : 0
      }
    });
  } catch (error) {
    console.error("Error fetching notification stats:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Bulk update notification preferences
export const bulkUpdateNotificationPreferences = async (req, res) => {
  try {
    const { deviceIds, notificationEnabled } = req.body;

    if (!deviceIds || !Array.isArray(deviceIds) || deviceIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Device IDs array is required"
      });
    }

    if (notificationEnabled === undefined) {
      return res.status(400).json({
        success: false,
        message: "Notification preference is required"
      });
    }

    const result = await DeviceRegistration.updateMany(
      { deviceId: { $in: deviceIds } },
      { notificationEnabled }
    );

    return res.status(200).json({
      success: true,
      message: "Notification preferences updated successfully",
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
