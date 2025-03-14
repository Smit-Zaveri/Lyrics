import React from 'react';
import { Animated, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ActionButtons = ({
  song,
  collections,
  fabAnim,
  themeColors,
  onBookmarkPress,
  onYoutubePress
}) => {
  const isBookmarked = collections.some(collection => 
    collection.songs?.some(s => s.id === song?.id)
  );

  return (
    <>
      {song.youtube && (
        <Animated.View 
          style={[
            styles.fabContainer,
            styles.youtubeFab,
            { opacity: fabAnim, transform: [{ scale: fabAnim }] }
          ]}
        >
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: themeColors.primary }]}
            onPress={onYoutubePress}
          >
            <MaterialCommunityIcons name="youtube" color="#fff" size={25} />
          </TouchableOpacity>
        </Animated.View>
      )}

      <Animated.View 
        style={[
          styles.fabContainer,
          { opacity: fabAnim, transform: [{ scale: fabAnim }] }
        ]}
      >
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: themeColors.primary }]}
          onPress={onBookmarkPress}
        >
          <MaterialCommunityIcons 
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'} 
            color="#fff" 
            size={25} 
          />
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  youtubeFab: {
    marginBottom: 80,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ActionButtons;