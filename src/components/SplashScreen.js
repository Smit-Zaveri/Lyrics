import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  Animated,
  StyleSheet,
  Image,
} from 'react-native';
import { ThemeContext } from '../../App';

const SplashScreen = () => {
  const [alignSecond, setAlignSecond] = useState(false);
  const fadeInAnimation = useRef(new Animated.Value(0)).current;
  const fadeOutAnimation = useRef(new Animated.Value(1)).current;
  const { currentTheme, themeColors } = useContext(ThemeContext);

  // Determine logo source based on the current theme
  const logoSource =
    currentTheme === 'dark'
      ? require('../assets/logo_black.png')
      : require('../assets/logo_black.png');

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setAlignSecond(true);
      fadeIn();
    }, 200);

    return () => clearTimeout(timeoutId);
  }, []);

  const fadeIn = () => {
    Animated.timing(fadeInAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  const fadeOut = () => {
    Animated.timing(fadeOutAnimation, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: alignSecond ? fadeInAnimation : fadeOutAnimation,
          },
        ]}>
        <Image source={logoSource} style={styles.logo} resizeMode="contain" />
        <Text style={[styles.text, { color: themeColors.text }]}>
          Jain Dhun
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  },
  text: {
    marginTop: 20,
    fontSize: 30,
    fontWeight: 'bold',
  },
});

export default SplashScreen;
