import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { ThemeContext } from '../../App';
import { colors } from '../theme/Theme';

const EmptyList = () => {
  const { themeColors } = useContext(ThemeContext);

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