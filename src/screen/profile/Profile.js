import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import DetailPage from '../../component/DetailPage';
import List from '../home/List';
import ProfileDisplay from './ProfileDisplay';
import Suggestion from './Suggestion';
import { colors } from '../../theme/theme';
import Search from '../../component/Search';

const Stack = createNativeStackNavigator();

const Profile = () => {
  const [savedLyrics, setSavedLyrics] = useState([]);
  const systemTheme = useColorScheme();
  const isDarkMode = systemTheme === 'dark';
  const themeColors = isDarkMode ? colors.dark : colors.light;

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
          headerTitle: 'Profile',
          headerStyle: {
            backgroundColor: themeColors.primary,
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
        initialParams={{ collectionName: "saved", Tags: "tags" }}
        options={{
          headerTitle: 'Saved Lyrics',
          headerStyle: {
            backgroundColor: themeColors.primary,
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
            backgroundColor: themeColors.primary,
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
            backgroundColor: themeColors.primary,
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
            backgroundColor: themeColors.primary,
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
