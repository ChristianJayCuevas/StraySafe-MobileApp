import React from 'react';
import { View, StyleSheet, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';

export default function GradientBackground({ children }) {
  return (
    <View style={styles.container}>
      <StatusBar 
        backgroundColor={theme.colors.background}
        barStyle="dark-content"
      />
      <LinearGradient
        colors={[theme.colors.background, theme.colors.lightBlueAccent]}
        style={styles.gradient}
        start={{x: 0, y: 0}}
        end={{x: 1, y: 1}}
        locations={[0.1, 0.9]}
      />
      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});
