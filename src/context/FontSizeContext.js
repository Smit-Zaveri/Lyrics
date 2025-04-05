import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const FontSizeContext = createContext();

export const FontSizeProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState(18);

  useEffect(() => {
    loadFontSize();
  }, []);

  const loadFontSize = async () => {
    try {
      const savedFontSize = await AsyncStorage.getItem('fontSize');
      if (savedFontSize) {
        setFontSize(parseInt(savedFontSize, 10));
      }
    } catch (error) {
      console.error('Error loading font size:', error);
    }
  };

  const changeFontSize = async (newSize) => {
    try {
      await AsyncStorage.setItem('fontSize', newSize.toString());
      setFontSize(newSize);
    } catch (error) {
      console.error('Error saving font size:', error);
    }
  };

  return (
    <FontSizeContext.Provider value={{ fontSize, changeFontSize }}>
      {children}
    </FontSizeContext.Provider>
  );
};
