# Firebase Push Notification Setup Guide

## Overview
This guide explains how to set up and use Firebase push notifications in your Raj Khabar App backend. The system automatically sends notifications to all registered devices when new posts are published.

## Prerequisites
- Firebase project with service account key (already configured)
- Node.js backend with Firebase Admin SDK (already installed)

## Files Created/Modified

### 1. Firebase Notification Utility (`utils/firebaseNotification.js`)
- Handles Firebase Admin SDK initialization
- Provides functions for sending notifications to single/multiple devices
- Automatically sends notifications when posts are published

### 2. Device Registration Controller (`controllers/deviceRegistrationController.js`)
- Manages device registration and FCM token storage
- Handles notification preferences
- Provides device management endpoints

### 3. Notification Controller (`controllers/notificationController.js`)
- Sends test notifications
- Manages notification settings
- Provides notification statistics

### 4. Routes
- `routes/deviceRoutes.js` - Device management endpoints
- `routes/notificationRoutes.js` - Notification management endpoints

### 5. Updated Files
- `controllers/postsController.js` - Integrated push notifications
- `index.js` - Added new routes

## API Endpoints

### Device Registration (Public - No Auth Required)
```
POST /api/device/register
PUT /api/device/update-token
PUT /api/device/notification-preferences
```

### Device Management (Protected - Auth Required)
```
GET /api/device/all
GET /api/device/:deviceId
DELETE /api/device/:deviceId
GET /api/device/stats/count
```

### Notification Management (Protected - Auth Required)
```
POST /api/notification/test
POST /api/notification/specific-devices
POST /api/notification/category
GET /api/notification/stats
PUT /api/notification/bulk-preferences
```

## How It Works

### 1. Automatic Post Notifications
When a new post is created with status "published", the system automatically:
- Sends push notifications to all registered devices
- Includes post details (title, description, category, etc.)
- Logs notification results

### 2. Device Registration Flow
1. Frontend app registers device with unique device ID
2. FCM token is stored when available
3. Notification preferences can be managed
4. Device receives notifications based on preferences

### 3. Notification Content
Notifications include:
- Title: "New Post: [Post Title]"
- Body: Post description or default message
- Data: Post ID, slug, category, subcategory, type

## Frontend Integration

### 1. Device Registration
```javascript
// Register device when app starts
const response = await fetch('/api/device/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    deviceId: 'unique-device-id',
    deviceName: 'Device Name',
    fcmToken: 'fcm-token-from-firebase',
    notificationEnabled: true
  })
});
```

### 2. Update FCM Token
```javascript
// Update token when it refreshes
await fetch('/api/device/update-token', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    deviceId: 'unique-device-id',
    fcmToken: 'new-fcm-token'
  })
});
```

### 3. Update Notification Preferences
```javascript
// Toggle notifications on/off
await fetch('/api/device/notification-preferences', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    deviceId: 'unique-device-id',
    notificationEnabled: false
  })
});
```

## Testing

### 1. Test Firebase Setup
```bash
node test-firebase.js
```

### 2. Test Device Registration
```bash
curl -X POST http://localhost:3000/api/device/register \
  -H "Content-Type: application/json" \
  -d '{
    "deviceId": "test-device-123",
    "deviceName": "Test Device",
    "fcmToken": "test-fcm-token",
    "notificationEnabled": true
  }'
```

### 3. Test Notification
```bash
curl -X POST http://localhost:3000/api/notification/test \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Test Notification",
    "body": "This is a test notification"
  }'
```

## Configuration

### 1. Firebase Service Account
The service account key is already configured in `serviceAccountJson/serviceAccountKey.json`

### 2. Environment Variables
No additional environment variables are required for basic functionality

### 3. Notification Channels (Android)
The system uses the default notification channel "raj_khabar_channel"

## Monitoring and Debugging

### 1. Logs
- Firebase initialization logs
- Notification sending results
- Error logs for failed notifications

### 2. Statistics
- Total registered devices
- Devices with FCM tokens
- Notification preferences status

### 3. Error Handling
- Failed FCM tokens are logged
- Notification failures don't affect post creation
- Graceful degradation when Firebase is unavailable

## Security Considerations

### 1. Public Endpoints
- Device registration is public for mobile app access
- FCM token updates are public
- Notification preferences can be updated without auth

### 2. Protected Endpoints
- Device management requires authentication
- Notification sending requires authentication
- Statistics and bulk operations require authentication

### 3. Data Validation
- Input validation for all endpoints
- FCM token format validation
- Device ID uniqueness enforcement

## Troubleshooting

### 1. Firebase Initialization Issues
- Check service account key path
- Verify project ID matches
- Check Firebase Admin SDK installation

### 2. Notification Delivery Issues
- Verify FCM tokens are valid
- Check device notification preferences
- Review Firebase console for delivery status

### 3. Performance Issues
- Monitor notification queue
- Implement rate limiting if needed
- Consider batch processing for large device lists

## Future Enhancements

### 1. User Preferences
- Category-based notification preferences
- Time-based notification scheduling
- Personalized notification content

### 2. Advanced Targeting
- Geographic targeting
- User behavior-based targeting
- A/B testing for notification content

### 3. Analytics
- Notification open rates
- User engagement metrics
- Delivery success rates

## Support
For issues or questions about the Firebase notification system, check:
1. Firebase console for project status
2. Backend logs for error details
3. Network tab for API response issues
4. Device registration status in database
