import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import DetailPage from '../../src/components/DetailPage';
import { ThemeContext } from '../../App';
import { LanguageContext } from '../../src/context/LanguageContext';

// Mock the required navigation and route props
const mockNavigation = {
  setOptions: jest.fn(),
  navigate: jest.fn(),
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
    border: '#ccc'
  }
};

// Mock language context
const mockLanguageContext = {
  getString: jest.fn((arr) => arr[0]),
  language: 'en'
};

describe('DetailPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with initial props', () => {
    const { getByText } = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <LanguageContext.Provider value={mockLanguageContext}>
          <DetailPage navigation={mockNavigation} route={mockRoute} />
        </LanguageContext.Provider>
      </ThemeContext.Provider>
    );

    expect(getByText('Test Content')).toBeTruthy();
  });

  it('sets header options on mount', () => {
    render(
      <ThemeContext.Provider value={mockThemeContext}>
        <LanguageContext.Provider value={mockLanguageContext}>
          <DetailPage navigation={mockNavigation} route={mockRoute} />
        </LanguageContext.Provider>
      </ThemeContext.Provider>
    );

    expect(mockNavigation.setOptions).toHaveBeenCalled();
  });

  // Add more tests as needed
});