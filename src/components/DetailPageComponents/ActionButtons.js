import React from 'react';
import {Animated, TouchableOpacity, StyleSheet} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';

const ActionButtons = ({
  song,
  collections,
  fabAnim,
  editFabAnim = fabAnim, // Default to main fabAnim if not provided
  deleteFabAnim = fabAnim, // Default to main fabAnim if not provided
  themeColors,
  onBookmarkPress,
  onYoutubePress,
  onEditPress,
  onDeletePress,
  showEditDelete = false,
}) => {
  const isBookmarked = collections.some(collection =>
    collection.songs?.some(s => s.id === song?.id),
  );

  // Calculate positions based on what buttons are shown
  const getButtonPosition = buttonIndex => {
    const BASE_POSITION = 16; // Bottom position for first button
    const SPACING = 70; // Consistent spacing between buttons
    return BASE_POSITION + buttonIndex * SPACING;
  };

  // Determine FAB indices (for positioning)
  let bookmarkIndex = 0;
  let youtubeIndex = song.youtube ? 1 : null;
  let editIndex = showEditDelete ? (youtubeIndex !== null ? 2 : 1) : null;
  let deleteIndex = showEditDelete ? editIndex + 1 : null;

  // Create animation style with consistent behavior - add timing offset for staggered effect
  const createAnimatedStyle = (anim, delay = 0) => ({
    opacity: anim,
    transform: [{scale: anim}],
  });

  return (
    <>
      {/* Base FAB (Bookmark) */}
      <Animated.View
        style={[
          styles.fabContainer,
          {bottom: getButtonPosition(bookmarkIndex)},
          createAnimatedStyle(fabAnim),
        ]}>
        <TouchableOpacity
          style={[styles.fab, {backgroundColor: themeColors.primary}]}
          onPress={onBookmarkPress}
          accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Bookmark song'}
          accessibilityHint={isBookmarked ? 'Remove this song from your collections' : 'Add this song to your collections'}
          accessibilityRole="button">
          <MaterialCommunityIcons
            name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
            color="#fff"
            size={25}
          />
        </TouchableOpacity>
      </Animated.View>

      {/* YouTube FAB */}
      {song.youtube && (
        <Animated.View
          style={[
            styles.fabContainer,
            {bottom: getButtonPosition(youtubeIndex)},
            createAnimatedStyle(fabAnim),
          ]}>
          <TouchableOpacity
            style={[styles.fab, {backgroundColor: themeColors.primary}]}
            onPress={onYoutubePress}
            accessibilityLabel="Open on YouTube"
            accessibilityHint="Watch the music video for this song"
            accessibilityRole="button">
            <MaterialCommunityIcons name="youtube" color="#fff" size={25} />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Edit & Delete FABs */}
      {showEditDelete && (
        <>
          <Animated.View
            style={[
              styles.fabContainer,
              {bottom: getButtonPosition(editIndex)},
              createAnimatedStyle(editFabAnim),
            ]}>
            <TouchableOpacity
              style={[styles.fab, {backgroundColor: '#4CAF50'}]}
              onPress={onEditPress}
              accessibilityLabel="Edit song"
              accessibilityHint="Modify the details of this song"
              accessibilityRole="button">
              <Icon name="edit" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>

          <Animated.View
            style={[
              styles.fabContainer,
              {bottom: getButtonPosition(deleteIndex)},
              createAnimatedStyle(deleteFabAnim),
            ]}>
            <TouchableOpacity
              style={[styles.fab, {backgroundColor: '#FF5252'}]}
              onPress={onDeletePress}
              accessibilityLabel="Delete song"
              accessibilityHint="Permanently remove this song"
              accessibilityRole="button">
              <Icon name="delete" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </Animated.View>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  fabContainer: {
    position: 'absolute',
    right: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    zIndex: 1000,
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
