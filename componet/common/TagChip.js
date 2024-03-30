// TagChip.js
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const TagChip = ({ item, isSelected, onPress }) => (
  <TouchableOpacity
    style={[
      styles.container,
      {
        backgroundColor: isSelected ? '#FFC107' : '#fff',
        height: 40,
      },
    ]}
    onPress={onPress}>
    <Text style={styles.chipText}>{item.name}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 97,
    paddingLeft: 12,
    paddingRight: 12,
    marginVertical: 15,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: '#673AB7',
  },
  chipText: {
    padding: 8,
    fontSize: 13,
    height: 36,
    textTransform: 'capitalize',
    fontWeight: 'bold',
    color: '#673AB7',
  },
});

export default TagChip;
