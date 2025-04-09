import React, { createContext, useState, useMemo, useEffect } from 'react';
import { lightTheme, darkTheme } from '../theme';
import { Appearance } from 'react-native';

export const ThemeContext = createContext({
  theme: lightTheme,
  toggleTheme: () => {},
  isDarkMode: false,
});

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Initialize with system preference
  useEffect(() => {
    const colorScheme = Appearance.getColorScheme();
    setIsDarkMode(colorScheme === 'dark');
  }, []);

  const currentTheme = useMemo(() => {
    return isDarkMode ? darkTheme : lightTheme;
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // Apply theme to StatusBar and other system components
  useEffect(() => {
    // You can add StatusBar styling here if needed
    // StatusBar.setBarStyle(isDarkMode ? 'light-content' : 'dark-content');
  }, [isDarkMode]);


  return (
    <ThemeContext.Provider value={{ 
      theme: currentTheme, 
      toggleTheme, 
      isDarkMode 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
