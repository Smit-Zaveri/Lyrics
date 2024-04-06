import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, useColorScheme, StyleSheet, Animated } from 'react-native';
import { colors } from '../config/theme';

const SplashScreen = () => {
  const [alignsecond, setAlignsecond] = useState(false);
  const fadeInAnimation = useRef(new Animated.Value(0)).current;
  const colorScheme = useColorScheme(); 
  // const colorScheme = "dark"; 

  let activecolors = colors[colorScheme];

  useEffect(() => {
    let myTimeout = setTimeout(() => {
      setAlignsecond(true);
      fadeIn();
    }, 200);
    return () => clearTimeout(myTimeout);
  }, []);

  const fadeIn = () => {
    Animated.timing(fadeInAnimation, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View style={[styles.container, { backgroundColor: activecolors.background }]}>
      <Animated.Image
        source={{
          uri: 'https://raw.githubusercontent.com/AboutReact/sampleresource/master/react_logo.png',
        }}
        style={[styles.logo, { opacity: fadeInAnimation }]}
      />
      {!alignsecond ? null : (
        <Animated.View style={{ opacity: fadeInAnimation }}>
          <Text style={[styles.text, { color: activecolors.text }]}>
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
