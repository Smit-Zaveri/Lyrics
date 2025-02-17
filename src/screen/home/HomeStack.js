import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { useColorScheme } from 'react-native';
import List from '../../components/List';
import DetailPage from '../../components/DetailPage';
import Search from '../../components/Search';
import { colors } from '../../theme/Theme';
import HomeList from './HomeList';

const Stack = createNativeStackNavigator();


const HomeStack = () => {
  // Get system color scheme (either 'light' or 'dark')
  const systemTheme = useColorScheme();

  // Select the appropriate theme colors based on system theme
  const themeColors = systemTheme === 'dark' ? colors.dark : colors.light;


  return (
    <Stack.Navigator
      initialRouteName="HomeList"
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
        name="HomeList"
        component={HomeList}
        options={{
          title: 'Jain Dhun',
        }}
      />
      <Stack.Screen
        name="List"
        component={List}
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
