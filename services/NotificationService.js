import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import axios from 'axios';
import { 
  initializeCounterTracking, 
  checkForNewDetections, 
  resetCounterTracking 
} from './CounterTrackingService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BACKGROUND_FETCH_TASK = 'background-notification-fetch';
const USER_STORAGE_KEY = 'stray_safe_user_data';

// API URL for the detected animals
const DETECTION_API_URL = 'https://straysafe.me/api2/detected';

// For tracking our interval
let notificationPollingInterval = null;
let currentUser = null;

// Initialize the counter tracking and load user data
export const initializeNotificationService = async () => {
  try {
    await initializeCounterTracking();
    await loadUserData();
    console.log('Notification service initialized');
    return true;
  } catch (error) {
    console.error('Error initializing notification service:', error);
    return false;
  }
};

// Load user data from AsyncStorage
const loadUserData = async () => {
  try {
    const userData = await AsyncStorage.getItem(USER_STORAGE_KEY);
    if (userData) {
      currentUser = JSON.parse(userData);
      if (currentUser && currentUser.userData && currentUser.userData.name) {
        console.log('User data loaded for notifications:', currentUser.userData.name);
        return true;
      } else {
        console.log('User data found but name is missing');
        currentUser = null;
        return false;
      }
    } else {
      console.log('No user data found in storage');
      currentUser = null;
      return false;
    }
  } catch (error) {
    console.error('Error loading user data:', error);
    currentUser = null;
    return false;
  }
};

// Update current user - call this when user logs in
export const updateCurrentUser = async (user) => {
  try {
    if (!user || !user.userData || !user.userData.name) {
      console.log('Invalid user data provided, notifications will be disabled');
      currentUser = null;
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      return false;
    }
    
    currentUser = user;
    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    console.log('User data updated for notifications:', user.userData.name);
    
    // Perform an immediate check for notifications when user data is updated
    await performImmediateCheck();
    
    return true;
  } catch (error) {
    console.error('Error updating user data:', error);
    currentUser = null;
    return false;
  }
};

// Function to perform an immediate check for notifications
export const performImmediateCheck = async () => {
  try {
    console.log('Performing immediate notification check');
    const result = await checkForDetectedAnimals();
    
    if (result && result.detectedAnimals.length > 0) {
      console.log(`Found ${result.detectedAnimals.length} relevant detections`);
      return {
        success: true,
        notified: true,
        data: result
      };
    }
    
    console.log('No relevant detections found in immediate check');
    return {
      success: true,
      notified: false,
      data: result
    };
  } catch (error) {
    console.error('Error in immediate notification check:', error);
    return {
      success: false,
      notified: false,
      error: error.message
    };
  }
};

// Define the task that will check for notifications
TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    const result = await checkForDetectedAnimals();
    
    if (!result || result.detectedAnimals.length === 0) {
      console.log('Background check completed, no new detections');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
    
    console.log('Background notifications scheduled for new detections');
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Error in background fetch:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

// Function to check for detected animals from the API
const checkForDetectedAnimals = async () => {
  try {
    // Ensure we have the latest user data
    const userDataLoaded = await loadUserData();
    
    if (!userDataLoaded || !currentUser || !currentUser.userData || !currentUser.userData.name) {
      console.log('No valid user data available, skipping detection check');
      return { detectedAnimals: [] };
    }
    
    const username = currentUser.userData.name;
    if (!username) {
      console.log('Username is empty, skipping detection check');
      return { detectedAnimals: [] };
    }
    
    const isPoundUser = username.toLowerCase().includes('pound');
    
    console.log(`Checking for detections as user: ${username}, is pound user: ${isPoundUser}`);
    
    const response = await axios.get(DETECTION_API_URL);
    const data = response.data;
    
    if (!data || !data.detected_animals || !Array.isArray(data.detected_animals)) {
      console.log('Invalid or empty detection data received');
      return { detectedAnimals: [] };
    }
    
    // Filter the detected animals based on notification type and user
    const relevantDetections = data.detected_animals.filter(animal => {
      if (animal.notification_type === 'owner_notification' && animal.owner_id === username) {
        return true; // This is the owner, so notify
      }
      
      if (animal.notification_type === 'pound_notification' && isPoundUser) {
        return true; // This is a pound user, so notify about pound notifications
      }
      
      return false; // Not relevant to this user
    });
    
    // Process notifications for relevant detections
    for (const animal of relevantDetections) {
      await scheduleDetectionNotification(animal);
    }
    
    return { 
      detectedAnimals: relevantDetections,
      totalCount: data.count,
      filteredCount: relevantDetections.length
    };
  } catch (error) {
    console.error('Error checking for detected animals:', error);
    return { detectedAnimals: [] };
  }
};

// Function to schedule a notification for a detected animal
const scheduleDetectionNotification = async (animal) => {
  try {
    const { animal_type, stream_id, classification, notification_type, owner_id } = animal;
    
    // Format the camera ID for display
    const displayCameraId = stream_id.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    // Create title based on notification type and animal classification
    let title;
    let body;
    
    if (notification_type === 'owner_notification') {
      if (classification === 'stray') {
        title = `Your ${animal_type.charAt(0).toUpperCase() + animal_type.slice(1)} Detected as Stray!`;
        body = `Camera ${displayCameraId} has detected your ${animal_type} as stray.`;
      } else {
        title = `Your ${animal_type.charAt(0).toUpperCase() + animal_type.slice(1)} Detected!`;
        body = `Camera ${displayCameraId} has detected your ${animal_type}.`;
      }
    } else if (notification_type === 'pound_notification') {
      title = `Stray ${animal_type.charAt(0).toUpperCase() + animal_type.slice(1)} Detected for Pound`;
      body = `Camera ${displayCameraId} has detected a stray ${animal_type} that needs attention.`;
    }
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { 
          type: 'pet_detection',
          animal: animal,
          location: displayCameraId
        },
      },
      trigger: null, // Show immediately
    });
    
    console.log(`Notification scheduled for ${animal_type} on ${stream_id} (${notification_type})`);
    return true;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return false;
  }
};

// Function to check for notifications with the API
const checkForNotificationsWithAPI = async () => {
  try {
    const result = await checkForDetectedAnimals();
    return result.detectedAnimals.length > 0;
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
    const result = await checkForDetectedAnimals();
    
    if (!result) {
      throw new Error('Failed to check for detections');
    }
    
    if (result.detectedAnimals.length > 0) {
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