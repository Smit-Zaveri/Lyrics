import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CategoryDisplay from './CategoryDisplay';
import List from '../../components/List';
import DetailPage from '../../components/DetailPage';
import Search from '../../components/Search';
import FullGridDisplay from './FullGridDisplay';
import { ThemeContext } from '../../../App';
import { LanguageContext } from '../../context/LanguageContext';

const Stack = createNativeStackNavigator();

const Category = () => {
  const { themeColors } = useContext(ThemeContext);
  const { getString } = useContext(LanguageContext);

  // Multi-language titles
  const titles = {
    category: ['વર્ગ', 'श्रेणी', 'Category'],
  };

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
          // If title is an array, get localized version
          headerTitle: Array.isArray(route.params.title) 
            ? getString(route.params.title)
            : route.params.title,
          ...getHeaderStyle(),
        })}
      />
      <Stack.Screen
        name="List"
        component={List}
        options={({route}) => ({
          headerTitle: Array.isArray(route.params.title) 
            ? getString(route.params.title)
            : route.params.title,
          ...getHeaderStyle(),
        })}
      />
      <Stack.Screen
        name="Search"
        component={Search}
        options={({route}) => ({
          headerTitle: Array.isArray(route.params?.title)
            ? getString(route.params.title)
            : route.params?.title || 'Search',
          ...getHeaderStyle(),
        })}
      />
      <Stack.Screen
        name="Details"
        component={DetailPage}
        options={({route}) => ({
          headerTitle: Array.isArray(route.params?.title)
            ? getString(route.params.title)
            : route.params?.title || '',
          ...getHeaderStyle(),
        })}
      />
    </Stack.Navigator>
  );
};

export default Category;
