import React, {useContext} from 'react';
import {TouchableOpacity, Text, StyleSheet, View} from 'react-native';
import {LanguageContext} from '../context/LanguageContext';

// Simplified TagItem without complex animations
const TagItem = ({item, selectedTags, onTagPress, themeColors, isSticky}) => {
  const isSelected = selectedTags.includes(item.name);
  const {getString} = useContext(LanguageContext);

  // Get localized display name if it's an array (multi-language support)
  const getLocalizedDisplayName = () => {
    if (Array.isArray(item.displayName)) {
      return getString(item.displayName);
    }
    return item.displayName || item.name;
  };

  const displayName = getLocalizedDisplayName();

  return (
    <View style={[styles.outerContainer, isSticky && styles.stickyContainer]}>
      <TouchableOpacity
        style={[
          styles.container,
          {
            backgroundColor: isSelected
              ? themeColors.primary
              : themeColors.surface,
            borderColor: isSelected
              ? themeColors.primary
              : themeColors.border || 'rgba(0,0,0,0.12)',
          },
        ]}
        activeOpacity={0.7}
        onPress={() => onTagPress(item.name)}
        accessibilityLabel={`${displayName} filter`}
        accessibilityHint={`${isSelected ? 'Remove' : 'Apply'} ${displayName} filter`}
        accessibilityRole="button"
        accessibilityState={{selected: isSelected}}>
        <Text
          style={[
            styles.chipText,
            {
              color: isSelected ? '#fff' : themeColors.text,
            },
          ]}
          numberOfLines={1}>
          {displayName}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    marginHorizontal: 4,
    marginVertical: 2,
  },
  stickyContainer: {
    marginRight: 6,
  },
  container: {
    minHeight: 36,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

export default TagItem;
