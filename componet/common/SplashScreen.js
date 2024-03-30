import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Animated } from 'react-native';

const SplashScreen = () => {
  const [alignsecond, setAlignsecond] = useState(false);
  const fadeInAnimation = useRef(new Animated.Value(0)).current;

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
    <View style={styles.container}>
      <Animated.Image
        source={{
          uri: 'https://raw.githubusercontent.com/AboutReact/sampleresource/master/react_logo.png',
        }}
        style={[styles.logo, { opacity: fadeInAnimation }]}
      />
      {!alignsecond ? null : (
        <Animated.View style={{ opacity: fadeInAnimation }}>
          <Text style={styles.text}>
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
    color: '#114998',
    fontSize: 30,
    fontWeight: 'bold',
  },
});
