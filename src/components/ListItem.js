import React from 'react';
import {Pressable, View, Text, StyleSheet} from 'react-native';

const ListItem = ({item, themeColors, onItemPress, searchTerms, highlightFunction}) => {
  const {numbering, order, title, content, publishDate, newFlag} = item;
  const currentDate = new Date();
  const publishDateTime = publishDate?.seconds
    ? new Date(publishDate.seconds * 1000)
    : null;

  const timeDiff = publishDateTime
    ? Math.ceil((currentDate - publishDateTime) / (1000 * 60 * 60 * 24))
    : null;

  const isNew = newFlag && timeDiff !== null && timeDiff >= 0 && timeDiff < 7;

  // Get display number safely handling null values
  const getDisplayNumber = () => {
    if (order !== null && order !== undefined) {
      return order.toString();
    } else if (numbering !== null && numbering !== undefined) {
      return numbering.toString();
    } else {
      return "-"; // Default value when both are null/undefined
    }
  };

  return (
    <Pressable
      onPress={() => onItemPress(item)}
      style={({pressed}) => [
        styles.itemContainer,
        {
          backgroundColor: pressed ? themeColors.surface : 'transparent', // Change press color based on theme
          borderBottomColor: themeColors.border, // Border color from theme
        },
      ]}>
      <View style={styles.leftContainer}>
        <View style={styles.numberingContainer}>
          <Text
            style={[
              styles.numberingText,
              {
                backgroundColor: themeColors.primary, // Numbering background color
                color: '#fff', // Text color
                borderColor: themeColors.primary, // Border color
              },
            ]}>
            {getDisplayNumber()}
          </Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text
            style={[styles.title, {color: themeColors.text}]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {highlightFunction && searchTerms
              ? highlightFunction(title, searchTerms)
              : title}
          </Text>
          <Text
            style={[styles.content, {color: themeColors.text}]}
            numberOfLines={1}
            ellipsizeMode="tail">
            {highlightFunction && searchTerms
              ? highlightFunction(content, searchTerms)
              : content.split('\n')[0]}
          </Text>
        </View>
      </View>

      {/* Display "NEW" on the right side if the item is new */}
      {isNew && (
        <View style={styles.newFlagContainer}>
          <Text style={[styles.newFlagText, {color: themeColors.primary}]}>
            NEW
          </Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    borderBottomWidth: 0.2,
    padding: 10,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Space between left and right
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Ensure left side takes up most of the space
  },
  numberingContainer: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberingText: {
    marginRight: 20,
    paddingLeft: 16,
    paddingHorizontal: 16,
    paddingTop: 10,
    flex: 1,
    fontWeight: 'bold',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    height: 40,
  },
  detailsContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  content: {
    fontSize: 14,
  },
  newFlagContainer: {
    backgroundColor: '#FFD700', // Yellow background for NEW
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  newFlagText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
});

export default ListItem;
