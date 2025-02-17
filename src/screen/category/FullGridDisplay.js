import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import ItemGrid from '../../components/ItemGrid';
import { ThemeContext } from '../../../App';

const FullGrid = ({route, navigation}) => {
  const {data, title, redirect} = route.params;
  const { themeColors } = useContext(ThemeContext);

  return (
    <View style={[styles.container, {backgroundColor: themeColors.background}]}>
      <ItemGrid
        navigation={navigation}
        title={title}
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
