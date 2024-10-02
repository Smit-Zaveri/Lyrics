import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useColorScheme } from 'react-native';
import List from './List';
import DetailPage from '../../component/DetailPage';
import Search from '../../component/Search';
import { colors } from '../../theme/theme';

const Stack = createNativeStackNavigator();


const HomeStack = () => {
  // Get system color scheme (either 'light' or 'dark')
  const systemTheme = useColorScheme();

  // Select the appropriate theme colors based on system theme
  const themeColors = systemTheme === 'dark' ? colors.dark : colors.light;


  return (
    <Stack.Navigator
      initialRouteName="List"
      screenOptions={{
        headerStyle: {
          backgroundColor: themeColors.primary, // Dynamic header background based on theme
        },
        headerTintColor: '#fff', // Keep header text white
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
      }}
    >
      <Stack.Screen
        name="List"
        component={List}
        initialParams={{ collectionName: "lyrics", Tags: "tags" , title: "Jain Dhun"}}
      />
      <Stack.Screen
        name="Details"
        component={DetailPage}
        options={{
          title: 'Details',
        }}
      />
      <Stack.Screen
        name="Search"
        component={Search}
        options={{
          title: 'Search',
        }}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;
