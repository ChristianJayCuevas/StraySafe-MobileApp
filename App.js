import React, { useState, useEffect, useRef } from 'react';
import { ThemeProvider, ThemeContext } from './context/ThemeContext';
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
import { 
  registerBackgroundNotificationTask, 
  checkBackgroundNotificationStatus, 
  startNotificationPolling,
  initializeNotificationService,
  updateCurrentUser,
  performImmediateCheck
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

function MainApp() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Initialize notification service
        await initializeNotificationService();
        
        // Register background task
        await registerBackgroundNotificationTask();
        
        // Start notification polling
        startNotificationPolling();
        
        // Perform an immediate check for notifications
        const checkResult = await performImmediateCheck();
        if (checkResult.success && checkResult.notified) {
          console.log('Immediate check found relevant notifications');
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing app:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  const handleLogin = async (userData) => {
    try {
      // Update the notification service with the new user
      const updateResult = await updateCurrentUser(userData);
      
      if (updateResult) {
        setCurrentUser(userData);
        setIsAuthenticated(true);
        
        // Perform an immediate check after login
        const checkResult = await performImmediateCheck();
        if (checkResult.success && checkResult.notified) {
          console.log('Post-login check found relevant notifications');
        }
      }
    } catch (error) {
      console.error('Error during login:', error);
      Alert.alert('Error', 'Failed to complete login process');
    }
  };

  const handleLogout = async () => {
    try {
      setCurrentUser(null);
      setIsAuthenticated(false);
      await updateCurrentUser(null);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6F61" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }


  
  return (
    <UserProvider>
      <PostProvider>
        <MapProvider>
          <NavigationContainer>
              <Stack.Navigator
                screenOptions={{
                  headerShown: false,
                }}
              >
                {!isAuthenticated ? (
                  <>
                    <Stack.Screen name="Welcome" component={WelcomeScreen} />
                    <Stack.Screen name="Login">
                      {(props) => (
                        <LoginScreen {...props} onLogin={handleLogin} />
                      )}
                    </Stack.Screen>
                    <Stack.Screen name="SignUp" component={SignUpScreen} />
                  </>
                ) : (
                  <Stack.Screen name="MainApp">
                    {(props) => (
                      <TabNavigator {...props} onLogout={handleLogout} />
                    )}
                  </Stack.Screen>
                )}
              </Stack.Navigator>
            </NavigationContainer>
          </MapProvider>
        </PostProvider>
      </UserProvider>
  );
}


export default function App() {
  return (
    <ThemeProvider>
      <ThemeContext.Consumer>
        {({theme}) => (
          <View style={{flex: 1, backgroundColor: theme.colors.background}}>
            <MainApp />
          </View>
        )}
      </ThemeContext.Consumer>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#FF6F61',
  },
});
