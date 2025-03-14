import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Settings from '../../src/screen/profile/Settings';
import { ThemeContext } from '../../App';
import { LanguageContext } from '../../src/context/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

const mockThemeContext = {
  themePreference: 'system',
  setThemePreference: jest.fn(),
  themeColors: {
    primary: '#000',
    background: '#fff',
    text: '#000',
    surface: '#fff',
    border: '#ccc',
    textSecondary: '#666'
  }
};

const mockLanguageContext = {
  language: 'en',
  setLanguage: jest.fn(),
  languageName: 'English',
  getString: jest.fn(arr => arr[0])
};

describe('Settings Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all settings sections', () => {
    const { getByText } = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <LanguageContext.Provider value={mockLanguageContext}>
          <Settings />
        </LanguageContext.Provider>
      </ThemeContext.Provider>
    );

    expect(getByText('Font Size')).toBeTruthy();
    expect(getByText('Language (ભાષા / भाषा)')).toBeTruthy();
  });

  it('handles font size changes', async () => {
    const { getByText } = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <LanguageContext.Provider value={mockLanguageContext}>
          <Settings />
        </LanguageContext.Provider>
      </ThemeContext.Provider>
    );

    const increaseFontButton = getByText('+');
    fireEvent.press(increaseFontButton);

    expect(AsyncStorage.setItem).toHaveBeenCalledWith('fontSize', '20');
  });

  it('handles theme changes', () => {
    const { getByText } = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <LanguageContext.Provider value={mockLanguageContext}>
          <Settings />
        </LanguageContext.Provider>
      </ThemeContext.Provider>
    );

    const darkThemeButton = getByText('Dark');
    fireEvent.press(darkThemeButton);

    expect(mockThemeContext.setThemePreference).toHaveBeenCalledWith('dark');
  });

  it('handles language changes', () => {
    const { getByText } = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <LanguageContext.Provider value={mockLanguageContext}>
          <Settings />
        </LanguageContext.Provider>
      </ThemeContext.Provider>
    );

    const gujaratiOption = getByText('ગુજરાતી');
    fireEvent.press(gujaratiOption);

    expect(mockLanguageContext.setLanguage).toHaveBeenCalledWith('gu');
  });
});