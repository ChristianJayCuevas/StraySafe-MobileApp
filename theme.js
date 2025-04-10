import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const theme = {
  colors: {
    background: '#Aec3b0', // Light beige/cream background
    primary: '#506643', // Teal for buttons and interactive elements
    textPrimary: '#2C2C2C', // Dark gray for main text
    textSecondary: '#5A5A5A', // Medium gray for secondary text
    highlight: '#506643', // Soft peach highlight for inputs and secondary elements
    orangeAccent: '#F4A261', // Orange for graphic accents
    lightBlueAccent: '#A8DADC', // Light blue for graphic accents
  },
  dimensions: {
    width,
    height,
  },
  fonts: {
    titleFont: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#000', 
    },
    buttonText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#FFF', // White for contrast on buttons
    },
    linkText: {
      fontSize: 14,
      fontWeight: 'bold',
      color: '#3CB8AD', // Teal for interactive text
      textDecorationLine: 'underline',
    },
  },
  button: {
    primaryButton: {
      backgroundColor: '#3CB8AD', // Teal
      paddingVertical: 15,
      borderRadius: 10,
      alignItems: 'center',
    },
    secondaryButton: {
      backgroundColor: '#F2D8B1', // Soft peach
      paddingVertical: 15,
      borderRadius: 10,
      alignItems: 'center',
    },
  },
  input: {
    inputField: {
      backgroundColor: '#F2D8B1', // Soft peach for background
      borderRadius: 10,
      paddingHorizontal: 15,
      color: '#2C2C2C', // Dark gray text
      height: 50,
      fontSize: 16,
    },
  },
};