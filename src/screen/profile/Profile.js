import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState, useContext } from 'react';
import DetailPage from '../../components/DetailPage';
import ProfileDisplay from './ProfileDisplay';
import Suggestion from './Suggestion';
import Search from '../../components/Search';
import List from '../../components/List';
import Settings from './Settings';
import Collections from './Collections';
import { ThemeContext } from '../../../App';

const Stack = createNativeStackNavigator();

const Profile = () => {
  const [savedLyrics, setSavedLyrics] = useState([]);
  const { themeColors } = useContext(ThemeContext);
    
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
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: themeColors.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
      }}>
      <Stack.Screen name="ProfileDisplay" component={ProfileDisplay} options={{ headerTitle: 'Profile' }} />
      <Stack.Screen name="Collections" component={Collections} options={{ headerTitle: 'My Collections' }} />
      <Stack.Screen name="SavedLyrics" component={List} initialParams={{ collectionName: "saved", Tags: "tags" }} />
      <Stack.Screen name="Suggestion" component={Suggestion} />
      <Stack.Screen name="List" component={List} />
      <Stack.Screen name="Details" component={DetailPage} />
      <Stack.Screen name="Search" component={Search} />
      <Stack.Screen name="Settings" component={Settings} />
    </Stack.Navigator>
  );
};

export default Profile;
