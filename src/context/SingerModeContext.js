import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SingerModeContext = createContext();

export const SingerModeProvider = ({ children }) => {
  const [isSingerMode, setIsSingerMode] = useState(false);

  useEffect(() => {
    loadSingerModePreference();
  }, []);

  const loadSingerModePreference = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('singerMode');
      if (savedMode !== null) {
        setIsSingerMode(JSON.parse(savedMode));
      }
    } catch (error) {
      console.error('Error loading singer mode preference:', error);
    }
  };

  const toggleSingerMode = async () => {
    try {
      const newMode = !isSingerMode;
      await AsyncStorage.setItem('singerMode', JSON.stringify(newMode));
      setIsSingerMode(newMode);
    } catch (error) {
      console.error('Error saving singer mode preference:', error);
    }
  };

  return (
    <SingerModeContext.Provider value={{ isSingerMode, toggleSingerMode }}>
      {children}
    </SingerModeContext.Provider>
  );
};

export const useSingerMode = () => useContext(SingerModeContext);
