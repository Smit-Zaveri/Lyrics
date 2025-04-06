import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';

const RelatedSongs = ({ relatedSongs, themeColors, onSongPress, getLocalizedTitle, getDisplayNumber }) => {
  const [randomizedSongs, setRandomizedSongs] = useState([]);
  
  // Randomize related songs on component mount or when relatedSongs changes
  useEffect(() => {
    if (!relatedSongs || relatedSongs.length === 0) {
      setRandomizedSongs([]);
      return;
    }
    
    // Create a copy of the array to avoid mutating the original
    const songsToRandomize = [...relatedSongs];
    
    // Fisher-Yates shuffle algorithm for true randomization
    for (let i = songsToRandomize.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [songsToRandomize[i], songsToRandomize[j]] = [songsToRandomize[j], songsToRandomize[i]];
    }
    
    // Use all random songs, but no more than 5
    setRandomizedSongs(songsToRandomize.slice(0, 5));
  }, [relatedSongs]);

  // Function to truncate title to 3 words
  const truncateTitle = (title) => {
    if (!title) return '';
    const words = title.split(' ');
    if (words.length <= 3) return title;
    return words.slice(0, 3).join(' ') + '...';
  };

  if (!randomizedSongs || randomizedSongs.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.cardBackground || themeColors.background }]}>
      <Text style={[styles.heading, { color: themeColors.text }]}>
        Suggestion Songs
      </Text>
      
      <View style={styles.tagsContainer}>
        {randomizedSongs.map(song => (
          <TouchableOpacity
            key={song.id}
            style={[
              styles.tagBubble,
              { 
                backgroundColor: themeColors.background,
                borderColor: themeColors.border || themeColors.primary + '40' 
              }
            ]}
            activeOpacity={0.7}
            onPress={() => onSongPress(song)}
          >
            <View style={styles.tagContent}>
              <View 
                style={[
                  styles.circleNumber, 
                  { backgroundColor: themeColors.primary }
                ]}
              >
                <Text style={styles.circleNumberText}>
                  {getDisplayNumber(song)}
                </Text>
              </View>
              <Text 
                style={[styles.songTitle, { color: themeColors.text }]}
                numberOfLines={1}
              >
                {truncateTitle(getLocalizedTitle(song))}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

// Get device width for responsive sizing
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    paddingVertical: 15,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 10,
    paddingHorizontal: 20
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    letterSpacing: 0.1
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start'
  },
  tagBubble: {
    borderRadius: 40,
    paddingVertical: 4,
    paddingHorizontal: 4,
    paddingRight: 10,
    marginRight: 5,
    marginBottom: 5,
    borderWidth: 1,
    backgroundColor: 'transparent'
  },
  tagContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  circleNumber: {
    width: 25,
    height: 25,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  circleNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: 16
  },
  songTitle: {
    fontSize: 14,
    fontWeight: '500',
    maxWidth: width * 0.3
  }
});

export default RelatedSongs;