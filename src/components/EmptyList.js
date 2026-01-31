import React, {useContext, useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {ThemeContext} from '../../App';

const EmptyList = () => {
  const {themeColors} = useContext(ThemeContext);

  // Pulse animation for icon
  const pulseScale = useRef(new Animated.Value(1)).current;

  // Entrance animations
  const iconOpacity = useRef(new Animated.Value(0)).current;
  const iconScale = useRef(new Animated.Value(0.8)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(10)).current;
  const subtextOpacity = useRef(new Animated.Value(0)).current;
  const subtextTranslateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    // Icon entrance animation
    Animated.parallel([
      Animated.timing(iconOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(iconScale, {
        toValue: 1,
        bounciness: 10,
        speed: 12,
        useNativeDriver: true,
      }),
    ]).start();

    // Text entrance with delay
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }, 200);

    // Subtext entrance with more delay
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(subtextOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(subtextTranslateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }, 350);

    // Start pulse animation loop
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseScale, {
          toValue: 1.08,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseScale, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );

    // Start pulse after entrance completes
    const pulseTimer = setTimeout(() => pulse.start(), 400);

    return () => {
      pulse.stop();
      clearTimeout(pulseTimer);
    };
  }, [
    iconOpacity,
    iconScale,
    textOpacity,
    textTranslateY,
    subtextOpacity,
    subtextTranslateY,
    pulseScale,
  ]);

  return (
    <View
      style={styles.emptyListContainer}
      accessibilityLabel="No results found"
      accessibilityHint="The search returned no results. Try adjusting your filters or search criteria"
      accessibilityRole="alert">
      <Animated.View
        style={[
          styles.iconContainer,
          {
            backgroundColor: `${themeColors.primary}15`,
            opacity: iconOpacity,
            transform: [{scale: Animated.multiply(iconScale, pulseScale)}],
          },
        ]}
        accessibilityLabel="Empty list icon"
        accessibilityRole="image">
        <Icon name="playlist-remove" size={50} color={themeColors.primary} />
      </Animated.View>
      <Animated.Text
        style={[
          styles.emptyListText,
          {
            color: themeColors.text,
            opacity: textOpacity,
            transform: [{translateY: textTranslateY}],
          },
        ]}
        accessibilityLabel="No results found">
        No results found
      </Animated.Text>
      <Animated.Text
        style={[
          styles.emptyListSubText,
          {
            color: themeColors.placeholder,
            opacity: subtextOpacity,
            transform: [{translateY: subtextTranslateY}],
          },
        ]}
        accessibilityLabel="Try adjusting your filters or search criteria">
        Try adjusting your filters or search criteria
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyListText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyListSubText: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default EmptyList;
