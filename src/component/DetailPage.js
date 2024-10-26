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
  Animated,
  Easing,
  useColorScheme,
  PanResponder,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {FAB} from '@rneui/themed';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomMaterialMenu from './CustomMaterialMenu';
import {colors} from '../theme/theme';

const DetailPage = ({route, navigation}) => {
  const {itemNumberingparas, Lyrics} = route.params;
  const systemTheme = useColorScheme();
  const themeColors = systemTheme === 'dark' ? colors.dark : colors.light;

  const [itemNumbering, setItemNumbering] = useState(itemNumberingparas);
  const [song, setSong] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));
  const [opacityAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));

  const setSongByNumbering = useCallback(
    numbering => {
      const foundSong = Lyrics.find(
        song => song.numbering === parseInt(numbering),
      );
      return foundSong;
    },
    [Lyrics],
  );

  const headerOptions = useMemo(
    () => ({
      title: `${song?.numbering}.  ${song?.title}`,
      headerRight: () => (
        <CustomMaterialMenu
          menuText="Menu"
          textStyle={{color: themeColors.text}}
          navigation={navigation}
          item={song}
          route={route}
          isIcon={true}
          theme={themeColors}
        />
      ),
    }),
    [navigation, route, song, themeColors],
  );

  useEffect(() => {
    const foundSong = setSongByNumbering(itemNumbering);
    setSong(foundSong);
  }, [itemNumbering, setSongByNumbering]);

  useEffect(() => {
    checkIfSaved();
  }, [song]);

  useLayoutEffect(() => {
    navigation.setOptions(headerOptions);
  }, [navigation, headerOptions]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        return Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
      },
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dx > 50) {
          navigateSong('prev');
        } else if (gestureState.dx < -50) {
          navigateSong('next');
        }
      },
    }),
  ).current;

  const navigateSong = direction => {
    const toValue = direction === 'next' ? 1 : -1;

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: toValue,
        duration: 400,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 300,
        easing: Easing.out(Easing.exp),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setItemNumbering(prev => {
        const currentNumber = parseInt(prev, 10);
        const sortedNumberings = Lyrics.map(song => song.numbering).sort(
          (a, b) => a - b,
        );
        const currentIndex = sortedNumberings.indexOf(currentNumber);
        let newIndex = currentIndex + toValue;

        if (newIndex < 0) {
          newIndex = sortedNumberings.length - 1;
        } else if (newIndex >= sortedNumberings.length) {
          newIndex = 0;
        }

        return sortedNumberings[newIndex].toString();
      });

      slideAnim.setValue(0);
      opacityAnim.setValue(1);
      scaleAnim.setValue(1);
    });
  };

  const checkIfSaved = useCallback(async () => {
    try {
      const savedData = await AsyncStorage.getItem('cachedData_saved');
      if (savedData !== null) {
        const savedLyrics = JSON.parse(savedData);
        const isItemSaved = savedLyrics.some(lyric => lyric.id === song?.id);
        setIsSaved(isItemSaved);
      }
    } catch (error) {
      console.error(error);
    }
  }, [song]);

  const [fabAnim] = useState(new Animated.Value(1));
  const handleFABClick = async () => {
    setIsSaved(prevSaved => !prevSaved);

    Animated.sequence([
      Animated.timing(fabAnim, {
        toValue: 0.7, // Slightly smaller scale
        duration: 150, // Increased duration
        easing: Easing.inOut(Easing.ease), // Smoother easing
        useNativeDriver: true,
      }),
      Animated.timing(fabAnim, {
        toValue: 1,
        duration: 150, // Increased duration
        easing: Easing.inOut(Easing.ease), // Smoother easing
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const savedData = await AsyncStorage.getItem('cachedData_saved');
      let savedLyrics = savedData !== null ? JSON.parse(savedData) : [];

      if (isSaved) {
        savedLyrics = savedLyrics.filter(lyric => lyric.id !== song?.id);
        savedLyrics = savedLyrics.map((lyric, index) => ({
          ...lyric,
          numbering: index + 1,
        }));
      } else {
        const newNumbering = savedLyrics.length + 1;
        let updatedSong = {...song, numbering: newNumbering};
        savedLyrics.push(updatedSong);
      }

      await AsyncStorage.setItem(
        'cachedData_saved',
        JSON.stringify(savedLyrics),
      );
    } catch (error) {
      console.error(error);
    }
  };

  const openYouTubeApp = () => {
    Linking.openURL(song?.youtube);
  };

  if (!song) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: themeColors.background,
        }}>
        <Text style={{color: themeColors.text}}>Loading...</Text>
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
      {
        scale: scaleAnim,
      },
    ],
    opacity: opacityAnim,
  };

  return (
    <View
      style={{flex: 1, backgroundColor: themeColors.background}}
      {...panResponder.panHandlers}>
      <Animated.View
        style={[
          animatedStyle,
          {paddingStart: 20, paddingEnd: 20, paddingBottom: 20},
        ]}>
        <Text
          style={{
            paddingTop: 10,
            fontSize: song.artist ? 16 : 0,
            marginBottom: song.artist ? 10 : 0,
            color: themeColors.text,
          }}>
          {song.artist ? 'Artist :' : null} {song.artist}
        </Text>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{paddingBottom: 100}}>
          <Text
            style={{fontSize: 18, textAlign: '', color: themeColors.text}}
            {...panResponder.panHandlers}>
            {song.content}
          </Text>
        </ScrollView>
      </Animated.View>
      {song.youtube && (
        <FAB
          icon={() => (
            <MaterialCommunityIcons name="youtube" color="#fff" size={25} />
          )}
          color={themeColors.primary}
          placement="right"
          style={{marginBottom: 82, borderRadius: 50}}
          onPress={openYouTubeApp}
        />
      )}
      <FAB
        style={{transform: [{scale: fabAnim}]}}
        icon={() => (
          <MaterialCommunityIcons
            name={isSaved ? 'heart' : 'heart-outline'}
            color="#fff"
            size={25}
          />
        )}
        color={themeColors.primary}
        placement="right"
        onPress={handleFABClick}
      />
    </View>
  );
};

export default DetailPage;
