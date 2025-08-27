import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import DeviceRegistration from '../models/device_registration.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK
let serviceAccount;

// Try to use environment variables first (production)
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (error) {
    console.error('Error parsing FIREBASE_SERVICE_ACCOUNT environment variable:', error);
  }
} else {
  // Fallback to service account file (development)
  const serviceAccountPath = path.join(__dirname, '../serviceAccountJson/serviceAccountKey.json');
  try {
    if (fs.existsSync(serviceAccountPath)) {
      serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    } else {
      console.error('Service account file not found and FIREBASE_SERVICE_ACCOUNT env var not set');
    }
  } catch (error) {
    console.error('Error reading service account file:', error);
  }
}

try {
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'raj-khabar'
    });
    console.log('Firebase Admin SDK initialized successfully');
  } else {
    console.error('Firebase service account not configured');
  }
} catch (error) {
  if (error.code === 'app/duplicate-app') {
    console.log('Firebase Admin SDK already initialized');
  } else {
    console.error('Error initializing Firebase Admin SDK:', error);
  }
}

// Function to send notification to a single device
export const sendNotificationToDevice = async (fcmToken, notification) => {
  try {
    // Ensure all data values are strings (FCM requirement)
    const sanitizedData = {};
    if (notification.data) {
      Object.keys(notification.data).forEach(key => {
        if (notification.data[key] !== null && notification.data[key] !== undefined) {
          sanitizedData[key] = notification.data[key].toString();
        }
      });
    }
    
    const message = {
      token: fcmToken,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: sanitizedData,
      android: {
        notification: {
          sound: 'default',
          priority: 'high',
          channelId: 'raj_khabar_channel'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      }
    };

    const response = await admin.messaging().send(message);
    console.log('Successfully sent message:', response);
    return { success: true, messageId: response };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, error: error.message };
  }
};

// Function to send notification to multiple devices
export const sendNotificationToMultipleDevices = async (fcmTokens, notification) => {
  try {
    if (!fcmTokens || fcmTokens.length === 0) {
      console.log('No FCM tokens provided');
      return { success: false, error: 'No FCM tokens provided' };
    }

    // Ensure all data values are strings (FCM requirement)
    const sanitizedData = {};
    if (notification.data) {
      Object.keys(notification.data).forEach(key => {
        if (notification.data[key] !== null && notification.data[key] !== undefined) {
          sanitizedData[key] = notification.data[key].toString();
        }
      });
    }

    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: sanitizedData,
      android: {
        notification: {
          sound: 'default',
          priority: 'high',
          channelId: 'raj_khabar_channel'
        }
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
            badge: 1
          }
        }
      },
      tokens: fcmTokens
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    console.log('Successfully sent messages:', response);
    
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push({
            token: fcmTokens[idx],
            error: resp.error
          });
        }
      });
      console.log('Failed tokens:', failedTokens);
    }

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses
    };
  } catch (error) {
    console.error('Error sending multicast notification:', error);
    return { success: false, error: error.message };
  }
};

// Function to send notification to all registered devices
export const sendNotificationToAllDevices = async (notification) => {
  try {
    console.log('🔍 Looking for registered devices...');
    
    // Get all devices with FCM tokens and notifications enabled
    const devices = await DeviceRegistration.find({
      fcmToken: { $exists: true, $ne: null },
      notificationEnabled: true
    });
    
    if (devices.length === 0) {
      
      // Debug: Check all devices in the database
      const allDevices = await DeviceRegistration.find({});
      
      allDevices.forEach((device, idx) => {
        console.log(`Device ${idx + 1}:`, {
          deviceId: device.deviceId,
          hasFcmToken: !!device.fcmToken,
          fcmTokenLength: device.fcmToken ? device.fcmToken.length : 0,
          notificationEnabled: device.notificationEnabled
        });
      });
      
      return { success: false, error: 'No devices found with FCM tokens' };
    }

    const fcmTokens = devices.map(device => device.fcmToken).filter(token => token);
    
    if (fcmTokens.length === 0) {
      return { success: false, error: 'No valid FCM tokens found' };
    }
    return await sendNotificationToMultipleDevices(fcmTokens, notification);
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Function to send notification to devices by category preference
export const sendNotificationToCategoryDevices = async (category, notification) => {
  try {
    // This can be extended to filter devices by user preferences
    // For now, sending to all devices
    return await sendNotificationToAllDevices(notification);
  } catch (error) {
    console.error('Error sending category notification:', error);
    return { success: false, error: error.message };
  }
};

// Function to send post notification
export const sendPostNotification = async (post) => {
  try {
    
    // Ensure all data values are strings (FCM requirement)
    const data = {
      postId: post._id ? post._id.toString() : '',
      postSlug: post.slug || '',
      category: post.categorySlug || '',
      subcategory: (post.subcategorySlug || post.subCategorySlug || '').toString(),
      type: 'new_post'
    };
    
    // Remove empty string values to clean up payload
    Object.keys(data).forEach(key => {
      if (data[key] === '' && key !== 'type') {
        delete data[key];
      }
    });
    
    const notification = {
      title: 'New Post: ' + post.title,
      body: post.description || 'A new post has been published!',
      data
    };

    const result = await sendNotificationToAllDevices(notification);
    return result;
  } catch (error) {
    return { success: false, error: error.message };
  }
};
