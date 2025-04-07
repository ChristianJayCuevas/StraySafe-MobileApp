import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList, Dimensions, StatusBar, SafeAreaView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

// Get device dimensions including the status bar
const { width, height } = Dimensions.get('window');
const STATUSBAR_HEIGHT = StatusBar.currentHeight || 0;
const screenHeight = Platform.OS === 'ios' ? height : height + STATUSBAR_HEIGHT;

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
  const [dimensions, setDimensions] = useState({ width, height: screenHeight });

  // Add event listener for dimension changes (for device rotation)
  useEffect(() => {
    const updateDimensions = () => {
      const { width, height } = Dimensions.get('window');
      setDimensions({ 
        width, 
        height: Platform.OS === 'ios' ? height : height + STATUSBAR_HEIGHT 
      });
    };
    
    // Set up listener for dimension changes
    const dimensionsListener = Dimensions.addEventListener('change', updateDimensions);
    
    // Clean up
    return () => {
      dimensionsListener.remove();
    };
  }, []);

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
    <Image 
      source={item} 
      style={[styles.image, { width: dimensions.width, height: dimensions.height }]} 
    />
  );

  return (
    <View style={[styles.container, { width: dimensions.width, height: dimensions.height }]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <FlatList
        data={images}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        ref={flatListRef}
        style={[styles.imageSlider, { width: dimensions.width, height: dimensions.height }]}
        snapToInterval={dimensions.width}
        decelerationRate="fast"
        bounces={false}
      />

      {/* Ombre gradient overlay for the bottom portion of the screen */}
      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
        style={[styles.gradientOverlay, { height: dimensions.height * 0.6 }]}
      />

      {/* Overlay containing text and buttons */}
      <View style={styles.overlayContent}>
        <Text style={styles.title}>Together, we can make every street a kinder place for stray animals.</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.signUpButton]}
            onPress={() => navigation.navigate('SignUp')}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.signInButton]}
            onPress={() => navigation.navigate('Login')}
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
    backgroundColor: '#000', // Add background color to avoid flashing
  },
  imageSlider: {
    flex: 1,
  },
  image: {
    resizeMode: 'cover',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  overlayContent: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 50 : 30,
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 0 : 20,
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
    justifyContent: 'space-around',
    width: '80%',
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    borderWidth: 1,
    alignItems: 'center',
    minWidth: 120,
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