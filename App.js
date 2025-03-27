import React, { useState, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  View,
  StyleSheet,
  Text,
  Dimensions,
  Alert,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import TabNavigator from './navigation/TabNavigator';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import { PostProvider } from './context/PostContext';
import { UserProvider } from './context/UserContext';
import { MapProvider } from './context/MapContext';
import { NetworkProvider, useNetwork } from './context/NetworkContext';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import axios from 'axios';
import TestNotificationButton from './components/TestNotificationButton';
import { 
  registerBackgroundNotificationTask, 
  checkBackgroundNotificationStatus, 
  startNotificationPolling,
  initializeNotificationService 
} from './services/NotificationService';

const Stack = createStackNavigator();

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check and initialize background notification tasks when app starts
    const initializeNotifications = async () => {
      try {
        // Request notification permissions
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== 'granted') {
          console.log('Notification permission not granted');
          return;
        }
        
        // Initialize notification service with counter tracking
        await initializeNotificationService();
        
        // Start polling for notifications every 30 seconds
        startNotificationPolling();
        
        // Check if background task is registered
        const taskStatus = await checkBackgroundNotificationStatus();
        if (!taskStatus.isRegistered) {
          await registerBackgroundNotificationTask();
          console.log('Background notification task registered on app start');
        } else {
          console.log('Background notification task already registered');
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initializeNotifications();
  }, []);

  const handleLogin = (userData) => {
    setLoading(true);
    setIsLoggedIn(true);
    setLoading(false);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6F61" />
      </View>
    );
  }

  return (
    <NetworkProvider>
      <MapProvider>
        <UserProvider>
          <PostProvider>
            <NetworkAwareApp isLoggedIn={isLoggedIn} handleLogin={handleLogin} />
          </PostProvider>
        </UserProvider>
      </MapProvider>
    </NetworkProvider>
  );
}

function NetworkAwareApp({ isLoggedIn, handleLogin }) {
  const { isConnected } = useNetwork();
  const notificationListener = useRef();
  const responseListener = useRef();
  const lastNotificationResponse = Notifications.useLastNotificationResponse();
  const navigation = useRef(null);

  useEffect(() => {
    // Listen for notifications when the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Notification received in foreground:', notification);
    });

    // Listen for user interactions with notifications
    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification response:', response);
      // Handle the notification interaction here
      const data = response.notification.request.content.data;
      handleNotificationInteraction(data);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);

  // Handle notification interactions when app is opened from a notification
  useEffect(() => {
    if (lastNotificationResponse) {
      const data = lastNotificationResponse.notification.request.content.data;
      handleNotificationInteraction(data);
    }
  }, [lastNotificationResponse]);

  const handleNotificationInteraction = (data) => {
    // Handle different types of notifications based on the data
    console.log('Handling notification interaction with data:', data);
    
    if (data.type === 'pet_detection') {
      const { cameraId, animalType, count, newCount } = data;
      const displayCameraId = data.location || cameraId;
      
      Alert.alert(
        `${animalType.charAt(0).toUpperCase() + animalType.slice(1)} Detection`, 
        `${newCount} new ${animalType}(s) detected on camera ${displayCameraId}.\nTotal count: ${count}`,
        [{ text: 'OK' }]
      );
      
      // You can also navigate to a specific screen here
      // if (navigation.current) {
      //   navigation.current.navigate('NotificationsScreen');
      // }
    }
    else if (data.type === 'pet_report') {
      // Handle legacy notification type
      Alert.alert('Pet Report', `A pet was reported at ${data.location || 'unknown location'}`, [
        { text: 'OK' }
      ]);
    }
  };
  
  const sendTokenToServer = (token) => {
    // Mock implementation instead of real API call
    console.log('Push token would be sent to server:', token);
    setTimeout(() => {
      console.log('Mock successful token registration');
      Alert.alert('Success', 'Push token registered locally for testing.');
    }, 1000);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Only show network banner when not connected */}
      {!isConnected && (
        <View style={styles.networkBanner}>
          <Ionicons name="alert-circle-outline" size={20} color="#FFF" />
          <Text style={styles.networkBannerText}>No Internet Connection</Text>
        </View>
      )}

      <NavigationContainer ref={navigation}>
        {isLoggedIn ? (
          <>
            <TabNavigator />
            <View style={styles.testButtonContainer}>
              <TestNotificationButton />
            </View>
          </>
        ) : (
          <Stack.Navigator initialRouteName="WelcomeScreen">
            <Stack.Screen
              name="WelcomeScreen"
              component={WelcomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen name="LoginScreen" options={{ headerShown: false }}>
              {(props) => <LoginScreen {...props} onLogin={handleLogin} />}
            </Stack.Screen>
            <Stack.Screen
              name="SignUpScreen"
              component={SignUpScreen}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        )}
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  networkBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 999,
    backgroundColor: 'red',
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkBannerText: {
    color: '#FFF',
    marginLeft: 10,
    fontSize: 16,
  },
  testButtonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    zIndex: 999,
  },
});
