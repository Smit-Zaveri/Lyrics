import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ThemeContext } from '../../App';

const EmptyList = () => {
  const { themeColors } = useContext(ThemeContext);

  return (
    <View style={styles.emptyListContainer}>
      <View style={[styles.iconContainer, { backgroundColor: `${themeColors.primary}15` }]}>
        <Icon name="playlist-remove" size={50} color={themeColors.primary} />
      </View>
      <Text style={[styles.emptyListText, { color: themeColors.text }]}>
        No results found
      </Text>
      <Text style={[styles.emptyListSubText, { color: themeColors.placeholder }]}>
        Try adjusting your filters or search criteria
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyListText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyListSubText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default EmptyList;