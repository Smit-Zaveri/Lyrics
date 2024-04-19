import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import DetailPage from '../../componet/DetailPage';
import List from '../home/List';
import ProfileDisplay from './ProfileDisplay';
import Suggestion from './Suggestion';
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

const Stack = createNativeStackNavigator();

const Profile = () => {
  const [savedLyrics, setSavedLyrics] = useState([]);
  const fetchSavedLyrics = async () => {
    try {
      const savedData = await AsyncStorage.getItem('saved');
      if (savedData !== null) {
        const savedLyricsArray = JSON.parse(savedData);
        setSavedLyrics(savedLyricsArray);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSavedLyrics();
  }, []);
  return (
    <Stack.Navigator initialRouteName="ProfileDisplay">
      <Stack.Screen
        name="ProfileDisplay"
        component={ProfileDisplay}
        options={{
          headerTitle: 'Jain Dhun',
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
        name="SavedLyrics"
        component={List}
        initialParams={{Lyrics: savedLyrics, Tags: sampleTags}}
        options={{
          headerTitle: 'Saved Lyrics',
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
        name="Suggestion"
        component={Suggestion}
        options={{
          headerTitle: 'Suggestion',
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
        name="SavedDetails"
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



export default Profile;
