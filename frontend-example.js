// Frontend Integration Example for Firebase Push Notifications
// This file shows how to integrate with the backend notification system

class NotificationManager {
  constructor() {
    this.deviceId = this.generateDeviceId();
    this.fcmToken = null;
    this.notificationEnabled = true;
    this.baseUrl = 'http://localhost:3000/api';
  }

  // Generate a unique device ID
  generateDeviceId() {
    return 'device_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Initialize Firebase and get FCM token
  async initializeFirebase() {
    try {
      // Check if Firebase is available
      if (typeof firebase === 'undefined') {
        console.log('Firebase not available, using mock token for testing');
        this.fcmToken = 'mock_fcm_token_' + Date.now();
        return;
      }

      // Initialize Firebase (you'll need to add your Firebase config)
      const firebaseConfig = {
        // Add your Firebase config here
        apiKey: "your-api-key",
        authDomain: "your-project.firebaseapp.com",
        projectId: "trest-fefcc",
        storageBucket: "your-project.appspot.com",
        messagingSenderId: "your-sender-id",
        appId: "your-app-id"
      };

      firebase.initializeApp(firebaseConfig);
      const messaging = firebase.messaging();

      // Request permission
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        // Get FCM token
        this.fcmToken = await messaging.getToken();
        console.log('FCM Token:', this.fcmToken);

        // Listen for token refresh
        messaging.onTokenRefresh(() => {
          messaging.getToken().then((refreshedToken) => {
            this.fcmToken = refreshedToken;
            this.updateFCMToken(refreshedToken);
          });
        });

        // Handle incoming messages when app is in foreground
        messaging.onMessage((payload) => {
          console.log('Message received:', payload);
          this.showNotification(payload.notification);
        });
      } else {
        console.log('Notification permission denied');
        this.notificationEnabled = false;
      }
    } catch (error) {
      console.error('Error initializing Firebase:', error);
      this.fcmToken = 'mock_fcm_token_' + Date.now();
    }
  }

  // Register device with backend
  async registerDevice() {
    try {
      const response = await fetch(`${this.baseUrl}/device/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId: this.deviceId,
          deviceName: navigator.userAgent,
          fcmToken: this.fcmToken,
          notificationEnabled: this.notificationEnabled
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('Device registered successfully:', result.device);
        return result.device;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error registering device:', error);
      throw error;
    }
  }

  // Update FCM token
  async updateFCMToken(newToken) {
    try {
      const response = await fetch(`${this.baseUrl}/device/update-token`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId: this.deviceId,
          fcmToken: newToken
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('FCM token updated successfully');
        this.fcmToken = newToken;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error updating FCM token:', error);
    }
  }

  // Update notification preferences
  async updateNotificationPreferences(enabled) {
    try {
      const response = await fetch(`${this.baseUrl}/device/notification-preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deviceId: this.deviceId,
          notificationEnabled: enabled
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('Notification preferences updated successfully');
        this.notificationEnabled = enabled;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error updating notification preferences:', error);
    }
  }

  // Show local notification
  showNotification(notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notif = new Notification(notification.title, {
        body: notification.body,
        icon: '/favicon.png',
        badge: '/favicon.png'
      });

      notif.onclick = () => {
        // Handle notification click
        console.log('Notification clicked:', notification);
        notif.close();
      };
    }
  }

  // Initialize the notification system
  async init() {
    try {
      console.log('Initializing notification system...');
      
      // Initialize Firebase first
      await this.initializeFirebase();
      
      // Register device with backend
      await this.registerDevice();
      
      console.log('Notification system initialized successfully');
      
      // Set up periodic token refresh (every 24 hours)
      setInterval(() => {
        if (this.fcmToken && this.fcmToken.startsWith('mock_')) {
          // Refresh mock token for testing
          this.fcmToken = 'mock_fcm_token_' + Date.now();
          this.updateFCMToken(this.fcmToken);
        }
      }, 24 * 60 * 60 * 1000);
      
    } catch (error) {
      console.error('Failed to initialize notification system:', error);
    }
  }

  // Test notification (for development)
  async testNotification() {
    try {
      const response = await fetch(`${this.baseUrl}/notification/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_JWT_TOKEN' // Replace with actual token
        },
        body: JSON.stringify({
          title: 'Test Notification',
          body: 'This is a test notification from the frontend'
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('Test notification sent successfully:', result);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
    }
  }
}

// Usage example
document.addEventListener('DOMContentLoaded', async () => {
  const notificationManager = new NotificationManager();
  
  // Initialize the notification system
  await notificationManager.init();
  
  // Add UI elements for testing
  const testButton = document.createElement('button');
  testButton.textContent = 'Send Test Notification';
  testButton.onclick = () => notificationManager.testNotification();
  
  const toggleButton = document.createElement('button');
  toggleButton.textContent = 'Toggle Notifications';
  toggleButton.onclick = () => {
    const newState = !notificationManager.notificationEnabled;
    notificationManager.updateNotificationPreferences(newState);
    toggleButton.textContent = `Notifications: ${newState ? 'ON' : 'OFF'}`;
  };
  
  // Add buttons to page
  document.body.appendChild(testButton);
  document.body.appendChild(toggleButton);
  
  console.log('Notification system ready!');
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotificationManager;
}
