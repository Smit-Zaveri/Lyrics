import {useRef, useEffect, useCallback} from 'react';
import {Animated, Easing} from 'react-native';

/**
 * Hook for entrance animations with fade and slide up effect
 * @param {number} delay - Delay before animation starts (for staggering)
 * @returns {Object} Animation values and style
 */
export const useEntranceAnimation = (delay = 0) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(15)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 250,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]).start();
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, opacity, translateY]);

  const animatedStyle = {
    opacity,
    transform: [{translateY}],
  };

  return {opacity, translateY, animatedStyle};
};

/**
 * Hook for press feedback animations with scale effect
 * @returns {Object} Animation handlers and style
 */
export const usePressAnimation = () => {
  const scale = useRef(new Animated.Value(1)).current;

  const onPressIn = useCallback(() => {
    Animated.timing(scale, {
      toValue: 0.96,
      duration: 80,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const onPressOut = useCallback(() => {
    Animated.spring(scale, {
      toValue: 1,
      bounciness: 8,
      speed: 12,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  const animatedStyle = {
    transform: [{scale}],
  };

  return {scale, onPressIn, onPressOut, animatedStyle};
};

/**
 * Hook for pulsing attention animation
 * @returns {Object} Animation value and style
 */
export const usePulseAnimation = () => {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.08,
          duration: 750,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();

    return () => pulse.stop();
  }, [scale]);

  const animatedStyle = {
    transform: [{scale}],
  };

  return {scale, animatedStyle};
};

/**
 * Hook for selection pop animation
 * @returns {Object} Animation trigger function and style
 */
export const useSelectionAnimation = () => {
  const scale = useRef(new Animated.Value(1)).current;

  const triggerSelection = useCallback(() => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.08,
        duration: 100,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        bounciness: 10,
        speed: 14,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scale]);

  const animatedStyle = {
    transform: [{scale}],
  };

  return {scale, triggerSelection, animatedStyle};
};
