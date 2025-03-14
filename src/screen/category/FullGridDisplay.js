import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import ItemGrid from '../../components/ItemGrid';
import { ThemeContext } from '../../../App';
import { LanguageContext } from '../../context/LanguageContext';

const FullGrid = ({route, navigation}) => {
  const {data, title, redirect} = route.params;
  const { themeColors } = useContext(ThemeContext);
  const { getString } = useContext(LanguageContext);

  // Handle array-based title for multi-language support ERROR  Error: You need to specify name or key when calling navigate with an object as the argument. See https://reactnavigation.org/docs/navigation-actions#navigate for usage., js engine: hermes
  const localizedTitle = Array.isArray(title) ? getString(title) : title;

  return (
    <View style={[styles.container, {backgroundColor: themeColors.background}]}>
      <ItemGrid
        navigation={navigation}
        title={localizedTitle}
        data={data}
        redirect={redirect}
        layout="grid"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 0, // Remove top padding
  },
});

export default FullGrid;
