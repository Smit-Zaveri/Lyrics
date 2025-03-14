import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import Collections from '../../src/screen/profile/Collections';
import { ThemeContext } from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(JSON.stringify([
    { id: '1', name: 'Test Collection', songs: [] }
  ]))),
  setItem: jest.fn(),
}));

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
};

const mockThemeContext = {
  themeColors: {
    primary: '#000',
    background: '#fff',
    text: '#000',
    surface: '#fff',
    border: '#ccc',
    error: '#ff0000'
  }
};

describe('Collections Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders collections list', async () => {
    const { findByText } = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <Collections navigation={mockNavigation} />
      </ThemeContext.Provider>
    );

    const collection = await findByText('Test Collection');
    expect(collection).toBeTruthy();
  });

  it('handles collection deletion', async () => {
    const { findByText, getByTestId } = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <Collections navigation={mockNavigation} />
      </ThemeContext.Provider>
    );

    // Wait for collection to be rendered
    await findByText('Test Collection');

    // Open delete modal
    const deleteButton = getByTestId('delete-button-1');
    fireEvent.press(deleteButton);

    // Confirm deletion
    const confirmButton = getByTestId('confirm-delete');
    await act(async () => {
      fireEvent.press(confirmButton);
    });

    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it('navigates to collection details', async () => {
    const { findByText } = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <Collections navigation={mockNavigation} />
      </ThemeContext.Provider>
    );

    const collection = await findByText('Test Collection');
    fireEvent.press(collection);

    expect(mockNavigation.navigate).toHaveBeenCalledWith('List', {
      collectionName: 'Test Collection',
      customLyrics: [],
    });
  });

  it('handles empty collections state', async () => {
    AsyncStorage.getItem.mockImplementationOnce(() => Promise.resolve('[]'));

    const { findByText } = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <Collections navigation={mockNavigation} />
      </ThemeContext.Provider>
    );

    const emptyMessage = await findByText('No collections available. Pull down to refresh.');
    expect(emptyMessage).toBeTruthy();
  });
});