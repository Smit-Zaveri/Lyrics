import React, {useState, useEffect} from 'react';
import {Text, View} from 'react-native';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import SplashScreen from './componet/common/SplashScreen';
import HomeStack from './componet/home/HomeStack';
import Profile from './componet/profile/Profile';
import Category from './componet/category/Category';

const Tab = createMaterialBottomTabNavigator();
// const Stack = createNativeStackNavigator();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1300);

    return () => clearTimeout(timer);
  }, []);
  return (
    <>
      {showSplash ? (
        <SplashScreen />
      ) : (
        // <View
        //   style={{
        //     flex: 1,
        //     justifyContent: 'center',
        //     alignItems: 'center',
        //   }}>
        //   <Text>Hello, world!</Text>
        // </View>
        <>
          <NavigationContainer>
            <StatusBar backgroundColor="#673AB7" />
            <Tab.Navigator>
              <Tab.Screen
                name="Home"
                component={HomeStack}
                options={{
                  tabBarLabel: 'Home',
                  tabBarIcon: ({color}) => (
                    <Icon name="home" size={26} color={color} />
                  ),
                }}
              />
              <Tab.Screen
                name="Category"
                component={Category}
                options={{
                  tabBarLabel: 'Category',
                  tabBarIcon: ({color}) => (
                    <Icon name="menu" size={26} color={color} />
                  ),
                }}
              />
              <Tab.Screen
                name="Profile"
                component={Profile}
                options={{
                  title: 'Jain Dhun',
                  tabBarLabel: 'Profile',
                  tabBarIcon: ({color}) => (
                    <Icon name="person" size={26} color={color} />
                  ),
                }}
              />
            </Tab.Navigator>
          </NavigationContainer>
        </>
      )}
    </>
  );
};
export default App;
