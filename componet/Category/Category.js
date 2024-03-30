import React from 'react';

import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import {Card} from 'react-native-elements';

import {NavigationContainer} from '@react-navigation/native';

import {SuperGridSectionList} from 'react-native-super-grid';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SingleRow from './SingleRow';
import DoubleColum from './DoubleColum';
import CategoryDisplay from './CategoryDisplay';
import ArtistSongList from './ArtistSongList';
import DetailPage from '../common/DetailPage';
import CatagoryList from './CatagoryList';
import BhagwanSongList from './BhagwanSongList';

const Stack = createNativeStackNavigator();

const Category = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="CategoryDisplay"
        component={CategoryDisplay}
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
        name="ArtistSongList"
        component={ArtistSongList}
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
        name="BhagwanSongList"
        component={BhagwanSongList}
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
        name="CatagoryList"
        component={CatagoryList}
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
        name="Double"
        component={DoubleColum}
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

export default Category;