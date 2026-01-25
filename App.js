import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  createContext,
} from 'react';
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
import { SingerModeProvider } from './src/context/SingerModeContext';
import { checkAndRefreshIfDateChanged, updateLastOpenDate } from './src/config/dataService';

// Create bottom tab navigator
const Tab = createMaterialBottomTabNavigator();

// Create Theme Context
export const ThemeContext = createContext({
  themePreference: 'system',
  setThemePreference: () => {},
  currentTheme: 'light',
  themeColors: colors.light,
});

const AppContent = () => {
  // 1. All useState hooks
  const [showSplash, setShowSplash] = useState(true);
  const [themePreference, setThemePreference] = useState('system');
  const fadeAnim = useMemo(() => new Animated.Value(1), []);
  const {isLanguageSelected} = React.useContext(LanguageContext);

  // 2. useColorScheme hook (external store)
  const systemTheme = useColorScheme();

  // 3. useMemo hooks
  const currentTheme = useMemo(
    () => (themePreference === 'system' ? systemTheme : themePreference),
    [themePreference, systemTheme],
  );

  const themeColors = useMemo(
    () => colors[currentTheme === 'dark' ? 'dark' : 'light'],
    [currentTheme],
  );

  // Reference to track pending theme change
  const pendingThemeRef = React.useRef(null);

  const themeContextValue = useMemo(
    () => ({
      themePreference,
      setThemePreference: async newTheme => {
        // Skip if same theme or animation in progress
        if (newTheme === themePreference || pendingThemeRef.current) {
          return;
        }
        
        pendingThemeRef.current = newTheme;
        
        // Smooth fade out with easing
        Animated.timing(fadeAnim, {
          toValue: 0.7,
          duration: 200,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start(async () => {
          try {
            await AsyncStorage.setItem('themePreference', newTheme);
            setThemePreference(newTheme);
          } catch (error) {
            console.error('Error saving theme preference:', error);
          }
          
          // Small delay to allow React to render new theme colors
          setTimeout(() => {
            // Smooth fade back in with easing
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 280,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }).start(() => {
              pendingThemeRef.current = null;
            });
          }, 16); // One frame delay (~16ms at 60fps)
        });
      },
      currentTheme,
      themeColors,
    }),
    [themePreference, currentTheme, themeColors, fadeAnim],
  );

  // 4. useCallback hooks
  const renderIcon = useCallback(
    (name, color) => <Icon name={name} size={26} color={color} />,
    [],
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

  // Check if date has changed since last app open and refresh data if needed
  useEffect(() => {
    const checkDateAndRefresh = async () => {
      try {
        // Only check after splash screen is done to avoid affecting startup time
        if (!showSplash) {
          await checkAndRefreshIfDateChanged();
        }
      } catch (error) {
        console.error('Error checking date change:', error);
        // Update the date anyway to avoid repeated refresh attempts on error
        updateLastOpenDate();
      }
    };

    checkDateAndRefresh();
  }, [showSplash]);

  useEffect(() => {
    try {
      OneSignal.Debug.setLogLevel(LogLevel.Verbose);
      OneSignal.initialize('c9a87eea-dc14-4e8b-a750-b59978073d9c');
      OneSignal.Notifications.requestPermission(true);
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

  if (showSplash) {
    return <SplashScreen />;
  }

  // Show language selection modal if language not selected yet
  return (
    <ThemeContext.Provider value={themeContextValue}>
        <NavigationContainer>
          <StatusBar
            backgroundColor={themeColors.primary}
            barStyle={currentTheme === 'dark' ? 'light-content' : 'dark-content'}
          />
          <LanguageSelectionModal visible={!isLanguageSelected} />
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
