import React, { useState } from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import { colors } from '../theme/theme';

const EmptyList = ({ filteredLyrics }) => {
  const systemTheme = useColorScheme(); // Hook to detect system theme
  const [isDarkMode] = useState(systemTheme === 'dark'); // Initialize based on system theme
  const themeColors = isDarkMode ? colors.dark : colors.light;

  return (<View style={styles.emptyListContainer}>
    <Text style={[styles.emptyListText, { color: themeColors.text }]}>
      {filteredLyrics.length === 0 ? 'No results found' : 'No data available'}
    </Text>
  </View>)
};

const styles = StyleSheet.create({
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyListText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default EmptyList;
