import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SplashScreen from './src/component/SplashScreen';
import HomeStack from './src/screen/home/HomeStack';
import Profile from './src/screen/profile/Profile';
import Category from './src/screen/category/Category';
import {LogLevel, OneSignal} from 'react-native-onesignal';
import {colors} from './src/theme/Theme';
// import {initializeGroups} from './src/config/DataService';

// Create bottom tab navigator
const Tab = createMaterialBottomTabNavigator();

const App = () => {
  const [showSplash, setShowSplash] = useState(true); // State to manage splash screen visibility

  // Detect system theme (light or dark) and set theme colors accordingly
  const systemTheme = useColorScheme();
  const themeColors = systemTheme === 'dark' ? colors.dark : colors.light;
  const {primary, surface, text} = themeColors;

  // OneSignal initialization and event listener setup
  useMemo(() => {
    try {
      OneSignal.Debug.setLogLevel(LogLevel.Verbose); // Set OneSignal log level
      OneSignal.initialize('c9a87eea-dc14-4e8b-a750-b59978073d9c'); // Initialize OneSignal with app ID
      OneSignal.Notifications.requestPermission(true); // Request notification permissions

      const handleNotificationClick = event => {
        // Handle notification click event
        console.log('OneSignal: notification clicked:', event);
      };

      // Add event listener for notification clicks
      OneSignal.Notifications.addEventListener(
        'click',
        handleNotificationClick,
      );

      // // Initialize groups (custom function)
      // initializeGroups();

      // Cleanup event listener when component unmounts
      return () => {
        OneSignal.Notifications.removeEventListener(
          'click',
          handleNotificationClick,
        );
      };
    } catch (error) {
      console.error('Error initializing OneSignal:', error);
    }
  }, []);

  // Handle splash screen timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false); // Hide splash screen after 1300ms
    }, 1300);

    return () => clearTimeout(timer); // Cleanup timer on component unmount
  }, []);

  // Memoize renderIcon to avoid unnecessary re-renders
  const renderIcon = useCallback(
    (name, color) => <Icon name={name} size={26} color={color} />,
    [],
  );

  // If splash screen is visible, render it
  if (showSplash) {
    return <SplashScreen />;
  }

  // Main app rendering with navigation container and tab navigator
  return (
    <NavigationContainer>
      <StatusBar
        backgroundColor={primary}
        barStyle={systemTheme === 'dark' ? 'light-content' : 'dark-content'}
      />
      <Tab.Navigator
        barStyle={{backgroundColor: surface}}
        activeColor={primary}
        inactiveColor={text}>
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
    </NavigationContainer>
  );
};

export default App;
