import React from 'react';
import { render } from '@testing-library/react-native';
import EmptyList from '../../src/components/EmptyList';
import { ThemeContext } from '../../App';

const mockThemeContext = {
  themeColors: {
    text: '#000',
    background: '#fff'
  }
};

describe('EmptyList Component', () => {
  it('renders the empty state message', () => {
    const { getByText } = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <EmptyList />
      </ThemeContext.Provider>
    );

    expect(getByText('No results found')).toBeTruthy();
  });

  it('applies theme colors correctly', () => {
    const { getByText } = render(
      <ThemeContext.Provider value={mockThemeContext}>
        <EmptyList />
      </ThemeContext.Provider>
    );

    const textElement = getByText('No results found');
    expect(textElement.props.style).toContainEqual(
      expect.objectContaining({ color: mockThemeContext.themeColors.text })
    );
  });
});