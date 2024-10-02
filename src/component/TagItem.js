import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const TagItem = ({ item, selectedTags, onTagPress, themeColors }) => (
  <TouchableOpacity
    style={[
      styles.container,
      {
        backgroundColor: selectedTags.includes(item.name) ? '#FFC107' : themeColors.surface, // Yellow when selected, theme surface otherwise
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
          color: selectedTags.includes(item.name) ? themeColors.surface : themeColors.primary, // Inverted colors when selected
        },
      ]}
    >
      {item.displayName ? item.displayName : item.name}
    </Text>
  </TouchableOpacity>
);

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
