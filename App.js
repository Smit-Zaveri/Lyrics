import React, { useState, useEffect } from 'react';
import { StatusBar, useColorScheme, Animated, Easing } from 'react-native';
import { NavigationContainer, useTheme } from '@react-navigation/native';
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
  const colorScheme = useColorScheme(); 
  const { colors: themeColors } = useTheme();
  const fadeAnim = new Animated.Value(1);

  let activecolors = colors[colorScheme] || colors.light;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }).start();
    }, 1300);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <NavigationContainer theme={{ colors: themeColors }}>
        <StatusBar backgroundColor={activecolors.primary} />
        <Tab.Navigator
          barStyle={{ backgroundColor: activecolors.surface }}
          activeColor={activecolors.primary}
          inactiveColor={activecolors.text}
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
    </Animated.View>
  );
};

export default App;
