import React from 'react';
import { render, fireEvent, StyleSheet } from '@testing-library/react-native';
import TagItem from '../../src/components/TagItem';

const mockItem = {
  id: '1',
  name: 'TestTag',
  displayName: 'Test Tag'
};

const mockThemeColors = {
  primary: '#000',
  surface: '#fff',
  text: '#000'
};

describe('TagItem Component', () => {
  const onTagPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with display name when provided', () => {
    const { getByText } = render(
      <TagItem
        item={mockItem}
        selectedTags={[]}
        onTagPress={onTagPress}
        themeColors={mockThemeColors}
      />
    );

    expect(getByText('Test Tag')).toBeTruthy();
  });

  it('renders with name when no display name is provided', () => {
    const itemWithoutDisplay = { ...mockItem, displayName: null };
    const { getByText } = render(
      <TagItem
        item={itemWithoutDisplay}
        selectedTags={[]}
        onTagPress={onTagPress}
        themeColors={mockThemeColors}
      />
    );

    expect(getByText('TestTag')).toBeTruthy();
  });

  it('shows selected state correctly', () => {
    const { getByText } = render(
      <TagItem
        item={mockItem}
        selectedTags={['TestTag']}
        onTagPress={onTagPress}
        themeColors={mockThemeColors}
      />
    );

    const tagElement = getByText('Test Tag').parent;
    const flattenedStyle = StyleSheet.flatten(tagElement.props.style);
    expect(flattenedStyle).toMatchObject({ backgroundColor: '#FFC107' });
  });

  it('calls onTagPress with correct tag name when pressed', () => {
    const { getByText } = render(
      <TagItem
        item={mockItem}
        selectedTags={[]}
        onTagPress={onTagPress}
        themeColors={mockThemeColors}
      />
    );

    fireEvent.press(getByText('Test Tag'));
    expect(onTagPress).toHaveBeenCalledWith('TestTag');
  });
});