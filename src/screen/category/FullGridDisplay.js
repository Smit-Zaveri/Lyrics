import React from 'react';
import {View, StyleSheet, useColorScheme} from 'react-native';
import ItemGrid from '../../component/ItemGrid';
import {colors} from '../../theme/Theme';

const FullGrid = ({route, navigation}) => {
  const {data, title, redirect} = route.params;
  const systemTheme = useColorScheme();
  const isDarkMode = systemTheme === 'dark';
  const themeColors = isDarkMode ? colors.dark : colors.light;

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
  },
});

export default FullGrid;
