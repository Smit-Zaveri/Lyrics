import React, { useState, useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer, useTheme } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import HomeStack from './src/screen/home/HomeStack';
import Profile from './src/screen/profile/Profile';
import Category from './src/screen/category/Category';
import SplashScreen from './src/componet/SplashScreen';
import { colors } from './src/theme/theme';

const Tab = createMaterialBottomTabNavigator();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);
  const colorScheme = useColorScheme(); 
  const { colors: themeColors } = useTheme();

  let activecolors = colors[colorScheme] || colors.light;

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
        <>
          <NavigationContainer theme={{ colors: themeColors }}>
            <StatusBar backgroundColor={activecolors.primary} />
            <Tab.Navigator
              barStyle={{ backgroundColor: activecolors.surface }}
              activeColor={activecolors.primary}
              inactiveColor={activecolors.text}  // Set inactive color to text color
            >
              <Tab.Screen
                name="Home"
                component={HomeStack}
                options={{
                  tabBarLabel: 'Home',
                  tabBarIcon: ({ color }) => (
                    <Icon name="home" size={26} color={color} />
                  ),
                }}
              />
              <Tab.Screen
                name="Category"
                component={Category}
                options={{
                  tabBarLabel: 'Category',
                  tabBarIcon: ({ color }) => (
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
                  tabBarIcon: ({ color }) => (
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
