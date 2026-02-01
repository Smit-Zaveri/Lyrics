import React, { useState, useEffect, useCallback, useMemo, createContext } from 'react';
import {StatusBar, useColorScheme, Animated, Easing} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SplashScreen from './src/components/SplashScreen';
import HomeStack from './src/screen/home/HomeStack';
import Profile from './src/screen/profile/Profile';
import Category from './src/screen/category/Category';
import {LogLevel, OneSignal} from 'react-native-onesignal';
import {colors} from './src/theme/theme';
import {LanguageProvider, LanguageContext} from './src/context/LanguageContext';
import LanguageSelectionModal from './src/components/LanguageSelectionModal';
import {FontSizeProvider} from './src/context/FontSizeContext';
import {SingerModeProvider} from './src/context/SingerModeContext';
import {
  checkAndRefreshIfDateChanged,
  updateLastOpenDate,
} from './src/config/dataService';

// Create bottom tab navigator for main app navigation
const Tab = createMaterialBottomTabNavigator();

// Theme context to manage app-wide theme preferences and colors
export const ThemeContext = createContext({
  themePreference: 'system',
  setThemePreference: () => {},
  currentTheme: 'light',
  themeColors: colors.light,
});

// Main app content component handling theme, navigation, and initial setup
const AppContent = () => {
  // State for splash screen visibility
  const [showSplash, setShowSplash] = useState(true);
  // State for user's theme preference (system, light, dark, highContrast)
  const [themePreference, setThemePreference] = useState('system');
  // Animation value for theme transition fade effect
  const fadeAnim = useMemo(() => new Animated.Value(1), []);
  // Access language selection status from context
  const {isLanguageSelected} = React.useContext(LanguageContext);

  // Get system theme preference
  const systemTheme = useColorScheme();

  // Determine current theme based on user preference or system setting
  const currentTheme = useMemo(
    () => (themePreference === 'system' ? systemTheme : themePreference),
    [themePreference, systemTheme],
  );

  // Get color palette based on current theme
  const themeColors = useMemo(() => {
    if (currentTheme === 'dark') return colors.dark;
    if (currentTheme === 'highContrast') return colors.highContrast;
    return colors.light;
  }, [currentTheme]);

  // Reference to track pending theme changes to prevent concurrent animations
  const pendingThemeRef = React.useRef(null);

  // Memoized theme context value with theme switching logic
  const themeContextValue = useMemo(
    () => ({
      themePreference,
      setThemePreference: async newTheme => {
        // Prevent theme change if same or animation in progress
        if (newTheme === themePreference || pendingThemeRef.current) {
          return;
        }

        pendingThemeRef.current = newTheme;

        // Fade out animation for smooth theme transition
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start(async () => {
          try {
            // Persist theme preference to storage
            await AsyncStorage.setItem('themePreference', newTheme);
            setThemePreference(newTheme);
          } catch (error) {
            console.error('Error saving theme preference:', error);
          }

          // Brief delay to allow React to update theme colors
          setTimeout(() => {
            // Fade back in animation
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 280,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }).start(() => {
              pendingThemeRef.current = null;
            });
          }, 16); // One frame delay for smooth rendering
        });
      },
      currentTheme,
      themeColors,
    }),
    [themePreference, currentTheme, themeColors, fadeAnim],
  );

  // Memoized function to render tab icons
  const renderIcon = useCallback(
    (name, color) => <Icon name={name} size={26} color={color} />,
    [],
  );

  // Load saved theme preference and hide splash after delay
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

    // Hide splash screen after 2 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Check for date change and refresh data if needed
  useEffect(() => {
    const checkDateAndRefresh = async () => {
      try {
        // Only run after splash to avoid impacting startup performance
        if (!showSplash) {
          await checkAndRefreshIfDateChanged();
        }
      } catch (error) {
        console.error('Error checking date change:', error);
        // Update date to prevent repeated refresh attempts
        updateLastOpenDate();
      }
    };

    checkDateAndRefresh();
  }, [showSplash]);

  // Initialize OneSignal for push notifications
  useEffect(() => {
    try {
      OneSignal.Debug.setLogLevel(LogLevel.Verbose);
      OneSignal.initialize('c9a87eea-dc14-4e8b-a750-b59978073d9c');
      OneSignal.Notifications.requestPermission(true);
      // Handle notification click events
      const handleNotificationClick = event => {
        console.log('OneSignal: notification clicked:', event);
      };
      OneSignal.Notifications.addEventListener(
        'click',
        handleNotificationClick,
      );
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

  // Show splash screen during initial load
  if (showSplash) {
    return <SplashScreen />;
  }

  // Main app UI with navigation and theme provider
  return (
    <ThemeContext.Provider value={themeContextValue}>
      <NavigationContainer>
        <StatusBar
          backgroundColor={themeColors.primary}
          barStyle={currentTheme === 'dark' ? 'light-content' : 'dark-content'}
        />
        {/* Language selection modal for first-time users */}
        <LanguageSelectionModal visible={!isLanguageSelected} />
        {/* Animated container for smooth theme transitions */}
        <Animated.View style={{flex: 1, opacity: fadeAnim}}>
          <Tab.Navigator
            barStyle={{backgroundColor: themeColors.surface}}
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

// Root App component wrapping content with necessary providers
const App = () => {
  return (
    <SingerModeProvider>
      <FontSizeProvider>
        <LanguageProvider>
          <AppContent />
        </LanguageProvider>
      </FontSizeProvider>
    </SingerModeProvider>
  );
};

export default App;
