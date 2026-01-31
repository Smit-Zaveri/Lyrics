import * as React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import DetailPage from '../../src/components/DetailPage';
import { ThemeContext } from '../../App';
import { LanguageContext } from '../../src/context/LanguageContext';
import { FontSizeContext } from '../../src/context/FontSizeContext';

// Mock the SingerModeContext
jest.mock('../../src/context/SingerModeContext', () => ({
  useSingerMode: () => ({ isSingerMode: false }),
}));

// Mock FontSizeContext
jest.mock('../../src/context/FontSizeContext', () => {
  const { createContext } = require('react');
  const FontSizeContext = createContext({ fontSize: 16, changeFontSize: jest.fn() });
  return {
    FontSizeContext,
    FontSizeProvider: ({ children }) => children
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve('16')),
  setItem: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-sound
jest.mock('react-native-sound', () => ({
  setCategory: jest.fn(),
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
}));

// Mock react-native-sound
jest.mock('react-native-sound', () => ({
  setCategory: jest.fn(),
}));

// Mock PanResponder
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  RN.PanResponder = {
    create: jest.fn(() => ({
      panHandlers: {}
    }))
  };
  return RN;
});
const mockNavigation = {
  setOptions: jest.fn(),
  navigate: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
};

const mockRoute = {
  params: {
    itemNumberingparas: 1,
    Lyrics: [
      {
        id: '1',
        title: ['Test Title', 'परीक्षण शीर्षक', 'Test Title'],
        content: ['Test Content', 'परीक्षण सामग्री', 'Test Content'],
        audio: 'test-audio.mp3',
        filteredIndex: 1
      }
    ]
  }
};

// Mock theme context
const mockThemeContext = {
  themeColors: {
    primary: '#000',
    background: '#fff',
    text: '#000',
    surface: '#fff',
    border: '#ccc',
    textSecondary: '#666'
  }
};

// Mock language context
const mockLanguageContext = {
  getString: jest.fn((arr) => arr[0]),
  language: 'en'
};

// Mock font size context
const mockFontSizeContext = {
  fontSize: 16,
  changeFontSize: jest.fn()
};

describe('DetailPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with initial props', async () => {
    const { getByText } = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <LanguageContext.Provider value={mockLanguageContext}>
          <FontSizeContext.Provider value={mockFontSizeContext}>
            <DetailPage navigation={mockNavigation} route={mockRoute} />
          </FontSizeContext.Provider>
        </LanguageContext.Provider>
      </ThemeContext.Provider>
    );

    await act(async () => {
      // Wait for async operations
    });

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('sets header options on mount', async () => {
    render(
      <ThemeContext.Provider value={mockThemeContext}>
        <LanguageContext.Provider value={mockLanguageContext}>
          <FontSizeContext.Provider value={mockFontSizeContext}>
            <DetailPage navigation={mockNavigation} route={mockRoute} />
          </FontSizeContext.Provider>
        </LanguageContext.Provider>
      </ThemeContext.Provider>
    );

    await act(async () => {
      // Wait for async operations
    });

    expect(mockNavigation.setOptions).toHaveBeenCalled();
  });

  // Add more tests as needed
});