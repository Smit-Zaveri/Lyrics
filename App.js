import React, { useState, useEffect } from 'react';
import { StatusBar} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { enableScreens } from 'react-native-screens';
import SplashScreen from './src/componet/SplashScreen';
import HomeStack from './src/screen/home/HomeStack';
import Profile from './src/screen/profile/Profile';
import Category from './src/screen/category/Category';
import { colors } from './src/theme/theme';

enableScreens();

const Tab = createMaterialBottomTabNavigator();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  const activeColors = colors.light; // Assuming light is the default color scheme

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      
    }, 1300);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
      <NavigationContainer>
        <StatusBar backgroundColor={activeColors.primary} />
        <Tab.Navigator
          barStyle={{ backgroundColor: activeColors.surface }}
          activeColor={activeColors.primary}
          inactiveColor={activeColors.text}
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
  );
};

export default App;