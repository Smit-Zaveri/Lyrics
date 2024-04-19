
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import React from 'react';
import List from './List';
import DetailPage from '../../componet/DetailPage';
import Search from '../Search';
import { sampleLyrics } from '../../config/sampleLyrics';


const Stack = createNativeStackNavigator();

const sampleTags = [
  {id: '1', name: 'Mahavir'},
  {id: '2', name: 'Nem'},
  {id: '3', name: 'R&B'},
  {id: '5', name: 'Soul'},
  {id: '6', name: 'Mahavir'},
  {id: '7', name: 'Nem'},
  {id: '8', name: 'R&B'},
  {id: '9', name: 'Soul'},
  {id: '10', name: 'Mahavir'},
  {id: '11', name: 'Nem'},
  {id: '12', name: 'R&B'},
  {id: '13', name: 'Soul'},
];

const HomeStack = () => {
  const sanitizedLyrics = sampleLyrics.map(lyric => {
    const { publishDate, ...rest } = lyric;
    return {
      ...rest,
      publishDate: publishDate.toISOString() // Convert Date to string
    };
  });
  
  // Pass the sanitized Lyrics to the List component
  return (
    <Stack.Navigator initialRouteName="List">
      <Stack.Screen
        name="List"
        component={List}
        initialParams={{ Lyrics: sanitizedLyrics, Tags : sampleTags }} // Pass sanitized Lyrics here
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
      <Stack.Screen
        name="Search"
        component={Search}
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
