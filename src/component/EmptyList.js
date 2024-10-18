import React from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { colors } from '../theme/theme';

const EmptyList = () => {
  const systemTheme = useColorScheme(); // Hook to detect system theme
  const themeColors = systemTheme === 'dark' ? colors.dark : colors.light;

  return (
    <View style={styles.emptyListContainer}>
      <Text style={[styles.emptyListText, { color: themeColors.text }]}>
        {'No results found'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyListContainer: {
    flex: 1,
    flexDirection: 'column', // Stack children vertically
    justifyContent: 'center', // Center vertically
    alignItems: 'center', // Center horizontally
    padding: 20,
  },
  emptyListText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EmptyList;