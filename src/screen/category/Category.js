import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CategoryDisplay from './CategoryDisplay';
import List from '../../components/List';
import DetailPage from '../../components/DetailPage';
import Search from '../../components/Search';
import FullGridDisplay from './FullGridDisplay';
import { ThemeContext } from '../../../App';

const Stack = createNativeStackNavigator();

const Category = () => {
  const { themeColors } = useContext(ThemeContext);

  // Dynamic header styles based on theme
  const getHeaderStyle = () => ({
    headerStyle: {
      backgroundColor: themeColors.primary,
    },
    headerTintColor: '#fff',
    headerTitleStyle: {
      fontWeight: 'bold',
      fontSize: 20,
    },
  });

  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CategoryDisplay"
        component={CategoryDisplay}
        options={{
          headerTitle: 'Category',
          ...getHeaderStyle(),
        }}
      />
      <Stack.Screen
        name="FullGrid"
        component={FullGridDisplay}
        options={({route}) => ({
          headerTitle: route.params.title,
          ...getHeaderStyle(),
        })}
      />
      <Stack.Screen
        name="List"
        component={List}
        options={getHeaderStyle}
      />
      <Stack.Screen
        name="Search"
        component={Search}
        options={getHeaderStyle}
      />
      <Stack.Screen
        name="Details"
        component={DetailPage}
        options={getHeaderStyle}
      />
    </Stack.Navigator>
  );
};

export default Category;
