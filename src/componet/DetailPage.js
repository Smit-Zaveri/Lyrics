import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, Text, View, Linking, ToastAndroid, PanResponder } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FAB } from '@rneui/themed';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomMaterialMenu from './CustomMaterialMenu';

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
    youtube: 'https://youtu.be/PhSQnIrQIOg?si=xNmhPEWjcSVvdVzF',
  },
  {
    id: '2',
    numbering: 2000000,
    title: 'Sample Title 2',
    artist: 'Sample Artist 2',
    content: 'Sample content for song 2...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['R&B', 'Soul'],
  },
  {
    id: '3',
    numbering: 3,
    title: 'Sample Title 3',
    artist: 'Sample Artist 3',
    content: 'Sample content for song 3...',
    publishDate: new Date('2024-04-09'),
    newFlag: false,
    tags: ['Country', 'Folk'],
  },
  {
    id: '4',
    numbering: 4,
    title: 'Sample Title 4',
    artist: 'Sample Artist 4',
    content: 'Sample content for song 4...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Hip-hop', 'Rap'],
  },
  {
    id: '5',
    numbering: 5,
    title: 'Sample Title 5',
    artist: 'Sample Artist 5',
    content: 'Sample content for song 5...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Electronic', 'Dance'],
  },
  {
    id: '6',
    numbering: 6,
    title: 'Sample Title 6',
    artist: 'Sample Artist 6',
    content: 'Sample content for song 6...',
    publishDate: new Date('2024-04-07'),
    newFlag: false,
    tags: ['Blues', 'Jazz'],
  },
  {
    id: '7',
    numbering: 7,
    title: 'Sample Title 7',
    artist: 'Sample Artist 7',
    content: 'Sample content for song 7...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Classical', 'Opera'],
  },
  {
    id: '8',
    numbering: 8,
    title: 'Sample Title 8',
    artist: 'Sample Artist 8',
    content: 'Sample content for song 8...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Reggae', 'Ska'],
  },
  {
    id: '9',
    numbering: 9,
    title: 'Sample Title 9',
    artist: 'Sample Artist 9',
    content: 'Sample content for song 9...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Gospel', 'Spiritual'],
  },
  {
    id: '10',
    numbering: 10,
    title: 'Sample Title 10',
    artist: 'Sample Artist 10',
    content: 'Sample content for song 10...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Metal', 'Punk'],
  },
  {
    id: '11',
    numbering: 11,
    title: 'Sample Title 11',
    artist: 'Sample Artist 11',
    content: 'Sample content for song 11...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Indie', 'Alternative', 'Rock'],
  },
  {
    id: '12',
    numbering: 12,
    title: 'Sample Title 12',
    artist: 'Sample Artist 12',
    content: 'Sample content for song 12...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Funk', 'Disco'],
  },
  {
    id: '13',
    numbering: 13,
    title: 'Nem\'s Melody',
    artist: 'Nem',
    content: 'Sample content for Nem\'s song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Nem'],
  },
  {
    id: '14',
    numbering: 14,
    title: 'Mahavir\'s Chant',
    artist: 'Mahavir',
    content: 'Sample content for Mahavir\'s song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Mahavir', 'Nem'],
  },
  {
    id: '15',
    numbering: 15,
    title: 'Dhaja\'s Anthem',
    artist: 'Dhaja',
    content: 'Sample content for Dhaja\'s song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Dhaja'],
  },
  {
    id: '16',
    numbering: 16,
    title: 'Paras Gada\'s Groove',
    artist: 'Paras Gada',
    content: 'Sample content for Paras Gada\'s song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Paras Gada'],
  },
  {
    id: '17',
    numbering: 17,
    title: 'Managupta\'s Harmony',
    artist: 'Managupta',
    content: 'Sample content for Managupta\'s song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Managupta'],
  },
  {
    id: '18',
    numbering: 18,
    title: 'Nem\'s Dream',
    artist: 'Nem',
    content: 'Sample content for Nem\'s second song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Nem'],
  },
  {
    id: '19',
    numbering: 19,
    title: 'Mahavir\'s Reflection',
    artist: 'Mahavir',
    content: 'Sample content for Mahavir\'s second song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Mahavir'],
  },
  {
    id: '20',
    numbering: 20,
    title: 'Dhaja\'s Resonance',
    artist: 'Dhaja',
    content: 'Sample content for Dhaja\'s second song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Dhaja'],
  },
  {
    id: '21',
    numbering: 21,
    title: 'Paras Gada\'s Rhythm',
    artist: 'Paras Gada',
    content: 'Sample content for Paras Gada\'s second song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Paras Gada'],
  },
  {
    id: '22',
    numbering: 22,
    title: 'Managupta\'s Melody',
    artist: 'Managupta',
    content: 'Sample content for Managupta\'s second song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Managupta'],
  },
  {
    id: '23',
    numbering: 23,
    title: 'Nem\'s Harmony',
    artist: 'Nem',
    content: 'Sample content for Nem\'s third song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Nem'],
  },
  {
    id: '24',
    numbering: 24,
    title: 'Mahavir\'s Tune',
    artist: 'Mahavir',
    content: 'Sample content for Mahavir\'s third song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Mahavir'],
  },
  {
    id: '25',
    numbering: 25,
    title: 'Dhaja\'s Symphony',
    artist: 'Dhaja',
    content: 'Sample content for Dhaja\'s third song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Dhaja'],
  },
  {
    id: '26',
    numbering: 26,
    title: 'Paras Gada\'s Pulse',
    artist: 'Paras Gada',
    content: 'Sample content for Paras Gada\'s third song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Paras Gada'],
  },
  {
    id: '27',
    numbering: 27,
    title: 'Managupta\'s Ballad',
    artist: 'Managupta',
    content: 'Sample content for Managupta\'s third song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Managupta'],
  },
  {
    id: '28',
    numbering: 28,
    title: 'Nem\'s Lullaby',
    artist: 'Nem',
    content: 'Sample content for Nem\'s fourth song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Nem'],
  },
  {
    id: '29',
    numbering: 29,
    title: 'Mahavir\'s Verse',
    artist: 'Mahavir',
    content: 'Sample content for Mahavir\'s fourth song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Mahavir'],
  },
  {
    id: '30',
    numbering: 30,
    title: 'Dhaja\'s Overture',
    artist: 'Dhaja',
    content: 'Sample content for Dhaja\'s fourth song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Dhaja'],
  },
  {
    id: '301',
    numbering: 301,
    title: 'Paras Gada\'s Waltz',
    artist: 'Paras Gada',
    content: 'Sample content for Paras Gada\'s fourth song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Paras Gada'],
  },
  {
    id: '32',
    numbering: 32,
    title: 'Managupta\'s Aria',
    artist: 'Managupta',
    content: 'Sample content for Managupta\'s fourth song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Managupta'],
  },
];

const DetailPage = ({ route, navigation }) => {
  const { itemNumbering } = route.params;
const [songIndex, setSongIndex] = useState(itemNumbering - 1);
const [isSaved, setIsSaved] = useState(false);
const [song, setSong] = useState(sampleLyrics[songIndex]);

const panResponder = useRef(
  PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderRelease: (e, gestureState) => {
      if (gestureState.dx > 50) {
        // Swipe right
        navigateSong('prev');
      } else if (gestureState.dx < -50) {
        // Swipe left
        navigateSong('next');
      }
    },
  })
).current;

const navigateSong = (direction) => {
  if (direction === 'next' && songIndex < sampleLyrics.length - 1) {
    setSongIndex((prevIndex) => prevIndex + 1);
  } else if (direction === 'prev' && songIndex > 0) {
    setSongIndex((prevIndex) => prevIndex - 1);
  } else {
    console.log('Invalid direction or song index out of bounds');
  }
};

useEffect(() => {
  setSong(sampleLyrics[songIndex]);
}, [songIndex]);

// Update song state immediately after setting songIndex
useEffect(() => {
  setSong(sampleLyrics[songIndex]);
}, []);

// ... rest of your component


  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: `${song?.numbering}. ${song?.title}`,
      headerRight: () => (
        <CustomMaterialMenu
          menuText="Menu"
          textStyle={{ color: 'white' }}
          navigation={navigation}
          item={song}
          route={route}
          isIcon={true}
        />
      ),
    });
  }, [navigation, song]);

  useEffect(() => {
    const checkIfSaved = async () => {
      try {
        const savedData = await AsyncStorage.getItem('saved');
        if (savedData !== null) {
          const savedLyrics = JSON.parse(savedData);
          const isItemSaved = savedLyrics.some((lyric) => lyric.id === song?.id);
          setIsSaved(isItemSaved);
        }
      } catch (error) {
        console.error(error);
      }
    };

    checkIfSaved();
  }, [song]);

  const handleFABClick = async () => {
    setIsSaved((prevSaved) => !prevSaved);

    try {
      const savedData = await AsyncStorage.getItem('saved');
      let savedLyrics = savedData !== null ? JSON.parse(savedData) : [];

      if (isSaved) {
        savedLyrics = savedLyrics.filter((lyric) => lyric.id !== song?.id);
      } else {
        savedLyrics.push(song);
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

  const videoUrl = song?.youtube;

  const openYouTubeApp = () => {
    Linking.openURL(videoUrl);
  };

  if (!song) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View 
      style={{ height: '100%' }}
      {...panResponder.panHandlers}
    >
      <ScrollView>
        <View style={{ padding: 20 }}>
          <Text
            style={{
              fontSize: song.artist ? 16 : 0,
              marginBottom: song.artist ? 10 : 0,
            }}
          >
            {song.artist ? 'Artist :' : null} {song.artist}{' '}
          </Text>
          <View style={{ padding: 0 }}>
            <Text style={{ fontSize: 16, textAlign: 'justify', color: '#000' }}>
              {song.content}
            </Text>
          </View>
        </View>
      </ScrollView>
      {song.youtube ? (
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