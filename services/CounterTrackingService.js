import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const COUNTER_STORAGE_KEY = 'stray_safe_detection_counters';
const API_ENDPOINT = 'https://straysafe.me/api2/counters';

// Stores the last processed counts to avoid duplicate notifications
let lastProcessedCounters = {};

// Initialize the tracking service
export const initializeCounterTracking = async () => {
  try {
    // Load previously saved counters from AsyncStorage
    const savedCounters = await AsyncStorage.getItem(COUNTER_STORAGE_KEY);
    if (savedCounters) {
      lastProcessedCounters = JSON.parse(savedCounters);
      console.log('Loaded saved counters:', lastProcessedCounters);
    } else {
      // First run, fetch current counts as baseline
      const initialCounters = await fetchCounters();
      if (initialCounters) {
        lastProcessedCounters = initialCounters;
        await saveCounters();
        console.log('Initialized with current counters:', lastProcessedCounters);
      }
    }
    return lastProcessedCounters;
  } catch (error) {
    console.error('Error initializing counter tracking:', error);
    return null;
  }
};

// Save the current state of processed counters to persist across app restarts
const saveCounters = async () => {
  try {
    await AsyncStorage.setItem(COUNTER_STORAGE_KEY, JSON.stringify(lastProcessedCounters));
  } catch (error) {
    console.error('Error saving counters:', error);
  }
};

// Fetch the latest counters from the API
export const fetchCounters = async () => {
  try {
    const response = await axios.get(API_ENDPOINT);
    return response.data;
  } catch (error) {
    console.error('Error fetching counters:', error);
    return null;
  }
};

// Check for new detections and return notification data if there are new detections
export const checkForNewDetections = async () => {
  try {
    // Fetch current counts
    const currentCounters = await fetchCounters();
    if (!currentCounters) return null;

    const newDetections = [];

    // Compare with the last processed counts
    Object.keys(currentCounters).forEach(cameraId => {
      const camera = currentCounters[cameraId];
      
      // If this is a new camera we haven't seen before
      if (!lastProcessedCounters[cameraId]) {
        if (camera.dog > 0) {
          newDetections.push({
            cameraId,
            animalType: 'dog',
            count: camera.dog,
            newCount: camera.dog
          });
        }
        
        if (camera.cat > 0) {
          newDetections.push({
            cameraId,
            animalType: 'cat',
            count: camera.cat,
            newCount: camera.cat
          });
        }
      } 
      // For existing cameras, check for increased counts
      else {
        const lastCamera = lastProcessedCounters[cameraId];
        
        if (camera.dog > lastCamera.dog) {
          newDetections.push({
            cameraId,
            animalType: 'dog',
            count: camera.dog,
            newCount: camera.dog - lastCamera.dog
          });
        }
        
        if (camera.cat > lastCamera.cat) {
          newDetections.push({
            cameraId,
            animalType: 'cat',
            count: camera.cat,
            newCount: camera.cat - lastCamera.cat
          });
        }
      }
    });

    // Update the last processed counters
    lastProcessedCounters = currentCounters;
    await saveCounters();
    
    return {
      hasNewDetections: newDetections.length > 0,
      detections: newDetections,
      allCounters: currentCounters
    };
  } catch (error) {
    console.error('Error checking for new detections:', error);
    return null;
  }
};

// Reset all counters (for testing)
export const resetCounterTracking = async () => {
  try {
    lastProcessedCounters = {};
    await AsyncStorage.removeItem(COUNTER_STORAGE_KEY);
    console.log('Counter tracking reset');
    return true;
  } catch (error) {
    console.error('Error resetting counter tracking:', error);
    return false;
  }
}; 