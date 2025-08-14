import DeviceRegistration from "../models/device_registration.js";

// Register a new device or update existing device
export const registerDevice = async (req, res) => {
  try {
    const { deviceName, deviceId, fcmToken, notificationEnabled = true } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: "Device ID is required"
      });
    }

    // Check if device already exists
    let device = await DeviceRegistration.findOne({ deviceId });

    if (device) {
      // Update existing device
      device.fcmToken = fcmToken || device.fcmToken;
      device.deviceName = deviceName || device.deviceName;
      device.notificationEnabled = notificationEnabled;
      await device.save();

      return res.status(200).json({
        success: true,
        message: "Device updated successfully",
        device
      });
    } else {
      // Create new device
      const newDevice = new DeviceRegistration({
        deviceName,
        deviceId,
        fcmToken,
        notificationEnabled
      });

      await newDevice.save();

      return res.status(201).json({
        success: true,
        message: "Device registered successfully",
        device: newDevice
      });
    }
  } catch (error) {
    console.error("Error in device registration:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Update FCM token for a device
export const updateFCMToken = async (req, res) => {
  try {
    const { deviceId, fcmToken } = req.body;

    if (!deviceId || !fcmToken) {
      return res.status(400).json({
        success: false,
        message: "Device ID and FCM token are required"
      });
    }

    const device = await DeviceRegistration.findOne({ deviceId });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found"
      });
    }

    device.fcmToken = fcmToken;
    await device.save();

    return res.status(200).json({
      success: true,
      message: "FCM token updated successfully",
      device
    });
  } catch (error) {
    console.error("Error updating FCM token:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (req, res) => {
  try {
    const { deviceId, notificationEnabled } = req.body;

    if (deviceId === undefined || notificationEnabled === undefined) {
      return res.status(400).json({
        success: false,
        message: "Device ID and notification preference are required"
      });
    }

    const device = await DeviceRegistration.findOne({ deviceId });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found"
      });
    }

    device.notificationEnabled = notificationEnabled;
    await device.save();

    return res.status(200).json({
      success: true,
      message: "Notification preferences updated successfully",
      device
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

// Get all registered devices
export const getAllDevices = async (req, res) => {
  try {
    const devices = await DeviceRegistration.find({});
    
    return res.status(200).json({
      success: true,
      count: devices.length,
      devices
    });
  } catch (error) {
    console.error("Error fetching devices:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get device by ID
export const getDeviceById = async (req, res) => {
  try {
    const { deviceId } = req.params;

    const device = await DeviceRegistration.findOne({ deviceId });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found"
      });
    }

    return res.status(200).json({
      success: true,
      device
    });
  } catch (error) {
    console.error("Error fetching device:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Delete device
export const deleteDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;

    const device = await DeviceRegistration.findOneAndDelete({ deviceId });

    if (!device) {
      return res.status(404).json({
        success: false,
        message: "Device not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Device deleted successfully",
      device
    });
  } catch (error) {
    console.error("Error deleting device:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get devices count for statistics
export const getDevicesCount = async (req, res) => {
  try {
    const totalDevices = await DeviceRegistration.countDocuments({});
    const enabledDevices = await DeviceRegistration.countDocuments({ notificationEnabled: true });
    const devicesWithFCM = await DeviceRegistration.countDocuments({ 
      fcmToken: { $exists: true, $ne: null } 
    });

    return res.status(200).json({
      success: true,
      stats: {
        totalDevices,
        enabledDevices,
        devicesWithFCM,
        disabledDevices: totalDevices - enabledDevices
      }
    });
  } catch (error) {
    console.error("Error fetching devices count:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
