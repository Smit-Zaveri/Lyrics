
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';

import DetailPage from '../common/DetailPage';
import List from './List';
const Stack = createNativeStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator initialRouteName="List">
      <Stack.Screen
        name="List"
        component={List}
        options={{
          title: 'Jain Dhun',
          headerStyle: {
            backgroundColor: '#673AB7',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
        }}
      />
      <Stack.Screen
        name="Details"
        component={DetailPage}
        options={{
          headerStyle: {
            backgroundColor: '#673AB7',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 20,
          },
        }}
      />
    </Stack.Navigator>
  );
};
export default HomeStack;
