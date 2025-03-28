import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useContext } from 'react';
import List from '../../components/List';
import DetailPage from '../../components/DetailPage';
import Search from '../../components/Search';
import HomeList from './HomeList';
import { ThemeContext } from '../../../App';

const Stack = createNativeStackNavigator();

const HomeStack = () => {
  const { themeColors } = useContext(ThemeContext);
    
  return (
    <Stack.Navigator
      initialRouteName="HomeList"
      screenOptions={{
        headerStyle: {
          backgroundColor: themeColors.primary,
        },
        headerTintColor: '#fff',
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
          headerTitle: 'Jain Dhun',
        }}
      />
      <Stack.Screen name="List" component={List} />
      <Stack.Screen name="Search" component={Search} />
      <Stack.Screen name="Details" component={DetailPage} />
    </Stack.Navigator>
  );
};

export default HomeStack;
