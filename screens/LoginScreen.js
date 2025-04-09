import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme';

import axios from 'axios';
import { usePostContext } from '../context/PostContext';
import { useUserContext } from '../context/UserContext';
import { updateCurrentUser } from '../services/NotificationService';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();
  const { setUser } = useUserContext(); 
  // Hardcoded token
  const token = 'StraySafeTeam3';

  const handleLogin = async () => {
    try {
      const requestData = {
        email: username,
        password: password,
      };

      const response = await axios.post(
        'https://straysafe.me/api/mobilelogin',
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data && response.data.token) {
        const user = {
          isLoggedIn: true,
          token: response.data.token,
          userData: response.data.user,
        };

        // Set the user data globally
        setUser(user);
        
        // Only update notification service if we have complete user data
        if (user.userData && user.userData.name) {
          console.log(`Updating notification service for user: ${user.userData.name}`);
          await updateCurrentUser(user);
        } else {
          console.log('User data incomplete, skipping notification update');
        }

        // Navigate to the main app
        onLogin(user);
      } else {
        alert('Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('Login Error:', error.response?.data || error.message);
      alert('Login failed. Please check your credentials.');
    }
  };

  
  

  const fetchUsers = async () => {
    try {
      // Make API request to fetch users
      const response = await axios.get('https://straysafe.me/api/mobileusers', {
        headers: {
          Authorization: `Bearer ${token}`, // Use hardcoded token
        },
      });

      // Check if user exists in the retrieved list
      const users = response.data.data;
      const currentUser = users.find((u) => u.email === username);

      if (currentUser) {
        console.log('User exists:', currentUser);
        alert('Login successful!');
      } else {
        alert('User does not exist.');
      }
    } catch (error) {
      console.error('Fetch Users Error:', error.response?.data || error.message);
      alert('Error fetching users.');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/wallpaper3.jpg')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <View style={styles.overlay} />
      <View style={styles.container}>
        <Image source={require('../assets/LOGO.png')} style={styles.logo} />
        <View style={styles.logoTextContainer}>
        </View>
  
        <View style={styles.card}>
          {/* Header */}
          <Text style={styles.header}>Login</Text>

          {/* Illustration */}
          <Image
            source={require('../assets/illustration.png')}
            style={styles.illustration}
          />

          {/* Input */}
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor={theme.colors.textSecondary}
            value={username}
            onChangeText={setUsername}
            accessibilityLabel="Username input"
            accessibilityHint="Enter your username or email"
            importantForAccessibility="yes"
            autoComplete="username"
            textContentType="username"
          />

          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={theme.colors.textSecondary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            accessibilityLabel="Password input"
            accessibilityHint="Enter your password"
            importantForAccessibility="yes"
            autoComplete="password"
            textContentType="password"
          />

          {/* Login Button */}
          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin}
            accessibilityRole="button"
            accessibilityLabel="Login button"
            accessibilityHint="Press to login with your credentials"
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>

          {/* Social Login */}
          <Text style={styles.orText}>OR login with</Text>
          <View style={styles.socialContainer}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-facebook" size={24} color="#3b5998" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-google" size={24} color="#db4437" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-apple" size={24} color="#A2AAAD" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-github" size={24} color="black" />
            </TouchableOpacity>
          </View>

          {/* Sign up Link */}
          <TouchableOpacity 
            onPress={() => navigation.navigate('SignUp')}
            accessibilityRole="button"
            accessibilityLabel="Sign up link"
            accessibilityHint="Navigate to sign up page"
          >
  <Text style={styles.signUpText}>
    Don't have an account?{' '}
    <Text style={styles.signUpLink}>Sign up</Text>
  </Text>
</TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({

  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(250, 244, 235, 0.7)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 500,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  card: {
    width: '85%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
    marginBottom: 20,
  },
  illustration: {
    width: 250,
    height: 160,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    backgroundColor: '#d4d8be',
    paddingHorizontal: 15,
    fontSize: 16,
    color: theme.colors.textPrimary,
    marginBottom: 20,
    minHeight: 44, // Minimum touch target size for accessibility
  },
  loginButton: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    minHeight: 44, // Minimum touch target size for accessibility
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  orText: {
    color: theme.colors.textPrimary,
    fontSize: 16,
    marginBottom: 10,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
    marginBottom: 20,
  },
  socialButton: {
    padding: 10,
  },
  signUpText: {
    color: theme.colors.textPrimary,
    fontSize: 14,
  },
  signUpLink: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    color: theme.colors.primary,
  },
});
