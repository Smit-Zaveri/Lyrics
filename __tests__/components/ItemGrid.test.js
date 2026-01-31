import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import ItemGrid from '../../src/components/ItemGrid';
import {ThemeContext} from '../../App';
import {LanguageContext} from '../../src/context/LanguageContext';

const mockNavigation = {
  navigate: jest.fn(),
};

const mockData = [
  {
    id: '1',
    displayName: ['Test Item 1', 'परीक्षण आइटम 1', 'Test Item 1'],
    numbering: 1,
    picture: 'https://example.com/test.jpg',
  },
  {
    id: '2',
    displayName: ['Test Item 2', 'परीक्षण आइटम 2', 'Test Item 2'],
    numbering: 2,
  },
];

const mockThemeContext = {
  themeColors: {
    primary: '#000',
    background: '#fff',
    text: '#000',
    surface: '#fff',
    link: '#0000ff',
  },
};

const mockLanguageContext = {
  getString: jest.fn(arr => arr[0]),
  language: 'en',
};

describe('ItemGrid Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders in grid layout correctly', () => {
    const {getAllByText} = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <LanguageContext.Provider value={mockLanguageContext}>
          <ItemGrid
            navigation={mockNavigation}
            title="Test Grid"
            data={mockData}
            redirect="Details"
            layout="grid"
          />
        </LanguageContext.Provider>
      </ThemeContext.Provider>,
    );

    expect(getAllByText('Test Item 1')).toBeTruthy();
    expect(getAllByText('Test Item 2')).toBeTruthy();
  });

  it('renders in single layout correctly', () => {
    const {getAllByText, getByText} = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <LanguageContext.Provider value={mockLanguageContext}>
          <ItemGrid
            navigation={mockNavigation}
            title="Test List"
            data={mockData}
            redirect="Details"
            layout="single"
          />
        </LanguageContext.Provider>
      </ThemeContext.Provider>,
    );

    expect(getAllByText('Test Item 1')).toBeTruthy();
    expect(getByText('MORE')).toBeTruthy();
  });

  it('navigates correctly when item is pressed', () => {
    const {getByText} = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <LanguageContext.Provider value={mockLanguageContext}>
          <ItemGrid
            navigation={mockNavigation}
            title="Test Grid"
            data={mockData}
            redirect="Details"
            layout="grid"
          />
        </LanguageContext.Provider>
      </ThemeContext.Provider>,
    );

    fireEvent.press(getByText('Test Item 1'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith(
      'Details',
      expect.any(Object),
    );
  });

  it('handles MORE button press correctly', () => {
    const {getByText} = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <LanguageContext.Provider value={mockLanguageContext}>
          <ItemGrid
            navigation={mockNavigation}
            title="Test List"
            data={mockData}
            redirect="Details"
            layout="single"
          />
        </LanguageContext.Provider>
      </ThemeContext.Provider>,
    );

    fireEvent.press(getByText('MORE'));
    expect(mockNavigation.navigate).toHaveBeenCalledWith('FullGrid', {
      title: 'Test List',
      data: mockData,
      redirect: 'Details',
    });
  });
});
