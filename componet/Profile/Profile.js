import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';

// import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SavedLyrics from './SavedLyrics';
import DetailPage from '../common/DetailPage';
const Stack = createNativeStackNavigator();
const ProfileDisplay = ({navigation}) => {
  return (
    <View>
      <TouchableOpacity onPress={() => navigation.navigate('SavedLyrics')}>
        <View
          style={{
            borderBottomColor: 'rgba(0,0,0,0.2)',
            borderBottomWidth: 1,
            padding: 10,
            height: 70,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Icon
            style={{
              marginRight: 20,
              marginLeft: 10,
              backgroundColor: '#673AB7',
              color: '#fff',
              // paddingHorizontal: 16,
              // paddingTop: 10,
              // flex: 1,
              padding: 10,
              fontWeight: 'bold',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 25,
            }}
            name="favorite"
            color="#673AB7"
            size={25}
          />
          <Text style={{flex: 1, color: '#673AB7', fontSize: 18}}>Saved</Text>
        </View>
      </TouchableOpacity>
      {/* <View
        style={{
          borderBottomColor: 'rgba(0,0,0,0.2)',
          borderBottomWidth: 1,
          padding: 10,
          height: 70,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Icon
          style={{
            marginRight: 20,
            marginLeft: 10,
            backgroundColor: '#673AB7',
            color: '#fff',
            // paddingHorizontal: 16,
            // paddingTop: 10,
            // flex: 1,
            padding: 10,
            fontWeight: 'bold',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 25,
          }}
          name="heart"
          color="#673AB7"
          size={25}
        />
        <Text style={{flex: 1, color: '#673AB7', fontSize: 18}}>
          Update Data
        </Text>
      </View> */}
    </View>
  );
};

const Profile = () => {
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
        component={SavedLyrics}
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