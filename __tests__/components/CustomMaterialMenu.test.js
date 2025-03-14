import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import CustomMaterialMenu from '../../src/components/CustomMaterialMenu';
import { ThemeContext } from '../../App';
import NetInfo from '@react-native-community/netinfo';
import { collection, addDoc } from 'firebase/firestore';

// Mock external dependencies
jest.mock('@react-native-community/netinfo', () => ({
  fetch: jest.fn()
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn()
}));

const mockThemeContext = {
  themeColors: {
    primary: '#000',
    surface: '#fff',
    text: '#000',
    placeholder: '#999',
    inputBackground: '#f0f0f0',
    inputText: '#000'
  }
};

const mockItem = {
  id: '1',
  title: 'Test Item'
};

describe('CustomMaterialMenu Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    NetInfo.fetch.mockResolvedValue({ isConnected: true });
  });

  it('renders menu button correctly', () => {
    const { getByTestId } = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <CustomMaterialMenu
          isIcon={true}
          menuText=""
          item={mockItem}
        />
      </ThemeContext.Provider>
    );

    expect(getByTestId('menu-button')).toBeTruthy();
  });

  it('shows report modal when report option is selected', async () => {
    const { getByTestId, getByText, getByPlaceholderText } = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <CustomMaterialMenu
          isIcon={true}
          menuText=""
          item={mockItem}
        />
      </ThemeContext.Provider>
    );

    fireEvent.press(getByTestId('menu-button'));
    fireEvent.press(getByText('Report'));

    expect(getByPlaceholderText('Enter your report')).toBeTruthy();
  });

  it('handles report submission successfully', async () => {
    const { getByTestId, getByText, getByPlaceholderText } = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <CustomMaterialMenu
          isIcon={true}
          menuText=""
          item={mockItem}
        />
      </ThemeContext.Provider>
    );

    // Setup mocks for successful submission
    addDoc.mockResolvedValueOnce({});

    // Open report modal and submit report
    fireEvent.press(getByTestId('menu-button'));
    fireEvent.press(getByText('Report'));
    
    const input = getByPlaceholderText('Enter your report');
    fireEvent.changeText(input, 'Test report');

    await act(async () => {
      fireEvent.press(getByText('Submit'));
    });

    expect(addDoc).toHaveBeenCalled();
    expect(getByText('Your report has been submitted successfully!')).toBeTruthy();
  });

  it('handles offline state correctly', async () => {
    NetInfo.fetch.mockResolvedValueOnce({ isConnected: false });

    const { getByTestId, getByText, getByPlaceholderText } = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <CustomMaterialMenu
          isIcon={true}
          menuText=""
          item={mockItem}
        />
      </ThemeContext.Provider>
    );

    fireEvent.press(getByTestId('menu-button'));
    fireEvent.press(getByText('Report'));
    
    const input = getByPlaceholderText('Enter your report');
    fireEvent.changeText(input, 'Test report');

    await act(async () => {
      fireEvent.press(getByText('Submit'));
    });

    expect(getByText('Please check your internet connection and try again.')).toBeTruthy();
  });
});