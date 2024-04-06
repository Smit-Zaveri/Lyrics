import React, {useState, useEffect} from 'react';
import {
  FlatList,
  Text,
  View,
  Pressable,
  PixelRatio,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const phoneFontScale = PixelRatio.getFontScale();

const SavedLyrics = ({navigation}) => {
  const [savedLyrics, setSavedLyrics] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSavedLyrics = async () => {
    try {
      const savedData = await AsyncStorage.getItem('saved');
      if (savedData !== null) {
        const savedLyricsArray = JSON.parse(savedData);
        setSavedLyrics(savedLyricsArray);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchSavedLyrics();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSavedLyrics();
    setRefreshing(false);
  };

  const renderSavedLyric = ({item}) => (
    <Pressable
      onPress={() => {
        navigation.navigate('SavedDetails', {item});
      }}
      style={{marginHorizontal: 5}}>
      <View
        key={item.id}
        style={{
          borderBottomColor: 'rgba(0,0,0,0.2)',
          borderBottomWidth: 1,
          padding: 10,
          height: 70,
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <View style={{height: 40}}>
          <Text
            style={{
              marginRight: 20,
              backgroundColor: '#673AB7',
              color: '#fff',
              paddingHorizontal: 16,
              paddingTop: 10,
              flex: 1,
              fontWeight: 'bold',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 20,
            }}>
            {item.numbering}
          </Text>
        </View>
        <View style={{flex: 1}}>
          <Text style={{fontWeight: 'bold', fontSize: 16 * phoneFontScale}}>
            {item.title}
          </Text>
          <Text style={{fontSize: 14 * phoneFontScale}}>
            {item.content.split('\n')[0]}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  const renderEmptyList = () => (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <Text style={{fontSize: 16, fontWeight: 'bold', marginVertical: '80%'}}>
        No saved lyrics available
      </Text>
    </View>
  );

  return (
    <View style={{flex: 1}}>
      <FlatList
        data={savedLyrics}
        renderItem={renderSavedLyric}
        keyExtractor={item => item.id.toString()}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl
            tintColor="#673AB7"
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      />
    </View>
  );
};

export default SavedLyrics;