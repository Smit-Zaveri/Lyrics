import React, { useEffect, useRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Card } from 'react-native-elements';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

const SingleRow = ({ navigation, title, data, redirect, collection }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

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

  return (
    <Card containerStyle={styles.cardStyle}>
      <View style={styles.cardHeadingStyle}>
        <Text style={styles.cardHeadingTextStyle}>{title}</Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate('Double', {
              data: data,
              title: title,
              redirect: redirect,
            })
          }
        >
          <Text style={styles.moreLink}>MORE</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        style={styles.flatListStyle}
        showsHorizontalScrollIndicator={false}
        horizontal
        data={data}
        renderItem={({ item }) => (
          <Animated.View style={[styles.itemContainer, { opacity: fadeAnim }]}>
            <TouchableOpacity
              onPress={() => {
                navigation.navigate(redirect, {
                  artist: item.name,
                  bhagwan: item.name,
                  bhagwanDisplay: item.displayName,
                  collection: item.name,
                  collectionDisplayName: item.displayName,
                });
              }}
              style={styles.touchableItem}
            >
              {item.picture ? (
                <Image
                  source={{ uri: item.picture }}
                  style={styles.imageStyle}
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Text style={styles.placeholderText}>
                    {item.name.charAt(0)}
                  </Text>
                </View>
              )}
              <Text style={styles.itemText}>
                {item.displayName ? item.displayName : item.name}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        )}
        keyExtractor={(item, index) => index.toString()}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  cardStyle: {
    paddingHorizontal: 12,
    borderColor: '#fff',
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
    color: '#606070',
    fontWeight: 'bold',
    fontSize: 18,
  },
  moreLink: {
    color: '#228B22',
    fontWeight: 'bold',
    fontSize: 16,
  },
  flatListStyle: {
    marginHorizontal: -10,
  },
  itemContainer: {
    flex: 1,
    margin: 5,
  },
  touchableItem: {
    alignItems: 'center',
  },
  imageStyle: {
    width: 90,
    height: 90,
    marginBottom: 10,
    borderRadius: 100,
  },
  placeholderImage: {
    width: 90,
    height: 90,
    marginBottom: 10,
    borderRadius: 100,
    backgroundColor: '#ECECEC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#494949',
    fontWeight: '200',
  },
  itemText: {
    color: '#494949',
    fontWeight: '200',
    textAlign: 'center',
  },
});

export default SingleRow;
