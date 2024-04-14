import React, { useEffect, useState } from 'react';
import { Text, TouchableOpacity, View, StyleSheet, Image } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { GoogleSigninButton, GoogleSignin } from '@react-native-google-signin/google-signin';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import SavedLyrics from './SavedLyrics';
import DetailPage from '../../componet/DetailPage';
import Suggestion from './Suggestion';

const Stack = createNativeStackNavigator();

const ProfileDisplay = ({ navigation }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId:
        '285813640279-kesrte26ndv7dqk2umb0sgjmn3t7sqr7.apps.googleusercontent.com',
    });

    const subscriber = auth().onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        setUserInfo({
          name: firebaseUser.displayName,
          photo: firebaseUser.photoURL,
        });
        setIsLoggedIn(true);
        saveUserInfo({
          name: firebaseUser.displayName,
          photo: firebaseUser.photoURL,
        });
      } else {
        setIsLoggedIn(false);
      }
    });

    loadUserInfo();

    return () => subscriber();
  }, []);

  const loadUserInfo = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('userInfo');
      if (savedUser) {
        setUserInfo(JSON.parse(savedUser));
        setIsLoggedIn(true);
      }
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  const saveUserInfo = async (user) => {
    try {
      await AsyncStorage.setItem('userInfo', JSON.stringify(user));
    } catch (error) {
      console.error('Error saving user info:', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      
      const firebaseUserCredential = await auth().signInWithCredential(googleCredential);
      
      setUserInfo({
        name: firebaseUserCredential.user.displayName,
        photo: firebaseUserCredential.user.photoURL,
      });
      saveUserInfo({
        name: firebaseUserCredential.user.displayName,
        photo: firebaseUserCredential.user.photoURL,
      });
      
      setIsLoggedIn(true);
      navigation.navigate('ProfileDisplay');
    } catch (error) {
      console.error('Google login error:', error);
      console.error('Google login error message:', error.message);
    }
  };

  const handleGoogleLogout = async () => {
    try {
      await GoogleSignin.signOut();
      
      const currentUser = auth().currentUser;
      
      if (currentUser) {
        await auth().signOut();
        setIsLoggedIn(false);
        await AsyncStorage.removeItem('userInfo');
      } else {
        console.error('No user currently signed in');
      }
    } catch (error) {
      console.error('Logout error:', error);
      console.error('Logout error message:', error.message);
    }
  };

  return (
    <View style={styles.container}>
      {isLoggedIn ? (
        userInfo && (
          <View style={styles.profileHeader}>
            <Image 
              source={{ uri: userInfo.photo ?? 'https://via.placeholder.com/150' }} 
              style={styles.profileIcon} 
            />
            <Text style={styles.profileName}>{userInfo.name ?? 'User\'s Name'}</Text>
          </View>
        )
      ) : null}
      <TouchableOpacity onPress={() => navigation.navigate('SavedLyrics')}>
        <View style={styles.item}>
          <Icon name="favorite" color="#673AB7" size={25} />
          <Text style={styles.text}>Saved</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Suggestion')}>
        <View style={styles.item}>
          <Icon name="info" color="#673AB7" size={25} />
          <Text style={styles.text}>Suggestion</Text>
        </View>
      </TouchableOpacity>
      {isLoggedIn ? (
        userInfo && (
          <TouchableOpacity onPress={handleGoogleLogout}>
            <Text style={styles.logoutButton}>Logout</Text>
          </TouchableOpacity>
        )
      ) : (
        <GoogleSigninButton
          style={styles.googleButton}
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={handleGoogleLogin}
        />
      )}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  profileIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  item: {
    borderBottomColor: 'rgba(0,0,0,0.2)',
    borderBottomWidth: 1,
    padding: 10,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    color: '#673AB7',
    fontSize: 18,
    marginLeft: 20,
  },
  googleButton: {
    marginTop: 20,
  },
  logoutButton: {
    marginTop: 20,
    backgroundColor: '#FF0000',
    color: '#FFF',
    padding: 10,
    textAlign: 'center',
  },
});

export default Profile;
