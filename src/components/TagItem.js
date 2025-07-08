import React, { useContext } from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { LanguageContext } from '../context/LanguageContext';

// Simplified TagItem without complex animations
const TagItem = ({ item, selectedTags, onTagPress, themeColors, isSticky }) => {
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
    <View
      style={[
        styles.outerContainer,
        isSticky && styles.stickyContainer
      ]}
    >
      <TouchableOpacity
        testID={`tag-item-${item.name}`}
        style={[
          styles.container,
          {
            backgroundColor: isSelected ? '#FFC107' : themeColors.surface,
            borderColor: themeColors.primary,
            borderWidth: 1.5,
            transform: [{ scale: isSelected ? 1.05 : 1 }]
          },
        ]}
        activeOpacity={0.7}
        onPress={() => onTagPress(item.name)}
      >
        <Text
          style={[
            styles.chipText,
            {
              color: isSelected ? themeColors.surface : themeColors.primary,
            },
          ]}
          numberOfLines={1}
        >
          {getLocalizedDisplayName()}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    margin: 2,
    zIndex: 1,
  },
  stickyContainer: {
    marginRight: 4,
    zIndex: 10,
  },
  container: {
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    paddingHorizontal: 12,
    marginHorizontal: 2,
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  chipText: {
    fontSize: 13,
    textTransform: 'capitalize',
    fontWeight: 'bold',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default TagItem;