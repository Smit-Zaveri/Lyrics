import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Image, useColorScheme } from 'react-native';
import { colors } from '../theme/theme';

const SplashScreen = () => {
  const [alignSecond, setAlignSecond] = useState(false);
  const fadeInAnimation = useRef(new Animated.Value(0)).current;
  const fadeOutAnimation = useRef(new Animated.Value(1)).current;
  const systemTheme = useColorScheme();

  // Determine logo source based on the current theme
  const logoSource = systemTheme === 'dark' 
    ? require('../assets/logo.png') 
    : require('../assets/logo_black.png');

  // Get active colors based on the current theme
  const activeColors = colors[systemTheme];

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
    }).start(({ finished }) => {
      if (finished) {
        setTimeout(() => {
          fadeOut();
        }, 2000); // Delay before fading out
      }
    });
  };

  const fadeOut = () => {
    Animated.timing(fadeOutAnimation, {
      toValue: 0,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={[styles.container, { backgroundColor: activeColors.background }]}>
      <Animated.Image
        source={logoSource}
        style={[styles.logo, { opacity: fadeInAnimation }]}
      />
      {alignSecond && (
        <Animated.View style={{ opacity: fadeOutAnimation }}>
          <Text style={[styles.text, { color: activeColors.text }]}>
            Jain Dhun
          </Text>
        </Animated.View>
      )}
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
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