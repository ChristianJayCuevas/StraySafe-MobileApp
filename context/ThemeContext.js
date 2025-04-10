// In StraySafe-MobileApp/context/ThemeContext.js
import React, { createContext, useState, useContext } from 'react';

const lightTheme = {
  colors: {
    background: '#f4f5dd',
    primary: '#f4f5dd',
    textPrimary: '#white',
    textSecondary: '#5A5A5A',
    highlight: '#000000',
    activeTab: '#506643', // New property for active tabs
    orangeAccent: '#F4A261',
    lightBlueAccent: '#A8DADC',
  },
};

const darkTheme = {
  colors: {
    background: '#white',
    primary: '#20293b',
    textPrimary: 'white',
    textSecondary: '#BBBBBB',
    highlight: '#e3e8f0',
    activeTab: '#5180f4', // Updated dark mode active tab color
    orangeAccent: '#FF9800',
    lightBlueAccent: '#4DD0E1',
  },
};

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState('light');
  const toggleTheme = () => setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  const theme = themeMode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, themeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};