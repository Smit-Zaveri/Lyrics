import React, {useState, useEffect, useRef} from 'react';
import {
  ScrollView,
  Text,
  View,
  Linking,
  ToastAndroid,
  PanResponder,
  Animated,
  Easing,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {FAB} from '@rneui/themed';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomMaterialMenu from './CustomMaterialMenu';
import {sampleLyrics} from '../config/sampleLyrics';

const DetailPage = ({route, navigation}) => {
  const {itemNumberingparas} = route.params;
  const [itemNumbering, setItemNumbering] = useState(itemNumberingparas);
  const [song, setSong] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));

  const setSongByNumbering = (numbering) => {
    const song = sampleLyrics.find(
      (song) => song.numbering === parseInt(numbering),
    );
    return song || setItemNumbering(1);
  };

  const number = song?.numbering;
  const videoUrl = song?.youtube;

  useEffect(() => {
    const foundSong = setSongByNumbering(itemNumbering);
    setSong(foundSong);
  }, [itemNumbering]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dx > 50) {
          navigateSong('prev');
        } else if (gestureState.dx < -50) {
          navigateSong('next');
        }
      },
    }),
  ).current;

  const navigateSong = (direction) => {
    const duration = 100;
    const easing = Easing.in(Easing.bounce);
    // const easing = Easing.inOut(Easing.ease);
  
    if (direction === 'next') {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: duration,
        easing: easing,
        useNativeDriver: false,
      }).start(() => {
        setItemNumbering((prev) => parseInt(prev, 10) + 1);
        slideAnim.setValue(0);
      });
    } else if (direction === 'prev') {
      Animated.timing(slideAnim, {
        toValue: -1,
        duration: duration,
        easing: easing,
        useNativeDriver: false,
      }).start(() => {
        setItemNumbering((prev) => parseInt(prev, 10) - 1);
        slideAnim.setValue(0);
      });
    }
  };
  




  useEffect(() => {
    setSong(setSongByNumbering(itemNumbering));
  }, [itemNumbering]);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: `${song?.numbering}. ${song?.title}`,
      headerRight: () => (
        <CustomMaterialMenu
          menuText="Menu"
          textStyle={{color: 'white'}}
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
          ToastAndroid.BOTTOM,
        );
      }

      await AsyncStorage.setItem('saved', JSON.stringify(savedLyrics));
    } catch (error) {
      console.error(error);
    }
  };

  const openYouTubeApp = () => {
    Linking.openURL(videoUrl);
  };



  if (!song) {
    // Check if the item numbering is already 1 before setting it
    if (itemNumbering == 0 ) {
      setItemNumbering(1);
    }
    
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>Loading...</Text>
      </View>
    );
  }
  

  const animatedStyle = {
    transform: [
      {
        translateX: slideAnim.interpolate({
          inputRange: [-1, 0, 1],
          outputRange: [-170, 0, 170],
        }),
      },
    ],
  };

  return (
    <View style={{height: '100%'}} {...panResponder.panHandlers}>
      <ScrollView>
        <Animated.View style={[animatedStyle, {padding: 20}]}>
          <Text
            style={{
              fontSize: song.artist ? 16 : 0,
              marginBottom: song.artist ? 10 : 0,
            }}>
            {song.artist ? 'Artist :' : null} {song.artist}{' '}
          </Text>
          <View style={{padding: 0}}>
            <Text style={{fontSize: 16, textAlign: 'justify', color: '#000'}}>
              {song.content}
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
      {song.youtube ? (
        <FAB
          icon={() => (
            <MaterialCommunityIcons name="youtube" color="#fff" size={25} />
          )}
          color="#673AB7"
          placement="right"
          style={{marginRight: 82, borderRadius: 50}}
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
