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

import axios from 'axios';

export default function SignUpScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const token = 'StraySafeTeam3';
  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
  
    try {
      const requestData = {
        username: username,
        email: email,
        password: password,
        password_confirmation: confirmPassword,
        contact_number: phoneNumber,
      };
  
      const response = await axios.post(
        `https://straysafe.me/api/user/signup`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.data.status === "success") {
        alert(response.data.message);
        navigation.navigate("Login");
      } else {
        const errorMessage = response.data.message || "Registration failed";
        if (typeof errorMessage === 'object') {
          alert("Error: " + Object.values(errorMessage).join('\n'));
        } else {
          alert("Error: " + errorMessage);
        }
      }
    } catch (error) {
      console.error("Error during sign-up:", error.response ? error.response.data : error);
      alert("Registration failed. Please check your details.");
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
        <Image
          source={require('../assets/LOGO.png')}
          style={styles.logo}
        />
        <View style={styles.card}>
          <Text style={styles.header}>Sign Up</Text>
          <Image
            source={require('../assets/illustration.png')}
            style={styles.illustration}
          />
          <TextInput
            style={styles.input}
            placeholder="Username"
            placeholderTextColor="#999"
            value={username}
            onChangeText={setUsername}
            accessibilityLabel="Username input"
            accessibilityHint="Enter your username"
            importantForAccessibility="yes"
            autoComplete="username"
            textContentType="username"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            accessibilityLabel="Email input"
            accessibilityHint="Enter your email address"
            importantForAccessibility="yes"
            autoComplete="email"
            textContentType="emailAddress"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            accessibilityLabel="Phone number input"
            accessibilityHint="Enter your phone number"
            importantForAccessibility="yes"
            autoComplete="tel"
            textContentType="telephoneNumber"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            accessibilityLabel="Password input"
            accessibilityHint="Enter your password"
            importantForAccessibility="yes"
            autoComplete="password"
            textContentType="password"
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            placeholderTextColor="#999"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            accessibilityLabel="Confirm password input"
            accessibilityHint="Re-enter your password"
            importantForAccessibility="yes"
            autoComplete="password"
            textContentType="password"
          />
          <TouchableOpacity 
            style={styles.signUpButton} 
            onPress={handleSignUp}
            accessibilityRole="button"
            accessibilityLabel="Sign up button"
            accessibilityHint="Press to create your account"
          >
            <Text style={styles.signUpButtonText}>Sign Up</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Login')}
            accessibilityRole="button"
            accessibilityLabel="Login link"
            accessibilityHint="Navigate to login page"
          >
            <Text style={styles.loginRedirectText}>
              Already have an account? <Text style={styles.loginRedirectLink}>Log in</Text>
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
    marginBottom: 1,
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
    color: '#333',
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
    color: '#000',
    marginBottom: 20,
    minHeight: 44, // Minimum touch target size for accessibility
  },
  signUpButton: {
    width: '100%',
    backgroundColor: '#506643',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
    minHeight: 44, // Minimum touch target size for accessibility
  },
  signUpButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginRedirectText: {
    color: '#333',
    fontSize: 14,
  },
  loginRedirectLink: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    color: '#506643',
  },
});
