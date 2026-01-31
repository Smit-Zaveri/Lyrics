import React, {useRef, useEffect} from 'react';
import {View, StyleSheet, Animated, Dimensions} from 'react-native';

const {width} = Dimensions.get('window');

const SkeletonGridItem = ({itemWidth, themeColors}) => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const colors = {
    base: themeColors.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
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

  return (
    <View style={styles.itemWrapper}>
      <View style={styles.itemContainer}>
        {/* Circular image skeleton */}
        <View
          style={[
            styles.imageSkeleton,
            {
              width: itemWidth,
              height: itemWidth,
              backgroundColor: colors.base,
            },
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
        {/* Text skeleton */}
        <View
          style={[
            styles.textSkeleton,
            {backgroundColor: colors.base, width: itemWidth * 0.8},
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
      </View>
    </View>
  );
};

const SkeletonGridSection = ({themeColors}) => {
  const spacing = 16;
  const numColumns = 1; // Single layout like ItemGrid
  const totalPadding = spacing * (numColumns + 1);
  const itemWidth = (width - totalPadding) / 3;

  const shimmerAnim = useRef(new Animated.Value(0)).current;

  const colors = {
    base: themeColors.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
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

  return (
    <View style={styles.sectionContainer}>
      {/* Header skeleton */}
      <View style={styles.cardHeadingStyle}>
        <View style={[styles.titleSkeleton, {backgroundColor: colors.base}]}>
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
        <View style={[styles.moreLinkSkeleton, {backgroundColor: colors.base}]}>
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
      {/* Horizontal items */}
      <View style={styles.horizontalContent}>
        {[0, 1, 2, 3, 4].map(i => (
          <SkeletonGridItem
            key={`skeleton-grid-${i}`}
            itemWidth={itemWidth}
            themeColors={themeColors}
          />
        ))}
      </View>
    </View>
  );
};

const CategorySkeleton = ({themeColors}) => {
  return (
    <View style={styles.container}>
      <SkeletonGridSection themeColors={themeColors} />
      <SkeletonGridSection themeColors={themeColors} />
      <SkeletonGridSection themeColors={themeColors} />
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
    backgroundColor: 'transparent',
  },
  sectionContainer: {
    marginBottom: 16,
  },
  cardHeadingStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 4,
  },
  titleSkeleton: {
    width: 120,
    height: 20,
    borderRadius: 4,
    overflow: 'hidden',
  },
  moreLinkSkeleton: {
    width: 50,
    height: 16,
    borderRadius: 4,
    overflow: 'hidden',
  },
  horizontalContent: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  itemWrapper: {
    padding: 8,
  },
  itemContainer: {
    alignItems: 'center',
  },
  imageSkeleton: {
    borderRadius: 100,
    marginBottom: 6,
    overflow: 'hidden',
  },
  textSkeleton: {
    height: 14,
    borderRadius: 3,
    overflow: 'hidden',
  },
});

export default CategorySkeleton;
