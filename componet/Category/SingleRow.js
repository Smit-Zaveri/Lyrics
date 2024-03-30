import React, {useEffect, useRef} from 'react';
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  Image,
  FlatList,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import {Card} from 'react-native-elements';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

const SingleRow = ({navigation, title, data, redirect, collection}) => {
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

  const onPressLearnMore = () => {
    alert('Hello');
  };

  return (
    <Card containerStyle={[styles.cardStyle]}>
      <View style={[styles.cardHeadingStyle]}>
        <Text style={styles.cardHeadingTextStyle}>{title}</Text>
        <Text
          style={{color: '#228B22'}}
          onPress={() =>
            navigation.navigate('Double', {
              data: data,
              title: title,
              redirect: redirect,
            })
          }>
          MORE
        </Text>
      </View>
      <View style={{flexDirection: 'row', marginVertical: 15, width: '100%'}}>
        <FlatList
          style={{marginHorizontal: -10}}
          showsHorizontalScrollIndicator={false}
          horizontal
          data={data}
          renderItem={({item}) => (
            <Animated.View style={[styles.container, {opacity: fadeAnim}]}>
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
                style={{margin: 5}}>
                {item.picture ? (
                  <Image
                    source={{uri: item.picture}}
                    style={{
                      width: 90,
                      height: 90,
                      marginBottom: 10,
                      marginLeft: 5,
                      borderRadius: 100,
                    }}
                  />
                ) : (
                  <View
                    style={{
                      width: 90,
                      height: 90,
                      marginBottom: 10,
                      marginLeft: 5,
                      borderRadius: 100,
                      backgroundColor: '#ECECEC',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}>
                    <Text style={{color: '#494949', fontWeight: '200'}}>
                      {item.name.charAt(0)}
                    </Text>
                  </View>
                )}
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{color: '#494949', fontWeight: '200'}}
                    onPress={() => {
                      alert('Title ' + item.title + ' Clicked');
                    }}>
                    {item.displayName ? item.displayName : item.name}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          )}
          keyExtractor={(item, index) => index}
        />
        {/* <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
          {data.map((item, key) => (
            
          ))}
        </ScrollView> */}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardStyle: {
    paddingHorizontal: 12,
    borderCurve: 'continuous',
    borderColor: '#fff',
    marginLeft: 0,
    marginRight: 0,
    marginTop: 0,
  },
  cardHeadingStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardHeadingTextStyle: {
    paddingLeft: 10,
    color: '#606070',
    fontWeight: 'bold',
  },
  childViewTextStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default SingleRow;