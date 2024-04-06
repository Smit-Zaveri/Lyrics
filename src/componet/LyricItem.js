// LyricItem.js
import React from 'react';
import { Pressable, View, Text, StyleSheet, PixelRatio } from 'react-native';

const phoneFontScale = PixelRatio.getFontScale();

const LyricItem = ({ item, artist, onPress }) => {
  const { id, numbering, title, content, publishDate, newFlag } = item;

  const currentDate = new Date();
  const publishDateTime = publishDate.toDate(); // assuming publishDate is a Firebase Timestamp
  const timeDiff = Math.ceil(
    (currentDate - publishDateTime) / (1000 * 60 * 60 * 24)
  );

  let numberingText =
    newFlag && timeDiff >= 0 && timeDiff < 7 ? 'NEW' : numbering;

  if (item.artist.toLowerCase() !== artist.toLowerCase()) {
    return null;
  }

  return (
    <Pressable
      onPress={onPress}
      style={{ marginHorizontal: 5 }}>
      <View
        key={id}
        style={styles.lyricContainer}>
        <View style={styles.numberingContainer}>
          <Text style={styles.numberingText}>{numberingText}</Text>
        </View>
        <View style={styles.contentContainer}>
          <Text style={styles.titleText}>{title}</Text>
          <Text style={styles.contentText} numberOfLines={1}>
            {content.split('\n')[0]}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  lyricContainer: {
    borderBottomColor: 'rgba(0,0,0,0.2)',
    borderBottomWidth: 1,
    padding: 10,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberingContainer: {
    height: 40,
  },
  numberingText: {
    marginRight: 20,
    borderStyle: 'dashed',
    borderColor: '#673ab7',
    borderWidth: 2,
    backgroundColor: '#673AB7',
    color: '#fff',
    paddingLeft: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    flex: 1,
    fontWeight: 'bold',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  contentContainer: {
    flex: 1,
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: 16 * phoneFontScale,
  },
  contentText: {
    fontSize: 14 * phoneFontScale,
  },
});

export default LyricItem;
