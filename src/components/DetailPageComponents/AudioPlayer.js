import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Slider from '@react-native-community/slider';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Sound from 'react-native-sound';

const AudioPlayer = ({
  song,
  sound,
  isPlaying,
  isLoading,
  audioError,
  progress,
  duration,
  seekValue,
  themeColors,
  onTogglePlayback,
  onSeekValueChange,
  onSeekComplete
}) => {
  // No audio available
  if (!song?.audio) return null;

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.audioContainer}>
      {isLoading ? (
        <ActivityIndicator 
          testID="loading-indicator"
          size="large" 
          color={themeColors.primary} 
        />
      ) : (
        <TouchableOpacity
          testID="play-button"
          style={[styles.playButton, { backgroundColor: themeColors.primary }]}
          onPress={onTogglePlayback}
          accessibilityLabel={isPlaying ? 'Pause audio' : 'Play audio'}
          accessibilityHint="Control playback of the song audio"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons
            name={isPlaying ? 'pause' : 'play'}
            size={30}
            color="#fff"
          />
        </TouchableOpacity>
      )}
      
      {audioError && (
        <Text style={styles.errorText}>{audioError}</Text>
      )}
      
      {sound && (
        <View style={styles.sliderContainer}>
          <Text style={[styles.timeText, { color: themeColors.text }]}>
            {formatTime(progress)}
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={seekValue}
            onValueChange={onSeekValueChange}
            onSlidingComplete={onSeekComplete}
            minimumTrackTintColor={themeColors.primary}
            maximumTrackTintColor={themeColors.border}
            accessibilityLabel="Audio progress slider"
            accessibilityHint="Seek to a different position in the audio"
          />
          <Text style={[styles.timeText, { color: themeColors.text }]}>
            {formatTime(duration)}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  audioContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  slider: {
    flex: 1,
  },
  timeText: {
    fontSize: 14,
  },
  errorText: {
    color: 'red',
    marginTop: 5,
    fontSize: 12,
  },
});

export default AudioPlayer;