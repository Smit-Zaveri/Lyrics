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
            backgroundColor: pressed ? themeColors.cardBackground + '40' : 'transparent',
            borderBottomColor: themeColors.border || 'rgba(0,0,0,0.06)',
          },
        ]}
        accessibilityLabel={`Song ${getDisplayNumber()}: ${displayTitle}`}
        accessibilityHint="Tap to view song details and lyrics"
        accessibilityRole="button">
        <View style={styles.leftContainer}>
          <View
            style={[
              styles.numberingContainer,
              {backgroundColor: themeColors.primary + '15'},
            ]}>
            <Text
              style={[
                styles.numberingText,
                {color: themeColors.primary},
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
            {displayContent && (
              <Text
                style={[styles.content, {color: themeColors.textSecondary}]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {highlightFunction && searchTerms
                  ? highlightFunction(displayContent, searchTerms)
                  : displayContent}
              </Text>
            )}
          </View>
        </View>

        {/* Display "NEW" on the right side if the item is new */}
        {isNew && (
          <View
            style={[
              styles.newFlagContainer,
              {backgroundColor: themeColors.primary},
            ]}>
            <Text style={styles.newFlagText}>NEW</Text>
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
  },
  numberingText: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
    lineHeight: 22,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  newFlagContainer: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  newFlagText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.5,
  },
});

export default ListItem;
