import React, {Component} from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  ScrollView,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import {SuperGridSectionList} from 'react-native-super-grid';

const DoubleColum = ({route, navigation}) => {
  const {data} = route.params;
  const {title} = route.params;
  const {redirect} = route.params;
  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: title,
    });
  }, [navigation, title]);

  return (
    <SafeAreaView>
      <FlatList
        data={data}
        renderItem={({item}) => (
          <View
            style={{
              flex: 1,
              marginTop: 10,
              flexDirection: 'column',
              alignItems: 'center',
            }}>
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
              style={{
                margin: 5,
                flex: 1,
                justifyContent: 'center',
              }}>
              {item.picture ? (
                <Image
                  source={{uri: item.picture}}
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 100,
                    width: 100,
                    padding: 10,
                    backgroundColor: '#fff',
                    borderRadius: 100,
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 100,
                    height: 100,
                    margin: 10,
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
                  style={{color: '#494949', marginTop: 5, fontWeight: '200'}}
                  onPress={() => {
                    alert('Title ' + item.title + ' Clicked');
                  }}>
                  {item.displayName ? item.displayName : item.name}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
        //Setting the number of column
        numColumns={3}
        keyExtractor={(item, index) => index}
      />
    </SafeAreaView>
  );
};

export default DoubleColum;