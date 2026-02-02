import React, {useContext} from 'react';
import {TouchableOpacity, Text, StyleSheet, View} from 'react-native';
import {LanguageContext} from '../context/LanguageContext';

const TagItem = ({item, selectedTags, onTagPress, themeColors, isSticky}) => {
  const isSelected = selectedTags.includes(item.name);
  const {getString} = useContext(LanguageContext);

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
              : themeColors.border || 'rgba(0,0,0,0.08)',
            shadowColor: isSelected ? themeColors.primary : 'rgba(0,0,0,0.1)',
          },
        ]}
        activeOpacity={0.9}
        onPress={() => onTagPress(item.name)}
        accessibilityLabel={`${displayName} filter`}
        accessibilityHint={`${isSelected ? 'Remove' : 'Apply'} ${displayName} filter`}
        accessibilityRole="button"
        // accessibilityState={{selected: isSelected}}
        >
        <Text
          style={[
            styles.chipText,
            isSelected && styles.chipTextSelected,
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
    marginHorizontal: 2,
    marginVertical: 4,
  },
  container: {
    minWidth: 54,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 28,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1.2,
    elevation: 3,
    shadowColor: 'rgba(0,0,0,0.1)',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowSpread: 0,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    includeFontPadding: false,
    textAlignVertical: 'center',
    letterSpacing: 0.2,
  },
  chipTextSelected: {
    fontWeight: '700',
  },
});

export default TagItem;
