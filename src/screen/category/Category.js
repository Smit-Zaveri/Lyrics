import React, { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CategoryDisplay from './CategoryDisplay';
import List from '../../component/List';
import DetailPage from '../../component/DetailPage';
import Search from '../../component/Search';
import DoubleColum from './DoubleColum';
import { colors } from '../../theme/Theme'; // Import theme colors

const Stack = createNativeStackNavigator();

const Category = () => {
  const systemTheme = useColorScheme(); // Detect system theme
  const [isDarkMode, setIsDarkMode] = useState(systemTheme === 'dark'); // Initialize state based on theme

  const themeColors = isDarkMode ? colors.dark : colors.light; // Use dark or light theme

  useEffect(() => {
    setIsDarkMode(systemTheme === 'dark');
  }, [systemTheme]);

  // Dynamic header styles based on theme
  const getHeaderStyle = () => ({
    headerStyle: {
      backgroundColor: themeColors.primary, // Dark or default color
    },
    headerTintColor: '#fff', // Keep white text in both themes
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
          ...getHeaderStyle(), // Apply dynamic header styles
        }}
      />
      <Stack.Screen
        name="List"
        component={List}
        options={{
          ...getHeaderStyle(), // Apply dynamic header styles
        }}
      />
      <Stack.Screen
        name="Search"
        component={Search}
        options={{
          ...getHeaderStyle(), // Apply dynamic header styles
        }}
      />
      <Stack.Screen
        name="Details"
        component={DetailPage}
        options={{
          ...getHeaderStyle(), // Apply dynamic header styles
        }}
      />
      <Stack.Screen
        name="Double"
        component={DoubleColum}
        options={{
          ...getHeaderStyle(), // Apply dynamic header styles
        }}
      />
    </Stack.Navigator>
  );
};

export default Category;
