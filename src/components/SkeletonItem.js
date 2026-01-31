import React, {useRef, useEffect} from 'react';
import {View, StyleSheet, Animated} from 'react-native';

const SkeletonItem = ({themeColors, index = 0}) => {
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

  // Vary widths slightly for realism
  const titleWidth = index % 3 === 0 ? '72%' : index % 3 === 1 ? '58%' : '82%';
  const contentWidth = index % 2 === 0 ? '42%' : '55%';

  return (
    <View
      style={[
        styles.container,
        {borderBottomColor: themeColors.border || 'rgba(0,0,0,0.05)'},
      ]}>
      <View style={styles.leftContainer}>
        {/* Numbering skeleton */}
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

        <View style={styles.detailsContainer}>
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

          {/* Content skeleton */}
          <View
            style={[
              styles.contentSkeleton,
              {backgroundColor: colors.base, width: contentWidth},
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
    borderBottomWidth: 0.5,
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 12,
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
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleSkeleton: {
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  contentSkeleton: {
    height: 12,
    borderRadius: 3,
    overflow: 'hidden',
  },
});

export default SkeletonItem;
