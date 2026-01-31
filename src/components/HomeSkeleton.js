import React, {useRef, useEffect} from 'react';
import {View, StyleSheet, Animated} from 'react-native';

const SkeletonHomeItem = ({themeColors, isFirst, index = 0}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const colors = {
    base: themeColors.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
    numbering: themeColors.isDark
      ? 'rgba(255,255,255,0.15)'
      : `${themeColors.primary}18`,
    shimmer: themeColors.isDark
      ? 'rgba(255,255,255,0.12)'
      : 'rgba(255,255,255,0.6)',
  };

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const translateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-150, 350],
  });

  const titleWidth = index % 3 === 0 ? '65%' : index % 3 === 1 ? '50%' : '75%';

  return (
    <View
      style={[
        styles.itemContainer,
        isFirst && styles.firstItem,
        {
          backgroundColor: themeColors.surface,
        },
      ]}>
      {/* Numbering container skeleton */}
      <View
        style={[
          styles.numberingContainer,
          {backgroundColor: colors.numbering},
        ]}>
        <Animated.View
          style={[
            styles.shimmer,
            {
              backgroundColor: colors.shimmer,
              transform: [{translateX}],
            },
          ]}
        />
      </View>

      {/* Title skeleton */}
      <View
        style={[
          styles.titleSkeleton,
          {backgroundColor: colors.base, width: titleWidth},
        ]}>
        <Animated.View
          style={[
            styles.shimmer,
            {
              backgroundColor: colors.shimmer,
              transform: [{translateX}],
            },
          ]}
        />
      </View>

      {/* Chevron placeholder */}
      <View style={[styles.chevronSkeleton, {backgroundColor: colors.base}]}>
        <Animated.View
          style={[
            styles.shimmer,
            {
              backgroundColor: colors.shimmer,
              transform: [{translateX}],
            },
          ]}
        />
      </View>
    </View>
  );
};

const HomeSkeleton = ({themeColors}) => {
  return (
    <View style={styles.container}>
      {[0, 1, 2, 3, 4].map((i, index) => (
        <SkeletonHomeItem
          key={`skeleton-home-${i}`}
          themeColors={themeColors}
          isFirst={index === 0}
          index={index}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 100,
    opacity: 0.6,
  },
  container: {
    flex: 1,
    paddingTop: 8,
  },
  itemContainer: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    padding: 16,
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
  },
  firstItem: {
    marginTop: 12,
  },
  numberingContainer: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderRadius: 12,
    overflow: 'hidden',
  },
  titleSkeleton: {
    flex: 1,
    height: 16,
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  chevronSkeleton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
});

export default HomeSkeleton;
