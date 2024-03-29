import React, {useState, useEffect, useRef} from 'react';
import {View, Text, Image, StyleSheet, Animated} from 'react-native';

const SplashScreen = () => {
  const [align, setAlign] = useState('center');
  const [alignsecond, setAlignsecond] = useState(false);
  const fadeInAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    let myTimeout = setTimeout(() => {
      setAlign('flex-start');
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
    <View style={[styles.container, {justifyContent: align}]}>
      <Image
        source={{
          uri: 'https://raw.githubusercontent.com/AboutReact/sampleresource/master/react_logo.png',
        }}
        style={{marginLeft: 10, width: 140, height: 140}}
      />
      {!alignsecond ? null : (
        <Animated.View
          style={{
            margin: 15,
            opacity: fadeInAnimation,
          }}>
          <Text
            style={{
              color: '#114998',
              fontSize: 30,
              fontWeight: 'bold',
            }}>
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
    flexDirection: 'row',
    marginHorizontal: 40,
  },
});
