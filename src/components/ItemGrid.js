import React, {useEffect, useRef, useMemo, useCallback, useContext} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
  useWindowDimensions,
} from 'react-native';
import {Card} from 'react-native-elements';
import PropTypes from 'prop-types';
import { ThemeContext } from '../../App';
import { LanguageContext } from '../context/LanguageContext';

const {width} = Dimensions.get('window');

const getTagType = title => {
  switch (title) {
    case 'Tags':
      return 'tirtankar';
    case 'Artists':
      return 'artists';
    case '24 Tirthenkar':
      return 'collections';
    default:
      return 'tags';
  }
};

const ItemGrid = ({
  navigation,
  title,
  data = [], // Default parameter instead of defaultProps
  redirect,
  layout,
  language // Add language prop
}) => {
  const { themeColors } = useContext(ThemeContext);
  const { getString } = useContext(LanguageContext); // Remove language from context
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isSingleLayout = layout === 'single';
  const windowDimensions = useWindowDimensions();

  const getNumColumns = () => {
    if (isSingleLayout) return 1;
    if (windowDimensions.width < 400) return 2;
    return 3;
  };

  const numColumns = getNumColumns();
  const spacing = 16;
  const totalPadding = spacing * (numColumns + 1);
  const itemWidth = (windowDimensions.width - totalPadding) / 3;

  const sortedData = useMemo(() => {
    // Ensure data is a valid array before sorting
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }
    return [...data].sort((a, b) => {
      // Handle cases where numbering could be undefined
      const numA = a.numbering !== undefined ? a.numbering : 0;
      const numB = b.numbering !== undefined ? b.numbering : 0;
      return numA - numB;
    });
  }, [data]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  // Updated getLocalizedDisplayName to be more responsive
  const getLocalizedDisplayName = useCallback((item) => {
    if (!item) return '';
    
    if (Array.isArray(item.displayName)) {
      const localizedName = getString(item.displayName);
      return localizedName || item.name || '';
    }
    
    return item.displayName || item.name || '';
  }, [getString]); // Remove language dependency since getString handles it

  // Update handlePress to use the latest localized name
  const handlePress = useCallback(
    item => {
      navigation.navigate(redirect, {
        collectionName: item.name,
        Tags: getTagType(title),
        title: getLocalizedDisplayName(item),
      });
    },
    [navigation, redirect, title, getLocalizedDisplayName], // Updated dependencies
  );

  const handleMorePress = useCallback(() => {
    navigation.navigate('FullGrid', {
      title: title,
      data: data,
      redirect: redirect // Add the redirect parameter
    });
  }, [navigation, title, data, redirect]); // Add redirect to dependencies

  // Add language as a dependency to force re-render when language changes
  const renderItem = useCallback(
    ({item}) => {
      // Move displayText calculation inside render to ensure fresh value
      const displayText = getLocalizedDisplayName(item);
      
      return (
        <View style={styles.itemWrapper}>
          <Animated.View style={[styles.itemContainer, {opacity: fadeAnim}]}>
            <TouchableOpacity onPress={() => handlePress(item)}>
              {item.picture ? (
                <Image
                  source={{uri: item.picture}}
                  style={[styles.imageStyle, {width: itemWidth, height: itemWidth}]}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={[
                    styles.placeholderImage,
                    {
                      backgroundColor: themeColors.surface,
                      width: itemWidth,
                      height: itemWidth,
                    },
                  ]}>
                  <Text style={[styles.placeholderText, {color: themeColors.text}]}>
                    {displayText.charAt(0)}
                  </Text>
                </View>
              )}
              <Text 
                style={[styles.itemText, {color: themeColors.text}]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {displayText}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      );
    },
    [fadeAnim, handlePress, itemWidth, themeColors, getLocalizedDisplayName],
  );

  // Get localized title if it's an array
  const localizedTitle = useMemo(() => {
    return Array.isArray(title) ? getString(title) : title;
  }, [title, getString, language]); // Add language as a dependency

  return (
    <View style={styles.container}>
      {isSingleLayout && (
        <View style={styles.cardHeadingStyle}>
          <Text style={[styles.cardHeadingTextStyle, {color: themeColors.text}]}>
            {Array.isArray(title) ? getString(title) : title}
          </Text>
          <TouchableOpacity onPress={handleMorePress}>
            <Text style={[styles.moreLink, {color: themeColors.link}]}>
              MORE
            </Text>
          </TouchableOpacity>
        </View>
      )}
      {sortedData.length > 0 ? (
        <FlatList
          style={styles.flatListStyle}
          contentContainerStyle={isSingleLayout ? styles.horizontalContent : styles.gridContent}
          showsHorizontalScrollIndicator={false}
          horizontal={isSingleLayout}
          numColumns={isSingleLayout ? 1 : numColumns}
          data={sortedData}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${index.toString()}-${language}`}
          key={`${numColumns}-${language}`}
          extraData={language}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, {color: themeColors.text}]}>
            No items available
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  itemWrapper: {
    flex: 1,
    padding: 8,
  },
  itemContainer: {
    alignItems: 'center',
  },
  cardHeadingStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  cardHeadingTextStyle: {
    fontWeight: 'bold',
    fontSize: 18,
  },
  moreLink: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  flatListStyle: {
    flex: 1,
  },
  imageStyle: {
    borderRadius: 100,
    marginBottom: 8,
    backgroundColor:'#E0E0E0'
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 100,
  },
  placeholderText: {
    fontWeight: '200',
    fontSize: 24,
  },
  itemText: {
    fontWeight: '200',
    textAlign: 'center',
    marginTop: 4,
  },
  horizontalContent: {
    paddingHorizontal: 8,
  },
  gridContent: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

ItemGrid.propTypes = {
  navigation: PropTypes.object.isRequired,
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]).isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      displayName: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string)
      ]),
      picture: PropTypes.string,
      numbering: PropTypes.number,
    }),
  ),
  redirect: PropTypes.string.isRequired,
  layout: PropTypes.oneOf(['single', 'grid']).isRequired,
  language: PropTypes.string.isRequired, // Add language prop type
};

export default React.memo(ItemGrid, (prevProps, nextProps) => {
  // Custom comparison function to ensure re-render on language changes
  return (
    prevProps.title === nextProps.title &&
    prevProps.data === nextProps.data &&
    prevProps.layout === nextProps.layout &&
    prevProps.redirect === nextProps.redirect &&
    prevProps.language === nextProps.language // Add language comparison
  );
});
