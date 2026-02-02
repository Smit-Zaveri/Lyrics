import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Image,
  useColorScheme,
  Platform,
  Dimensions,
} from 'react-native';
import {colors} from '../theme/theme';

// Get device dimensions for responsive design
const {width, height} = Dimensions.get('window');

// Import from package.json (for version)
const appVersion = require('../../package.json').version;

const SplashScreen = () => {
  const [alignSecond, setAlignSecond] = useState(false);
  const fadeInAnimation = useRef(new Animated.Value(0)).current;
  const fadeOutAnimation = useRef(new Animated.Value(1)).current;
  const scaleAnimation = useRef(new Animated.Value(0.8)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;

  // Get system color scheme directly
  const systemColorScheme = useColorScheme();
  const isDarkMode = systemColorScheme === 'dark';

  // Use direct theme colors based on system only
  const themeColors = isDarkMode ? colors.dark : colors.light;

  // Glassy background for footer
  const glassyBackground = isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(255, 255, 255, 0.25)';
  const glassyBorder = isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.15)';

  // Choose logo based on system dark/light mode
  const logoSource = isDarkMode
    ? require('../assets/logo.png')
    : require('../assets/logo_black.png');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setAlignSecond(true);
      fadeIn();
    }, 200);

    return () => clearTimeout(timeoutId);
  }, []);

  const fadeIn = () => {
    Animated.parallel([
      Animated.timing(fadeInAnimation, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotation, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const fadeOut = () => {
    Animated.timing(fadeOutAnimation, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  // Interpolate rotation for subtle logo animation
  const spin = logoRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['-10deg', '0deg'],
  });

  return (
    <View style={[styles.container, {backgroundColor: themeColors.background}]}>
      <View style={styles.backgroundCircle1} />
      <View
        style={[
          styles.backgroundCircle2,
          {backgroundColor: themeColors.primary},
        ]}
      />

      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: alignSecond ? fadeInAnimation : fadeOutAnimation,
            transform: [{scale: scaleAnimation}, {rotate: spin}],
          },
        ]}>
        <Image source={logoSource} style={styles.logo} resizeMode="contain" />
        <Text
          style={[
            styles.text,
            {
              color: themeColors.text,
              letterSpacing: 2, // Reduced letter spacing
            },
          ]}>
          Jain Dhun
        </Text>
      </Animated.View>

      <View style={[styles.footer, {backgroundColor: themeColors.surface}]}>
        <Text style={[styles.footerText, {color: themeColors.placeholder}]}>
          v{appVersion}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  backgroundCircle1: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    top: -width * 0.75,
    left: -width * 0.25,
    backgroundColor: 'rgba(103, 58, 183, 0.05)',
  },
  backgroundCircle2: {
    position: 'absolute',
    width: width,
    height: width,
    borderRadius: width * 0.5,
    bottom: -width * 0.5,
    right: -width * 0.25,
    opacity: 0.1,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  text: {
    marginTop: 20,
    fontSize: Math.min(width * 0.09, 40), // Increased font size
    fontWeight: 'bold',
    textAlign: 'center',
    // Add text shadow for better visibility
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.2,
        shadowRadius: 1,
      },
      android: {
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: {width: 0, height: 1},
        textShadowRadius: 1,
      },
    }),
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    width: '20%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 6},
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SplashScreen;
