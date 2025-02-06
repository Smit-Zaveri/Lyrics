import React, {useEffect, useState, useRef} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
  useColorScheme,
} from 'react-native';
import {Card} from 'react-native-elements';
import {colors} from '../theme/Theme';

const {width} = Dimensions.get('window');

const ItemGrid = ({navigation, title, data, redirect, layout}) => {
  const systemTheme = useColorScheme();
  const isDarkMode = systemTheme === 'dark';
  const themeColors = isDarkMode ? colors.dark : colors.light;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const isSingleLayout = layout === 'single';

  // Sorting data
  const sortedData = data.sort((a, b) => a.numbering - b.numbering);

  // Define item width dynamically
  const numColumns = isSingleLayout ? 1 : 3;
  const itemWidth = (width - (isSingleLayout ? 0 : 35)) / 3; // Adjust based on layout

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePress = item => {
    navigation.navigate(redirect, {
      collectionName: item.name,
      Tags: (() => {
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
      })(),
      title: item.displayName || item.name,
    });
  };

  const handleMorePress = () => {
    navigation.navigate('FullGrid', {
      data: sortedData,
      title,
      redirect,
    });
  };

  return (
    <Card
      containerStyle={[
        styles.cardStyle,
        {backgroundColor: themeColors.background},
      ]}>
      <View style={styles.cardHeadingStyle}>
        {isSingleLayout && (
          <Text
            style={[styles.cardHeadingTextStyle, {color: themeColors.text}]}>
            {title}
          </Text>
        )}
        {isSingleLayout && (
          <TouchableOpacity onPress={handleMorePress}>
            <Text style={[styles.moreLink, {color: themeColors.link}]}>
              MORE
            </Text>
          </TouchableOpacity>
        )}
      </View>
      <FlatList
        style={styles.flatListStyle}
        showsHorizontalScrollIndicator={false}
        horizontal={isSingleLayout}
        data={sortedData}
        renderItem={({item}) => (
          <Animated.View style={[styles.itemContainer, {opacity: fadeAnim}]}>
            <TouchableOpacity
              onPress={() => handlePress(item)}
              style={styles.touchableItem}>
              {item.picture ? (
                <Image
                  source={{uri: item.picture}}
                  style={[
                    styles.imageStyle,
                    {width: itemWidth, height: itemWidth},
                  ]}
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
                  <Text
                    style={[styles.placeholderText, {color: themeColors.text}]}>
                    {item.name.charAt(0)}
                  </Text>
                </View>
              )}
              <Text style={[styles.itemText, {color: themeColors.text}]}>
                {item.displayName || item.name}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        keyExtractor={(item, index) => index.toString()}
        numColumns={numColumns}
        contentContainerStyle={
          isSingleLayout ? styles.horizontalContent : styles.gridContent
        }
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  cardStyle: {
    paddingHorizontal: 12,
    margin: 0,
  },
  cardHeadingStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardHeadingTextStyle: {
    paddingLeft: 10,
    fontWeight: 'bold',
    fontSize: 18,
  },
  moreLink: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  flatListStyle: {
    marginHorizontal: -10,
  },
  itemContainer: {
    margin: 5,
    alignItems: 'center',
  },
  imageStyle: {
    marginBottom: 10,
    borderRadius: 100,
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
  },
  horizontalContent: {
    paddingHorizontal: 10,
  },
});

export default ItemGrid;
