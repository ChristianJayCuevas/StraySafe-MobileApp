import React, { useState, useEffect } from 'react';
import { TouchableOpacity, Text, StyleSheet, View, Alert, Switch } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import axios from 'axios';
import {
  registerBackgroundNotificationTask,
  unregisterBackgroundNotificationTask,
  checkBackgroundNotificationStatus,
  checkForDetectionEvents,
  startNotificationPolling,
  stopNotificationPolling,
  resetDetectionCounters
} from '../services/NotificationService';
import { fetchCounters } from '../services/CounterTrackingService';

const TestNotificationButton = () => {
  const [loading, setLoading] = useState(false);
  const [isPollingEnabled, setIsPollingEnabled] = useState(false);
  const [currentCounters, setCurrentCounters] = useState(null);
  
  // Check the initial polling status and counters
  useEffect(() => {
    const initialize = async () => {
      try {
        // Check polling status
        const status = await checkBackgroundNotificationStatus();
        setIsPollingEnabled(status.isPolling);
        
        // Get current counters
        fetchAndUpdateCounters();
      } catch (error) {
        console.error('Error during initialization:', error);
      }
    };
    
    initialize();
    
    // Set up periodic counter updates
    const counterUpdateInterval = setInterval(fetchAndUpdateCounters, 15000);
    
    return () => {
      clearInterval(counterUpdateInterval);
    };
  }, []);
  
  const fetchAndUpdateCounters = async () => {
    try {
      const counters = await fetchCounters();
      if (counters) {
        setCurrentCounters(counters);
      }
    } catch (error) {
      console.error('Error fetching counters:', error);
    }
  };

  const registerForPushNotificationsAsync = async () => {
    setLoading(true);
    try {
      // Request permission
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert('Permission not granted for notifications');
        return;
      }
      
      // Get the token
      const token = (await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      })).data;
      
      console.log('Expo Push Token:', token);
      
      // Register the background task and start polling
      await registerBackgroundNotificationTask();
      setIsPollingEnabled(true);
      
      // Fetch current counters after registration
      await fetchAndUpdateCounters();
      
      Alert.alert('Success', 'Push notifications are now set up! Polling for pet detections every 30 seconds.');
      
      return token;
    } catch (error) {
      console.error('Error getting push token:', error);
      Alert.alert('Error', 'Failed to register for push notifications');
    } finally {
      setLoading(false);
    }
  };
  
  const togglePolling = async (value) => {
    setLoading(true);
    try {
      if (value) {
        // Start polling
        startNotificationPolling();
        Alert.alert('Polling Started', 'Now checking for pet detections every 30 seconds');
      } else {
        // Stop polling
        stopNotificationPolling();
        Alert.alert('Polling Stopped', 'Pet detection polling has been disabled');
      }
      setIsPollingEnabled(value);
    } catch (error) {
      console.error('Error toggling polling:', error);
      Alert.alert('Error', 'Failed to change polling status');
    } finally {
      setLoading(false);
    }
  };
  
  const testDetectionNotification = async () => {
    setLoading(true);
    try {
      // First fetch latest counters to show user
      await fetchAndUpdateCounters();
      
      // Manually trigger a notification check
      const result = await checkForDetectionEvents();
      
      if (result.success) {
        if (result.notified) {
          Alert.alert('Success', 'New pet detection notifications sent!');
        } else {
          Alert.alert('No New Detections', 'No new pet detections since last check. Current counts are displayed below.');
        }
      } else {
        Alert.alert('Detection Check Failed', 'API check failed, but a fallback notification was sent.');
      }
    } catch (error) {
      console.error('Error testing notifications:', error);
      Alert.alert('Error', 'Failed to test pet detection. Check console for details.');
    } finally {
      setLoading(false);
    }
  };
  
  const resetCounters = async () => {
    setLoading(true);
    try {
      const result = await resetDetectionCounters();
      if (result.success) {
        Alert.alert('Counters Reset', 'Pet detection counters have been reset. Next check will notify for all current pets.');
        // Update the displayed counters
        await fetchAndUpdateCounters();
      } else {
        Alert.alert('Reset Failed', result.error || 'Failed to reset detection counters');
      }
    } catch (error) {
      console.error('Error resetting counters:', error);
      Alert.alert('Error', 'Failed to reset counters. Check console for details.');
    } finally {
      setLoading(false);
    }
  };
  
  // Render the current counter values
  const renderCounters = () => {
    if (!currentCounters) return null;
    
    return (
      <View style={styles.countersContainer}>
        <Text style={styles.countersTitle}>Current Pet Counts:</Text>
        {Object.keys(currentCounters).map(cameraId => {
          const camera = currentCounters[cameraId];
          const displayName = cameraId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          
          return (
            <View key={cameraId} style={styles.cameraItem}>
              <Text style={styles.cameraName}>{displayName}:</Text>
              <View style={styles.petsContainer}>
                <Text style={styles.petCount}>
                  Dogs: <Text style={styles.countNumber}>{camera.dog}</Text>
                </Text>
                <Text style={styles.petCount}>
                  Cats: <Text style={styles.countNumber}>{camera.cat}</Text>
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={registerForPushNotificationsAsync}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Setting up...' : 'Register for Pet Notifications'}
        </Text>
      </TouchableOpacity>
      
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>
          Pet Detection Polling (30s)
        </Text>
        <Switch
          value={isPollingEnabled}
          onValueChange={togglePolling}
          disabled={loading}
          trackColor={{ false: '#767577', true: '#FF6F61' }}
          thumbColor={isPollingEnabled ? '#ffffff' : '#f4f3f4'}
        />
      </View>
      
      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={testDetectionNotification}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Checking...' : 'Check for New Pets Now'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[styles.resetButton, loading && styles.buttonDisabled]}
        onPress={resetCounters}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          Reset Pet Counters
        </Text>
      </TouchableOpacity>
      
      {renderCounters()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  button: {
    backgroundColor: '#FF6F61',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginVertical: 8,
    width: '100%',
    alignItems: 'center',
  },
  resetButton: {
    backgroundColor: '#666',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 8,
    width: '80%',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginVertical: 12,
    paddingHorizontal: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  countersContainer: {
    width: '100%',
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  countersTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  cameraItem: {
    marginBottom: 12,
  },
  cameraName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
    color: '#444',
  },
  petsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  petCount: {
    fontSize: 14,
    color: '#666',
  },
  countNumber: {
    fontWeight: 'bold',
    color: '#FF6F61',
  }
});

export default TestNotificationButton; 