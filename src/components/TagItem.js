import React, { useContext } from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { LanguageContext } from '../context/LanguageContext';

const TagItem = ({ item, selectedTags, onTagPress, themeColors }) => {
  const isSelected = selectedTags.includes(item.name);
  const { getString } = useContext(LanguageContext);

  // Get localized display name if it's an array (multi-language support)
  const getLocalizedDisplayName = () => {
    if (Array.isArray(item.displayName)) {
      return getString(item.displayName);
    }
    return item.displayName || item.name;
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: isSelected ? '#FFC107' : themeColors.surface,
          borderColor: themeColors.primary,
          borderWidth: 1.5,
        },
      ]}
      onPress={() => onTagPress(item.name)}
    >
      <Text
        style={[
          styles.chipText,
          {
            color: isSelected ? themeColors.surface : themeColors.primary,
          },
        ]}
      >
        {getLocalizedDisplayName()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    marginVertical: 6,
  },
  chipText: {
    fontSize: 12,
    textTransform: 'capitalize',
    fontWeight: '600',
  },
});

export default TagItem;