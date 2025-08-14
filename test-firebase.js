import { sendNotificationToAllDevices } from './utils/firebaseNotification.js';

// Test Firebase notification setup
async function testFirebase() {
  console.log('Testing Firebase notification setup...');
  
  try {
    const notification = {
      title: 'Test Notification',
      body: 'This is a test notification from Raj Khabar App',
      data: {
        type: 'test',
        timestamp: new Date().toISOString()
      }
    };

    console.log('Sending test notification...');
    const result = await sendNotificationToAllDevices(notification);
    
    if (result.success) {
      console.log('✅ Test notification sent successfully!');
      console.log('Result:', result);
    } else {
      console.log('❌ Test notification failed:', result.error);
    }
  } catch (error) {
    console.error('❌ Error testing Firebase:', error);
  }
}

// Run the test
testFirebase();
