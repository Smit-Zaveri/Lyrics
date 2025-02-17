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

const ItemGrid = ({navigation, title, data, redirect, layout}) => {
  const { themeColors } = useContext(ThemeContext);
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

  const sortedData = useMemo(
    () => [...data].sort((a, b) => a.numbering - b.numbering),
    [data],
  );

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  const handlePress = useCallback(
    item => {
      navigation.navigate(redirect, {
        collectionName: item.name,
        Tags: getTagType(title),
        title: item.displayName || item.name,
      });
    },
    [navigation, redirect, title],
  );

  const handleMorePress = useCallback(() => {
    navigation.navigate('FullGrid', {
      data: sortedData,
      title,
      redirect,
    });
  }, [navigation, sortedData, title, redirect]);

  const renderItem = useCallback(
    ({item}) => (
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
                  {item.name.charAt(0)}
                </Text>
              </View>
            )}
            <Text 
              style={[styles.itemText, {color: themeColors.text}]}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.displayName || item.name}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    ),
    [fadeAnim, handlePress, itemWidth, themeColors],
  );

  return (
    <View style={styles.container}>
      {isSingleLayout && (
        <View style={styles.cardHeadingStyle}>
          <Text style={[styles.cardHeadingTextStyle, {color: themeColors.text}]}>
            {title}
          </Text>
          <TouchableOpacity onPress={handleMorePress}>
            <Text style={[styles.moreLink, {color: themeColors.link}]}>
              MORE
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        style={styles.flatListStyle}
        contentContainerStyle={isSingleLayout ? styles.horizontalContent : styles.gridContent}
        showsHorizontalScrollIndicator={false}
        horizontal={isSingleLayout}
        numColumns={isSingleLayout ? 1 : numColumns}
        data={sortedData}
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
        key={numColumns}
      />
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
});

ItemGrid.propTypes = {
  navigation: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      displayName: PropTypes.string,
      picture: PropTypes.string,
      numbering: PropTypes.number.isRequired,
    }),
  ).isRequired,
  redirect: PropTypes.string.isRequired,
  layout: PropTypes.oneOf(['single', 'grid']).isRequired,
};

export default React.memo(ItemGrid);
