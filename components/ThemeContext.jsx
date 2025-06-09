import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';


export const ThemeContext = createContext();


const lightTheme = {
  background: '#FFFFFF',
  text: '#000000',
  bannerText: 'white',
  secondaryText: '#666666',
  cardBackground: 'rgba(240, 235, 235, 0.4)',
  buttonBackground: '#E0E0E0',
  buttonText: '#000000',
  accent: '#00FF00',
};

const darkTheme = {
  background: '#1A1A1A',
  text: '#FFFFFF',
  bannerText: 'white',
  secondaryText: '#A9A9A9',
  cardBackground: 'rgba(0,0,0,0.4)',
  buttonBackground: '#3C3C3C',
  buttonText: '#FFFFFF',
  accent: '#00FF00',
};

export const ThemeProvider = ({ children }) => {
  const [isLightMode, setIsLightMode] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState(
    require('../assets/images/beyaz.jpg')
  );

  const colors = isLightMode ? lightTheme : darkTheme;

  const toggleTheme = async () => {
    try {
      const newMode = !isLightMode;
      setIsLightMode(newMode);
      await AsyncStorage.setItem('themeMode', newMode ? 'light' : 'dark');
    } catch (err) {
      console.error('Error saving theme to storage:', err);
    }
  };

  
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedMode = await AsyncStorage.getItem('themeMode');
        if (storedMode === 'dark') {
          setIsLightMode(false);
        } else if (storedMode === 'light') {
          setIsLightMode(true);
        }
      } catch (err) {
        console.error('Error loading theme from storage:', err);
      }
    };
    loadTheme();
  }, []);

  
  useEffect(() => {
    setBackgroundImage(
      isLightMode
        ? require('../assets/images/beyaz.jpg')
        : require('../assets/images/Katman.png')
    );
  }, [isLightMode]);

  const themeContextValue = {
    isLightMode,
    toggleTheme,
    colors,
    backgroundImage,
  };

  return (
    <ThemeContext.Provider value={themeContextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
