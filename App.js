import React, { useState, useEffect, useCallback, useMemo, createContext } from 'react';
import { StatusBar, useColorScheme, Animated } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from './src/components/SplashScreen';
import HomeStack from './src/screen/home/HomeStack';
import Profile from './src/screen/profile/Profile';
import Category from './src/screen/category/Category';
import { LogLevel, OneSignal } from 'react-native-onesignal';
import { colors } from './src/theme/Theme';

// Create bottom tab navigator
const Tab = createMaterialBottomTabNavigator();

// Create Theme Context
export const ThemeContext = createContext({
  themePreference: 'system',
  setThemePreference: () => {},
  currentTheme: 'light',
  themeColors: colors.light,
});

const App = () => {
  // 1. All useState hooks
  const [showSplash, setShowSplash] = useState(true);
  const [themePreference, setThemePreference] = useState('system');
  const fadeAnim = useMemo(() => new Animated.Value(1), []);
  
  // 2. useColorScheme hook (external store)
  const systemTheme = useColorScheme();
  
  // 3. useMemo hooks
  const currentTheme = useMemo(() => 
    themePreference === 'system' ? systemTheme : themePreference, 
    [themePreference, systemTheme]
  );
  
  const themeColors = useMemo(() => 
    colors[currentTheme === 'dark' ? 'dark' : 'light'],
    [currentTheme]
  );

  // Animate theme changes
  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentTheme, fadeAnim]);
  
  const themeContextValue = useMemo(() => ({
    themePreference,
    setThemePreference: async (newTheme) => {
      try {
        await AsyncStorage.setItem('themePreference', newTheme);
        setThemePreference(newTheme);
      } catch (error) {
        console.error('Error saving theme preference:', error);
      }
    },
    currentTheme,
    themeColors,
  }), [themePreference, currentTheme, themeColors]);

  // 4. useCallback hooks
  const renderIcon = useCallback(
    (name, color) => <Icon name={name} size={26} color={color} />,
    []
  );

  // 5. useEffect hooks
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('themePreference');
        if (savedTheme) {
          setThemePreference(savedTheme);
        }
      } catch (error) {
        console.error('Error loading theme preference:', error);
      }
    };

    loadThemePreference();
    
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    try {
      OneSignal.Debug.setLogLevel(LogLevel.Verbose);
      OneSignal.initialize('c9a87eea-dc14-4e8b-a750-b59978073d9c');
      OneSignal.Notifications.requestPermission(true);

      const handleNotificationClick = event => {
        console.log('OneSignal: notification clicked:', event);
      };

      OneSignal.Notifications.addEventListener('click', handleNotificationClick);

      return () => {
        OneSignal.Notifications.removeEventListener('click', handleNotificationClick);
      };
    } catch (error) {
      console.error('Error initializing OneSignal:', error);
    }
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <ThemeContext.Provider value={themeContextValue}>
      <NavigationContainer>
        <StatusBar
          backgroundColor={themeColors.primary}
          barStyle={currentTheme === 'dark' ? 'light-content' : 'dark-content'}
        />
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <Tab.Navigator
            barStyle={{ backgroundColor: themeColors.surface }}
            activeColor={themeColors.primary}
            inactiveColor={themeColors.text}>
            <Tab.Screen
              name="Home"
              component={HomeStack}
              options={{
                tabBarLabel: 'Home',
                tabBarIcon: ({color}) => renderIcon('home', color),
              }}
            />
            <Tab.Screen
              name="Category"
              component={Category}
              options={{
                tabBarLabel: 'Category',
                tabBarIcon: ({color}) => renderIcon('menu', color),
              }}
            />
            <Tab.Screen
              name="Profile"
              component={Profile}
              options={{
                title: 'Profile',
                tabBarLabel: 'Profile',
                tabBarIcon: ({color}) => renderIcon('person', color),
              }}
            />
          </Tab.Navigator>
        </Animated.View>
      </NavigationContainer>
    </ThemeContext.Provider>
  );
};

export default App;
