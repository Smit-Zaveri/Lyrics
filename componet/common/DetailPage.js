import React, { useState, useEffect } from 'react';
import { ScrollView, Text, View, Linking, ToastAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FAB } from '@rneui/themed';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomMaterialMenu from '../home/CustomMaterialMenu';

const sampleLyrics = [
  {
    id: '1',
    numbering: 1,
    title: 'Sample Title 1',
    artist: 'Sample Artist 1',
    content: 'Sample content for song 1...',
    publishDate: new Date(),
    newFlag: true,
    tags: ['Pop', 'Rock'],
    youtube: 'https://www.youtube.com/watch?v=sample1',
  },
  {
    id: '2',
    numbering: 2,
    title: 'Sample Title 2',
    artist: 'Sample Artist 2',
    content: 'Sample content for song 2...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['R&B', 'Soul'],
    youtube: 'https://www.youtube.com/watch?v=sample2',
  },
];

const DetailPage = ({ route, navigation }) => {
  const { item } = route.params;
  const [isSaved, setIsSaved] = useState(false);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: `${item.numbering}. ${item.title}`,
      headerRight: () => (
        <CustomMaterialMenu
          menuText="Menu"
          textStyle={{ color: 'white' }}
          navigation={navigation}
          item={item}
          route={route}
          isIcon={true}
        />
      ),
    });
  }, [navigation, item.title]);

  useEffect(() => {
    const checkIfSaved = async () => {
      try {
        const savedData = await AsyncStorage.getItem('saved');
        if (savedData !== null) {
          const savedLyrics = JSON.parse(savedData);
          const isItemSaved = savedLyrics.some((lyric) => lyric.id === item.id);
          setIsSaved(isItemSaved);
        }
      } catch (error) {
        console.error(error);
      }
    };

    checkIfSaved();
  }, []);

  const handleFABClick = async () => {
    setIsSaved((prevSaved) => !prevSaved);

    try {
      const savedData = await AsyncStorage.getItem('saved');
      let savedLyrics = savedData !== null ? JSON.parse(savedData) : [];

      if (isSaved) {
        savedLyrics = savedLyrics.filter((lyric) => lyric.id !== item.id);
      } else {
        savedLyrics.push(item);
        ToastAndroid.showWithGravity(
          'Lyrics Has Been Saved',
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM
        );
      }

      await AsyncStorage.setItem('saved', JSON.stringify(savedLyrics));
    } catch (error) {
      console.error(error);
    }
  };

  const videoUrl = item.youtube;

  const openYouTubeApp = () => {
    Linking.openURL(videoUrl);
  };

  return (
    <View style={{ height: '100%' }}>
      <ScrollView>
        <View style={{ padding: 20 }}>
          <Text
            style={{
              fontSize: item.artist ? 16 : 0,
              marginBottom: item.artist ? 10 : 0,
            }}
          >
            {item.artist ? 'Artist :' : null} {item.artist}{' '}
          </Text>
          <View style={{ padding: 0 }}>
            <Text style={{ fontSize: 16, textAlign: 'justify', color: '#000' }}>
              {item.content}
            </Text>
          </View>
        </View>
      </ScrollView>
      {item.youtube ? (
        <FAB
          icon={() => (
            <MaterialCommunityIcons name="youtube" color="#fff" size={25} />
          )}
          color="#673AB7"
          placement="right"
          style={{ marginRight: 82, borderRadius: 50 }}
          onPress={openYouTubeApp}
        />
      ) : null}
      <FAB
        icon={() => (
          <MaterialCommunityIcons
            name={isSaved ? 'heart' : 'heart-outline'}
            color="#fff"
            size={25}
          />
        )}
        color="#673AB7"
        placement="right"
        onPress={handleFABClick}
      />
    </View>
  );
};

export default DetailPage;
