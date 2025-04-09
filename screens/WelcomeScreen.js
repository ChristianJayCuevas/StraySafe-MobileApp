import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, StatusBar, SafeAreaView, Platform, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');
const STATUSBAR_HEIGHT = StatusBar.currentHeight || 0;
const screenHeight = Platform.OS === 'ios' ? height : height + STATUSBAR_HEIGHT;

const images = [
  require('../assets/welcome1.png'),
  require('../assets/welcome2.png'),
  require('../assets/welcome3.png'),
  require('../assets/welcome4.jpg'),
  require('../assets/welcome5.jpg'),
  require('../assets/welcome6.jpg'),
  require('../assets/welcome7.jpg'),
  require('../assets/kuting1.jpg'),
  require('../assets/hoshing1.jpg')
];

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const [dimensions, setDimensions] = useState({ width, height: screenHeight });

  useEffect(() => {
    const updateDimensions = () => {
      const { width, height } = Dimensions.get('window');
      setDimensions({ 
        width, 
        height: Platform.OS === 'ios' ? height : height + STATUSBAR_HEIGHT 
      });
    };
    
    const dimensionsListener = Dimensions.addEventListener('change', updateDimensions);
    return () => dimensionsListener.remove();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out current image
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        // Change image index
        setCurrentIndex((prevIndex) =>
          prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
        // Fade in new image
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  return (
    <View style={[styles.container, { width: dimensions.width, height: dimensions.height }]}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <Animated.Image
        source={images[currentIndex] || require('../assets/welcome1.png')}
        style={[
          styles.image, 
          { 
            width: dimensions.width, 
            height: dimensions.height,
            opacity: fadeAnim
          }
        ]}
      />

      <LinearGradient
        colors={['transparent', 'rgba(0, 0, 0, 0.8)']}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.6 }}
        style={[styles.gradientOverlay, { height: dimensions.height * 0.6 }]}
      />

      <View style={styles.overlayContent}>
        <View style={styles.indicatorsContainer}>
          {images.map((_, index) => (
            <View 
              key={index}
              style={[
                styles.indicator,
                index === currentIndex && styles.activeIndicator
              ]}
            />
          ))}
        </View>

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
    backgroundColor: '#000',
  },
  indicatorsContainer: {
    marginBottom: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.4)',
    marginHorizontal: 4,
  },
  activeIndicator: {
    backgroundColor: '#fff',
    width: 16,
  },
  image: {
    position: 'absolute',
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
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
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
