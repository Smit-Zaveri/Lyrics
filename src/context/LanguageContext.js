import React, { createContext, useState, useEffect, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supported languages
export const LANGUAGES = {
  GUJARATI: 0,
  HINDI: 1,
  ENGLISH: 2,
};

// Language names for display
export const LANGUAGE_NAMES = {
  [LANGUAGES.GUJARATI]: 'ગુજરાતી',
  [LANGUAGES.HINDI]: 'हिन्दी',
  [LANGUAGES.ENGLISH]: 'English',
};

// Default language
const DEFAULT_LANGUAGE = LANGUAGES.ENGLISH;

// Create Language Context
export const LanguageContext = createContext({
  language: DEFAULT_LANGUAGE,
  setLanguage: () => {},
  isLanguageSelected: false,
  languageName: LANGUAGE_NAMES[DEFAULT_LANGUAGE],
  getString: (stringArray) => '',
});

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [isLanguageSelected, setIsLanguageSelected] = useState(false);

  useEffect(() => {
    const loadLanguagePreference = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('languagePreference');
        if (savedLanguage !== null) {
          setLanguage(parseInt(savedLanguage));
          setIsLanguageSelected(true);
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
      }
    };

    loadLanguagePreference();
  }, []);

  // Helper function to get strings in selected language
  const getString = (stringArray) => {
    if (!stringArray || !Array.isArray(stringArray)) {
      return '';
    }
    
    if (language >= 0 && language < stringArray.length) {
      return stringArray[language];
    }
    
    // Fallback to the first available language if the selected language is not available
    for (let i = 0; i < stringArray.length; i++) {
      if (stringArray[i]) return stringArray[i];
    }
    
    return '';
  };

  const languageName = LANGUAGE_NAMES[language];

  const setAndSaveLanguage = async (newLanguage) => {
    try {
      await AsyncStorage.setItem('languagePreference', newLanguage.toString());
      setLanguage(newLanguage);
      setIsLanguageSelected(true);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const contextValue = useMemo(() => ({
    language,
    setLanguage: setAndSaveLanguage,
    isLanguageSelected,
    languageName,
    getString,
  }), [language, isLanguageSelected, languageName]);

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
};