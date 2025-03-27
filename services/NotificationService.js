import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import axios from 'axios';
import { 
  initializeCounterTracking, 
  checkForNewDetections, 
  resetCounterTracking 
} from './CounterTrackingService';

const BACKGROUND_FETCH_TASK = 'background-notification-fetch';

// For tracking our interval
let notificationPollingInterval = null;

// Initialize the counter tracking
export const initializeNotificationService = async () => {
  try {
    await initializeCounterTracking();
    console.log('Notification service initialized');
    return true;
  } catch (error) {
    console.error('Error initializing notification service:', error);
    return false;
  }
};

// Define the task that will check for notifications
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    const result = await checkForNewDetections();
    
    if (!result || !result.hasNewDetections) {
      console.log('Background check completed, no new detections');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
    
    // Process each new detection
    for (const detection of result.detections) {
      await scheduleDetectionNotification(detection);
    }
    
    console.log('Background notifications scheduled for new detections');
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Error in background fetch:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Function to schedule a notification for a detection
const scheduleDetectionNotification = async (detection) => {
  const { cameraId, animalType, count, newCount } = detection;
  
  // Format the camera ID for display
  const displayCameraId = cameraId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  // Create title based on single or multiple detections
  const title = newCount === 1 
    ? `New ${animalType.charAt(0).toUpperCase() + animalType.slice(1)} Detected!` 
    : `${newCount} New ${animalType.charAt(0).toUpperCase() + animalType.slice(1)}s Detected!`;
  
  // Create body message
  const body = `Camera ${displayCameraId} has detected ${newCount} new ${animalType}${newCount > 1 ? 's' : ''}. Total count: ${count}`;
  
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: { 
        type: 'pet_detection',
        cameraId,
        animalType,
        count,
        newCount,
        location: displayCameraId
      },
    },
    trigger: null, // Show immediately
  });
  
  console.log(`Notification scheduled for ${newCount} new ${animalType}(s) on ${cameraId}`);
};

// Function to check for notifications with the API
const checkForNotificationsWithAPI = async () => {
  try {
    const result = await checkForNewDetections();
    
    if (!result || !result.hasNewDetections) {
      console.log('Polling check completed, no new detections');
      return false;
    }
    
    // Process each new detection
    for (const detection of result.detections) {
      await scheduleDetectionNotification(detection);
    }
    
    console.log('Notifications scheduled from polling for new detections');
    return true;
  } catch (error) {
    console.error('Error in notification polling:', error);
    return false;
  }
};

// Start a timer that checks for notifications every 30 seconds
export function startNotificationPolling() {
  // Clear any existing interval first
  if (notificationPollingInterval) {
    clearInterval(notificationPollingInterval);
  }
  
  // Set new interval - 30 seconds
  notificationPollingInterval = setInterval(async () => {
    console.log('Checking for detections (30-second interval)');
    await checkForNotificationsWithAPI();
  }, 30000); // 30 seconds
  
  console.log('Detection polling started (30-second interval)');
  
  // Do an initial check immediately
  checkForNotificationsWithAPI();
  
  return notificationPollingInterval;
}

// Stop the notification polling
export function stopNotificationPolling() {
  if (notificationPollingInterval) {
    clearInterval(notificationPollingInterval);
    notificationPollingInterval = null;
    console.log('Detection polling stopped');
  }
}

// Register the background fetch task (used as fallback for when app is in background)
export async function registerBackgroundNotificationTask() {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 30, // 30 seconds (minimum allowed is usually higher on iOS)
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('Background detection task registered');
    
    // Initialize the counter tracking
    await initializeNotificationService();
    
    // Also start the foreground polling for more reliable notifications
    startNotificationPolling();
  } catch (error) {
    console.error('Error registering background task:', error);
  }
}

// Unregister the background fetch task
export async function unregisterBackgroundNotificationTask() {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    stopNotificationPolling();
    console.log('Background detection task unregistered');
  } catch (error) {
    console.error('Error unregistering background task:', error);
  }
}

// Check if the background fetch task is registered
export async function checkBackgroundNotificationStatus() {
  const status = await BackgroundFetch.getStatusAsync();
  const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_FETCH_TASK);
  
  return {
    status,
    isRegistered,
    isPolling: notificationPollingInterval !== null
  };
}

// Manually check for new detections (for testing)
export async function checkForDetectionEvents() {
  try {
    const result = await checkForNewDetections();
    
    if (!result) {
      throw new Error('Failed to check for detections');
    }
    
    if (result.hasNewDetections) {
      // Process each new detection
      for (const detection of result.detections) {
        await scheduleDetectionNotification(detection);
      }
      
      return {
        success: true,
        notified: true,
        data: result,
      };
    }
    
    return {
      success: true,
      notified: false,
      data: result,
    };
  } catch (error) {
    console.error('Error checking for detection events:', error);
    
    // For testing purposes, send a fallback notification
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Detection Check Failed',
        body: 'Could not check for new pet detections. Please try again later.',
        data: { type: 'error' },
      },
      trigger: null,
    });
    
    return {
      success: false,
      notified: true,
      error: error.message,
    };
  }
}

// Reset all detection counters (useful for testing)
export async function resetDetectionCounters() {
  try {
    await resetCounterTracking();
    return {
      success: true,
      message: 'Detection counters reset successfully'
    };
  } catch (error) {
    console.error('Error resetting detection counters:', error);
    return {
      success: false,
      error: error.message
    };
  }
} 