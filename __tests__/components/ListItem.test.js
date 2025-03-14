import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import ListItem from '../../src/components/ListItem';
import { LanguageContext } from '../../src/context/LanguageContext';

const mockItem = {
  id: '1',
  title: ['Test Title', 'परीक्षण शीर्षक', 'Test Title'],
  content: ['Test Content', 'परीक्षण सामग्री', 'Test Content'],
  numbering: 1,
  publishDate: { seconds: Date.now() / 1000 },
  newFlag: true
};

const mockThemeColors = {
  primary: '#000',
  surface: '#fff',
  text: '#000',
  border: '#ccc'
};

const mockLanguageContext = {
  getString: jest.fn(arr => arr[0]),
  language: 'en'
};

describe('ListItem Component', () => {
  const onItemPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with all props', () => {
    const { getByText } = render(
      <LanguageContext.Provider value={mockLanguageContext}>
        <ListItem
          item={mockItem}
          themeColors={mockThemeColors}
          onItemPress={onItemPress}
        />
      </LanguageContext.Provider>
    );

    expect(getByText('Test Title')).toBeTruthy();
    expect(getByText('Test Content')).toBeTruthy();
    expect(getByText('1')).toBeTruthy();
  });

  it('shows NEW flag for recent items', () => {
    const { getByText } = render(
      <LanguageContext.Provider value={mockLanguageContext}>
        <ListItem
          item={mockItem}
          themeColors={mockThemeColors}
          onItemPress={onItemPress}
        />
      </LanguageContext.Provider>
    );

    expect(getByText('NEW')).toBeTruthy();
  });

  it('calls onItemPress with correct item when pressed', () => {
    const { getByText } = render(
      <LanguageContext.Provider value={mockLanguageContext}>
        <ListItem
          item={mockItem}
          themeColors={mockThemeColors}
          onItemPress={onItemPress}
        />
      </LanguageContext.Provider>
    );

    fireEvent.press(getByText('Test Title'));
    expect(onItemPress).toHaveBeenCalledWith(mockItem);
  });

  it('handles missing content gracefully', () => {
    const incompleteItem = {
      ...mockItem,
      content: null
    };

    const { getByText } = render(
      <LanguageContext.Provider value={mockLanguageContext}>
        <ListItem
          item={incompleteItem}
          themeColors={mockThemeColors}
          onItemPress={onItemPress}
        />
      </LanguageContext.Provider>
    );

    expect(getByText('Test Title')).toBeTruthy();
  });
});