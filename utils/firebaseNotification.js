import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import DeviceRegistration from '../models/device_registration.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK
const serviceAccountPath = path.join(__dirname, '../serviceAccountJson/serviceAccountKey.json');
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: 'raj-khabar'
  });
  console.log('Firebase Admin SDK initialized successfully');
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
    const message = {
      token: fcmToken,
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
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

    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: notification.data || {},
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
    // Get all devices with FCM tokens and notifications enabled
    const devices = await DeviceRegistration.find({
      fcmToken: { $exists: true, $ne: null },
      notificationEnabled: true
    });

    if (devices.length === 0) {
      console.log('No devices found with FCM tokens');
      return { success: false, error: 'No devices found with FCM tokens' };
    }

    const fcmTokens = devices.map(device => device.fcmToken).filter(token => token);
    
    if (fcmTokens.length === 0) {
      console.log('No valid FCM tokens found');
      return { success: false, error: 'No valid FCM tokens found' };
    }

    console.log(`Sending notification to ${fcmTokens.length} devices`);
    return await sendNotificationToMultipleDevices(fcmTokens, notification);
  } catch (error) {
    console.error('Error sending notification to all devices:', error);
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
    const notification = {
      title: 'New Post: ' + post.title,
      body: post.description || 'A new post has been published!',
      data: {
        postId: post._id.toString(),
        postSlug: post.slug,
        category: post.categorySlug,
        subcategory: post.subcategorySlug,
        type: 'new_post'
      }
    };

    console.log('Sending post notification:', notification);
    return await sendNotificationToAllDevices(notification);
  } catch (error) {
    console.error('Error sending post notification:', error);
    return { success: false, error: error.message };
  }
};
