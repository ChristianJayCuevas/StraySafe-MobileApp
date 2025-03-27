import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window'); // Get full screen dimensions

const images = [
  require('../assets/welcome1.png'), // Replace with your actual image paths
  require('../assets/welcome2.png'),
  require('../assets/welcome3.png'),
  require('../assets/welcome4.jpg'),
  require('../assets/welcome5.jpg'),
  require('../assets/welcome6.jpg'),
  require('../assets/welcome7.jpg'),
  require('../assets/welcome8.jpg'),
  require('../assets/welcome10.png')
];

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, []);

  // Update FlatList position when index changes
  useEffect(() => {
    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ index: currentIndex, animated: true });
    }
  }, [currentIndex]);

  // Check if user is logged in
  useEffect(() => {
    
  }, [])

  const renderItem = ({ item }) => (
    <Image source={item} style={styles.image} />
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={images}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        ref={flatListRef}
        style={styles.imageSlider}
      />

      {/* Ombre gradient overlay for the bottom 1/4 of the screen */}
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
        style={styles.gradientOverlay}
      />

      {/* Overlay containing text and buttons */}
      <View style={styles.overlayContent}>
        <Text style={styles.title}>Together, we can make every street a kinder place for stray animals.</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.signUpButton]}
            onPress={() => navigation.navigate('SignUpScreen')}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.signInButton]}
            onPress={() => navigation.navigate('LoginScreen')}
          >
            <Text style={[styles.buttonText, styles.signInButtonText]}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  imageSlider: {
    width: width,
    height: height,
  },
  image: {
    width: width,
    height: height,
    resizeMode: 'cover',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: height * 0.6, // Covers the bottom 1/4 of the screen
  },
  overlayContent: {
    position: 'absolute',
    bottom: 50,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: 'center',
  },
  signUpButton: {
    backgroundColor: '#fff',
  },
  signInButton: {
    borderColor: '#fff',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  signInButtonText: {
    color: '#fff',
  },
});