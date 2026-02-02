import React, {useContext, useMemo} from 'react';
import {Pressable, View, Text, StyleSheet} from 'react-native';
import {LanguageContext} from '../context/LanguageContext';

const ListItem = React.memo(
  ({item, themeColors, onItemPress, searchTerms, highlightFunction}) => {
    const {getString} = useContext(LanguageContext);
    const {numbering, order, title, content, publishDate, newFlag} = item;

    const isNew = useMemo(() => {
      if (!newFlag || !publishDate?.seconds) return false;
      const currentDate = new Date();
      const publishDateTime = new Date(publishDate.seconds * 1000);
      const timeDiff = Math.ceil((currentDate - publishDateTime) / (1000 * 60 * 60 * 24));
      return timeDiff >= 0 && timeDiff < 7;
    }, [newFlag, publishDate]);

    const displayNumber = useMemo(() => {
      return (
        item.displayNumbering?.toString() ||
        order?.toString() ||
        numbering?.toString() ||
        item.filteredIndex?.toString() ||
        '1'
      );
    }, [item.displayNumbering, order, numbering, item.filteredIndex]);

    const displayTitle = useMemo(() => {
      return Array.isArray(title) ? getString(title) : title;
    }, [title, getString]);

    const displayContent = useMemo(() => {
      if (Array.isArray(content)) {
        return getString(content).split('\n')[0];
      }
      if (content && typeof content === 'string') {
        return content.split('\n')[0];
      }
      if (
        (item.mediaUrl && item.mediaUrl.length > 0) ||
        (item.images && Array.isArray(item.images) && item.images.length > 0)
      ) {
        return '(media Context)';
      }
      return '';
    }, [content, getString, item.mediaUrl, item.images]);

    const highlightedTitle = useMemo(() => {
      return highlightFunction && searchTerms
        ? highlightFunction(displayTitle, searchTerms)
        : displayTitle;
    }, [highlightFunction, searchTerms, displayTitle]);

    const highlightedContent = useMemo(() => {
      return highlightFunction && searchTerms && displayContent
        ? highlightFunction(displayContent, searchTerms)
        : displayContent;
    }, [highlightFunction, searchTerms, displayContent]);

    return (
      <Pressable
        onPress={() => onItemPress(item)}
        style={({pressed}) => [
          styles.itemContainer,
        //   styles.elevated,
          pressed && styles.pressed,
          {
            backgroundColor: pressed
              ? themeColors.cardBackground + '30'
              : 'transparent',
            borderBottomColor: themeColors.textSecondary + '20',
          },
        ]}
        accessibilityLabel={`Song ${displayNumber}: ${displayTitle}`}
        accessibilityHint="Tap to view song details and lyrics"
        accessibilityRole="button">
        <View style={styles.leftContainer}>
          <View
            style={[
              styles.numberingContainer,
              {backgroundColor: themeColors.primary + '15'},
            ]}>
            <Text style={[styles.numberingText, {color: themeColors.primary}]}>
              {displayNumber}
            </Text>
          </View>
          <View style={styles.detailsContainer}>
            <Text
              style={[styles.title, {color: themeColors.text}]}
              numberOfLines={1}
              ellipsizeMode="tail">
              {highlightedTitle}
            </Text>
            {displayContent && (
              <Text
                style={[styles.content, {color: themeColors.textSecondary}]}
                numberOfLines={1}
                ellipsizeMode="tail">
                {highlightedContent}
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
    borderBottomWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingRight: 8,
  },
  numberingContainer: {
    width: 42,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderRadius: 10,
  },
  numberingText: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
  detailsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontWeight: '700',
    fontSize: 16,
    marginBottom: 2,
    lineHeight: 20,
  },
  content: {
    fontSize: 13,
    lineHeight: 18,
    opacity: 0.85,
    marginTop: 2,
  },
  newFlagContainer: {
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    minWidth: 44,
  },
  newFlagText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 11,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  pressed: {
    transform: [{scale: 0.996}],
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 1,
  },
});

export default ListItem;
