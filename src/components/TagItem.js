import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const TagItem = ({ item, selectedTags, onTagPress, themeColors }) => {
  const isSelected = selectedTags.includes(item.name);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isSelected ? '#FFC107' : themeColors.surface, // Yellow when selected, theme surface otherwise
          borderColor: themeColors.primary, // Primary color for the border
          borderWidth: 2,
          marginTop: 8,
          marginBottom: 11,
        },
      ]}
      onPress={() => onTagPress(item.name)}
    >
      <Text
        style={[
          styles.chipText,
          {
            color: isSelected ? themeColors.surface : themeColors.primary, // Inverted colors when selected
          },
        ]}
      >
        {item.displayName || item.name}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 97,
    paddingLeft: 12,
    paddingRight: 12,
    marginHorizontal: 5,
  },
  chipText: {
    padding: 8,
    fontSize: 13,
    height: 36,
    textTransform: 'capitalize',
    fontWeight: 'bold',
  },
});

export default TagItem;