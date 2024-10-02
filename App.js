import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {StatusBar, useColorScheme} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import SplashScreen from './src/component/SplashScreen';
import HomeStack from './src/screen/home/HomeStack';
import Profile from './src/screen/profile/Profile';
import Category from './src/screen/category/Category';
import {colors} from './src/theme/theme';
import {LogLevel, OneSignal} from 'react-native-onesignal';
import {initializeGroups} from './src/config/dataService';

const Tab = createMaterialBottomTabNavigator();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  // Detect system theme (light or dark)
  const systemTheme = useColorScheme();
  const themeColors = systemTheme === 'dark' ? colors.dark : colors.light;
  const {primary, surface, text} = themeColors;

  // OneSignal initialization and event listener
  useMemo(() => {
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    OneSignal.initialize('c9a87eea-dc14-4e8b-a750-b59978073d9c');
    OneSignal.Notifications.requestPermission(true);

    const handleNotificationClick = event => {
      //console.log('OneSignal: notification clicked:', event);
    };

    OneSignal.Notifications.addEventListener('click', handleNotificationClick);

    // Initialize groups
    initializeGroups();

    // Cleanup event listener when component unmounts
    return () => {
      OneSignal.Notifications.removeEventListener(
        'click',
        handleNotificationClick,
      );
    };
  }, []);

  // Handle splash screen timeout
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1300);

    return () => clearTimeout(timer);
  }, []);

  // Memoize renderIcon to avoid unnecessary re-renders
  const renderIcon = useCallback(
    (name, color) => <Icon name={name} size={26} color={color} />,
    [],
  );

  if (showSplash) {
    return <SplashScreen />;
  }

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
