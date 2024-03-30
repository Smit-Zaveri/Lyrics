import React, {useState, useEffect} from 'react';
import {Text, View} from 'react-native';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import SplashScreen from './componet/common/SplashScreen';
import HomeStack from './componet/Home/HomeStack';
import Profile from './componet/Profile/Profile';
import Category from './componet/Category/Category';

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
                    <MaterialCommunityIcons
                      name="home"
                      color={color}
                      size={26}
                    />
                  ),
                }}
              />
              <Tab.Screen
                name="Category"
                component={Category}
                options={{
                  tabBarLabel: 'Category',
                  tabBarIcon: ({color}) => (
                    <MaterialCommunityIcons
                      name="menu"
                      color={color}
                      size={26}
                    />
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
                    <MaterialCommunityIcons
                      name="account"
                      color={color}
                      size={26}
                    />
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
