import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useEffect, useMemo, useState } from 'react';

// Supported languages with numeric identifiers
export const LANGUAGES = {
  GUJARATI: 0,
  HINDI: 1,
  ENGLISH: 2,
};

// Display names for languages in their native scripts
export const LANGUAGE_NAMES = {
  [LANGUAGES.GUJARATI]: 'ગુજરાતી',
  [LANGUAGES.HINDI]: 'हिन्दी',
  [LANGUAGES.ENGLISH]: 'English',
};

// Default language for the app
const DEFAULT_LANGUAGE = LANGUAGES.GUJARATI;

// Context for managing app language state
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

  // Load saved language preference on component mount
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

  // Get localized string based on current language
  const getString = (stringArray) => {
    if (!stringArray || !Array.isArray(stringArray)) {
      return '';
    }

    if (language >= 0 && language < stringArray.length) {
      return stringArray[language];
    }

    // Fallback to first available language
    for (let i = 0; i < stringArray.length; i++) {
      if (stringArray[i]) return stringArray[i];
    }

    return '';
  };

  const languageName = LANGUAGE_NAMES[language];

  // Save language preference and update state
  const setAndSaveLanguage = async (newLanguage) => {
    try {
      await AsyncStorage.setItem('languagePreference', newLanguage.toString());
      setLanguage(newLanguage);
      setIsLanguageSelected(true);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  // Memoized context value to prevent unnecessary re-renders
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