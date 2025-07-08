import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import Search from '../../src/components/Search';
import { ThemeContext } from '../../App';
import { LanguageContext } from '../../src/context/LanguageContext';

// Mock external dependencies
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
}));

jest.mock('../../src/config/dataService', () => ({
  getFromAsyncStorage: jest.fn(() => Promise.resolve([])),
}));

const mockThemeContext = {
  themeColors: {
    primary: '#000',
    background: '#fff',
    text: '#000',
    surface: '#fff',
    card: '#fff',
    border: '#ccc',
  }
};

const mockLanguageContext = {
  getString: jest.fn(arr => arr[0]),
  language: 'en'
};

describe('Search Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders search bar correctly', () => {
    const { getByPlaceholderText } = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <LanguageContext.Provider value={mockLanguageContext}>
          <Search route={{ params: {} }} />
        </LanguageContext.Provider>
      </ThemeContext.Provider>
    );

    expect(getByPlaceholderText('Search lyrics, artist, or tags')).toBeTruthy();
  });

  it('shows suggestions when typing', async () => {
    const { getByPlaceholderText, findByText } = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <LanguageContext.Provider value={mockLanguageContext}>
          <Search 
            route={{ 
              params: { 
                suggestions: ['Test Suggestion'] 
              } 
            }} 
          />
        </LanguageContext.Provider>
      </ThemeContext.Provider>
    );

    const searchInput = getByPlaceholderText('Search lyrics, artist, or tags');
    await act(async () => {
      fireEvent.changeText(searchInput, 'Test');
    });

    const suggestion = await findByText('Test Suggestion');
    expect(suggestion).toBeTruthy();
  });

  it('shows empty state when no results found', async () => {
    const { getByPlaceholderText, findByText } = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <LanguageContext.Provider value={mockLanguageContext}>
          <Search route={{ params: {} }} />
        </LanguageContext.Provider>
      </ThemeContext.Provider>
    );

    const searchInput = getByPlaceholderText('Search lyrics, artist, or tags');
    await act(async () => {
      fireEvent.changeText(searchInput, 'NonexistentQuery');
    });

    const noResults = await findByText('No results found');
    expect(noResults).toBeTruthy();
  });
});