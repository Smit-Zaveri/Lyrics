import React, {useContext} from 'react';
import {Pressable, View, Text, StyleSheet} from 'react-native';
import {LanguageContext} from '../context/LanguageContext';

const ListItem = React.memo(
  ({item, themeColors, onItemPress, searchTerms, highlightFunction}) => {
    const {getString} = useContext(LanguageContext);
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
      if (
        item.displayNumbering !== null &&
        item.displayNumbering !== undefined
      ) {
        return item.displayNumbering.toString();
      } else if (order !== null && order !== undefined) {
        return order.toString();
      } else if (numbering !== null && numbering !== undefined) {
        return numbering.toString();
      } else if (
        item.filteredIndex !== null &&
        item.filteredIndex !== undefined
      ) {
        return item.filteredIndex.toString();
      } else {
        return '1'; // Default to 1 instead of "-"
      }
    };

    // Get title text in the user's preferred language
    const getTitle = () => {
      if (Array.isArray(title)) {
        return getString(title);
      }
      return title;
    };

    // Get content text in the user's preferred language
    const getContent = () => {
      if (Array.isArray(content)) {
        const localizedContent = getString(content);
        return localizedContent.split('\n')[0];
      }
      if (content && typeof content === 'string') {
        return content.split('\n')[0];
      }
      // If no content, but has mediaUrl or images, show (media Context)
      if (
        (item.mediaUrl && item.mediaUrl.length > 0) ||
        (item.images && Array.isArray(item.images) && item.images.length > 0)
      ) {
        return '(media Context)';
      }
      return '';
    };

    const displayTitle = getTitle();
    const displayContent = getContent();

    return (
      <Pressable
        onPress={() => onItemPress(item)}
        style={({pressed}) => [
          styles.itemContainer,
          {
            backgroundColor: pressed ? themeColors.surface : 'transparent', // Change press color based on theme
            borderBottomColor:
              themeColors.border || themeColors.divder || '#444',
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
                ? highlightFunction(displayTitle, searchTerms)
                : displayTitle}
            </Text>
            <Text
              style={[styles.content, {color: themeColors.text}]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {highlightFunction && searchTerms
                ? highlightFunction(displayContent, searchTerms)
                : displayContent}
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
  },
  (prevProps, nextProps) => {
    return (
      prevProps.item.id === nextProps.item.id &&
      prevProps.item.numbering === nextProps.item.numbering &&
      prevProps.themeColors === nextProps.themeColors &&
      prevProps.searchTerms === nextProps.searchTerms
    );
  },
);

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
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  numberingText: {
    width: 40,
    height: 40,
    lineHeight: 40,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    borderRadius: 20,
    overflow: 'hidden',
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
