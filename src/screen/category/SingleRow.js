import React, { useEffect, useRef } from 'react';
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
import { Card } from 'react-native-elements';
import { colors } from '../../theme/Theme'; // Assuming you have a theme file with colors

const { width } = Dimensions.get('window');

const SingleRow = ({ navigation, title, data, redirect }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Detect system theme
  const systemTheme = useColorScheme();
  const isDarkMode = systemTheme === 'dark';
  const themeColors = isDarkMode ? colors.dark : colors.light;

  useEffect(() => {
    animateFadeIn();
  }, []);

  const animateFadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  // Sort data based on a numerical property, e.g., 'numbering'
  const sortedData = data.sort((a, b) => a.numbering - b.numbering);

  const renderItem = ({ item }) => (
    <Animated.View style={[styles.itemContainer, { opacity: fadeAnim }]}>
      <TouchableOpacity
        onPress={() => {
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
            title: item.displayName ? item.displayName : item.name,
          });
        }}
        style={styles.touchableItem}
      >
        {item.picture ? (
          <Image source={{ uri: item.picture }} style={styles.imageStyle} />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: themeColors.surface }]}>
            <Text style={[styles.placeholderText, { color: themeColors.text }]}>
              {item.name.charAt(0)}
            </Text>
          </View>
        )}
        <Text style={[styles.itemText, { color: themeColors.text }]}>
          {item.displayName ? item.displayName : item.name}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <Card containerStyle={[styles.cardStyle, { backgroundColor: themeColors.background, borderColor: themeColors.background }]}>
      <View style={styles.cardHeadingStyle}>
        <Text style={[styles.cardHeadingTextStyle, { color: themeColors.text }]}>{title}</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('Double', {
              data: sortedData,
              title: title,
              redirect: redirect,
            })
          }
        >
          <Text style={[styles.moreLink, { color: themeColors.link }]}>MORE</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        style={styles.flatListStyle}
        showsHorizontalScrollIndicator={false}
        horizontal
        data={sortedData}
        renderItem={renderItem}
        keyExtractor={(_item, index) => index.toString()}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  cardStyle: {
    paddingHorizontal: 12,
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
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
    width: width / 3 - 20, // Adjust width to fit 3 items per row
    margin: 5,
  },
  touchableItem: {
    alignItems: 'center',
  },
  imageStyle: {
    width: width / 3 - 20, // Adjust width to fit 3 items per row
    height: width / 3 - 20, // Maintain aspect ratio
    marginBottom: 10,
    borderRadius: 100,
  },
  placeholderImage: {
    width: width / 3 - 20, // Adjust width to fit 3 items per row
    height: width / 3 - 20, // Maintain aspect ratio
    marginBottom: 10,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontWeight: '200',
  },
  itemText: {
    fontWeight: '200',
    textAlign: 'center',
  },
});

export default SingleRow;
