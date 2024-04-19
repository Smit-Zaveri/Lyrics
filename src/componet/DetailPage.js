import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useLayoutEffect,
  useRef,
} from 'react';
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

const DetailPage = ({route, navigation}) => {
  const {itemNumberingparas, Lyrics} = route.params; // Destructure Lyrics here

  // State variables
  const [itemNumbering, setItemNumbering] = useState(itemNumberingparas);
  const [song, setSong] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [lastItemNumber, setLastItemNumber] = useState(itemNumberingparas);
  const [slideAnim] = useState(new Animated.Value(0));

  // Memoized functions and values
  const setSongByNumbering = useCallback(
    numbering => {
      const foundSong = Lyrics.find(
        song => song.numbering === parseInt(numbering),
      );
      return foundSong || setItemNumbering(lastItemNumber);
    },
    [Lyrics, lastItemNumber],
  );

  const headerOptions = useMemo(
    () => ({
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
    }),
    [navigation, route, song],
  );

  // Effects
  useEffect(() => {
    const foundSong = setSongByNumbering(itemNumbering);
    setSong(foundSong);
  }, [itemNumbering, setSongByNumbering]);

  useEffect(() => {
    checkIfSaved();
  }, [song, checkIfSaved]);

  // Layout Effects
  useLayoutEffect(() => {
    navigation.setOptions(headerOptions);
  }, [navigation, headerOptions]);

  // PanResponder for gestures
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

  // Helper functions
  const navigateSong = direction => {
    const toValue = direction === 'next' ? 1 : -1;
    Animated.timing(slideAnim, {
      toValue: toValue,
      duration: 300,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: false,
    }).start(() => {
      setItemNumbering(prev => {
        const newNumber = parseInt(prev, 10) + toValue;
        if (newNumber > 0 && newNumber <= Lyrics.length) {
          setLastItemNumber(newNumber);
          return newNumber;
        } else {
          return prev;
        }
      });
      slideAnim.setValue(0);
    });
  };

  const checkIfSaved = useCallback(async () => {
    try {
      const savedData = await AsyncStorage.getItem('saved');
      if (savedData !== null) {
        const savedLyrics = JSON.parse(savedData);
        const isItemSaved = savedLyrics.some(lyric => lyric.id === song?.id);
        setIsSaved(isItemSaved);
      }
    } catch (error) {
      console.error(error);
    }
  }, [song]);

  const handleFABClick = async () => {
    setIsSaved(prevSaved => !prevSaved);
  
    try {
      const savedData = await AsyncStorage.getItem('saved');
      let savedLyrics = savedData !== null ? JSON.parse(savedData) : [];
  
      if (isSaved) {
        savedLyrics = savedLyrics.filter(lyric => lyric.id !== song?.id);
      } else {
        const numberOfSavedLyrics = savedLyrics.length;
        const newNumbering = numberOfSavedLyrics + 1;
  
        let updatedSong;
        if (numberOfSavedLyrics === 0) {
          updatedSong = {...song, numbering: 1};
        } else {
          updatedSong = {...song, numbering: newNumbering};
        }
  
        savedLyrics.push(updatedSong);
        ToastAndroid.showWithGravity(
          'Lyrics Has Been Saved',
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM,
        );
  
        // setSong(updatedSong);
      }
  
      await AsyncStorage.setItem('saved', JSON.stringify(savedLyrics));
    } catch (error) {
      console.error(error);
    }
  };
  
  const openYouTubeApp = () => {
    Linking.openURL(song?.youtube);
  };

  // Render
  if (!song) {
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
          outputRange: [-100, 0, 100],
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
      {song.youtube && (
        <FAB
          icon={() => (
            <MaterialCommunityIcons name="youtube" color="#fff" size={25} />
          )}
          color="#673AB7"
          placement="right"
          style={{marginRight: 82, borderRadius: 50}}
          onPress={openYouTubeApp}
        />
      )}
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
