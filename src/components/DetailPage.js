import React, { useState, useEffect, useRef, useCallback, useMemo, useContext, useLayoutEffect } from 'react';
import {
  ScrollView,
  Text,
  View,
  Linking,
  Animated,
  Easing,
  PanResponder,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FAB } from '@rneui/themed';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Sound from 'react-native-sound';
import CustomMaterialMenu from './CustomMaterialMenu';
import { colors } from '../theme/Theme';
import Slider from '@react-native-community/slider';
import Share from 'react-native-share';
import { ThemeContext } from '../../App';

// --- Error Boundary Component ---
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('Error caught in ErrorBoundary:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Text style={{ color: 'red', fontSize: 16 }}>Something went wrong.</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

// --- DetailPage Component ---
const DetailPage = ({ route, navigation }) => {
  const { themeColors } = useContext(ThemeContext);
  const { itemNumberingparas, Lyrics } = route.params;

  const [itemNumbering, setItemNumbering] = useState(itemNumberingparas);
  const [song, setSong] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));
  const [opacityAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fontSize, setFontSize] = useState(18);
  const [autoScroll, setAutoScroll] = useState(false);
  // States to handle slider seeking
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  const scrollViewRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Set Sound category and clean up on unmount
  useEffect(() => {
    try {
      Sound.setCategory('Playback');
    } catch (error) {
      console.error('Error setting sound category:', error);
    }
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (sound) {
        sound.stop();
        sound.release();
        setSound(null);
      }
    };
  }, []);

  // Cleanup audio when sound changes
  useEffect(() => {
    return () => {
      if (sound) {
        sound.stop();
        sound.release();
        setSound(null);
        setIsPlaying(false);
      }
    };
  }, [sound]);

  // Update song based on numbering
  const setSongByNumbering = useCallback(
    numbering => {
      try {
        const foundSong = Lyrics.find(
          song => song.numbering === parseInt(numbering, 10)
        );
        return foundSong;
      } catch (error) {
        console.error('Error finding song by numbering:', error);
        return null;
      }
    },
    [Lyrics]
  );

  const headerOptions = useMemo(
    () => ({
      title: `${song?.numbering}. ${song?.title}`,
      headerRight: () => (
        <CustomMaterialMenu
          menuText="Menu"
          textStyle={{ color: themeColors.text }}
          navigation={navigation}
          item={song}
          route={route}
          isIcon={true}
          theme={themeColors}
        />
      ),
    }),
    [navigation, route, song, themeColors]
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
      onMoveShouldSetPanResponder: (evt, gestureState) =>
        Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dx > 50) {
          navigateSong('prev');
        } else if (gestureState.dx < -50) {
          navigateSong('next');
        }
      },
    })
  ).current;

  const navigateSong = direction => {
    try {
      if (sound && isPlaying) {
        sound.stop();
        sound.release();
        setSound(null);
        setIsPlaying(false);
      }
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
          const sortedNumberings = Lyrics.map(song => song.numbering).sort((a, b) => a - b);
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
    } catch (error) {
      console.error('Error navigating song:', error);
    }
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
      console.error('Error checking saved song:', error);
    }
  }, [song]);

  const [fabAnim] = useState(new Animated.Value(1));

  const handleFABClick = async () => {
    try {
      setIsSaved(prevSaved => !prevSaved);
      Animated.sequence([
        Animated.timing(fabAnim, {
          toValue: 0.7,
          duration: 150,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fabAnim, {
          toValue: 1,
          duration: 150,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]).start();

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
        let updatedSong = { ...song, numbering: newNumbering };
        savedLyrics.push(updatedSong);
      }
      await AsyncStorage.setItem('cachedData_saved', JSON.stringify(savedLyrics));
    } catch (error) {
      console.error('Error handling FAB click:', error);
    }
  };

  const openYouTubeApp = () => {
    try {
      if (sound && isPlaying) {
        sound.stop();
        sound.release();
        setSound(null);
        setIsPlaying(false);
      }
      Linking.openURL(song?.youtube);
    } catch (error) {
      console.error('Error opening YouTube app:', error);
    }
  };

  const shareSong = async () => {
    try {
      const shareOptions = {
        message: `${song.title}\n\n${song.content}\n\n${song.artist || ''}`,
        title: song.title,
      };
      await Share.open(shareOptions);
    } catch (error) {
      console.error('Error sharing song:', error);
    }
  };

  // Auto-scroll effect (if enabled)
  useEffect(() => {
    let scrollInterval;
    if (autoScroll && scrollViewRef.current) {
      scrollInterval = setInterval(() => {
        scrollViewRef.current.scrollTo({
          y: progress * 2, // adjust multiplier as needed
          animated: true,
        });
      }, 100);
    }
    return () => clearInterval(scrollInterval);
  }, [autoScroll, progress]);

  // Helper to format seconds as mm:ss
  const formatTime = seconds => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // EFFECT FOR SMOOTH PROGRESS TRACKING
  useEffect(() => {
    try {
      if (isPlaying && sound) {
        progressIntervalRef.current = setInterval(() => {
          sound.getCurrentTime(current => {
            // Only update progress if user is not seeking
            if (!isSeeking) {
              setProgress(current);
            }
          });
        }, 250);
      } else if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    } catch (error) {
      console.error('Error tracking progress:', error);
    }
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [isPlaying, sound, isSeeking]);

  // Toggle audio playback with proper progress state management
  const toggleAudio = () => {
    if (!song?.mp3URL) return;
    try {
      if (sound) {
        if (isPlaying) {
          sound.pause(() => {
            setIsPlaying(false);
          });
        } else {
          setIsLoading(true);
          sound.play(success => {
            setIsLoading(false);
            if (!success) {
              setAudioError('Error playing audio');
            }
            setIsPlaying(false);
            sound.release();
            setSound(null);
          });
          setIsPlaying(true);
        }
      } else {
        setIsLoading(true);
        setAudioError(null);
        const newSound = new Sound(song.mp3URL, null, error => {
          setIsLoading(false);
          if (error) {
            console.error('Error loading sound:', error);
            setAudioError('Error loading audio');
            return;
          }
          setSound(newSound);
          setDuration(newSound.getDuration());
          newSound.play(success => {
            if (!success) {
              setAudioError('Error playing audio');
            }
            setIsPlaying(false);
            newSound.release();
            setSound(null);
          });
          setIsPlaying(true);
        });
      }
    } catch (error) {
      console.error('Error toggling audio:', error);
      setAudioError('Unexpected error occurred');
    }
  };

  // Load font size from AsyncStorage
  useEffect(() => {
    (async () => {
      try {
        const savedFontSize = await AsyncStorage.getItem('fontSize');
        if (savedFontSize) {
          setFontSize(parseInt(savedFontSize, 10));
        }
      } catch (error) {
        console.error('Error loading font size:', error);
      }
    })();
  }, []);

  if (!song) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.background }}>
        <Text style={{ color: themeColors.text }}>Loading...</Text>
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
      { scale: scaleAnim },
    ],
    opacity: opacityAnim,
  };

  // Render audio controls with a circular play/pause button and a smooth slider
  const renderAudioControls = () => {
    if (!song.mp3URL) return null;
    return (
      <View style={styles.audioContainer}>
        <TouchableOpacity
          style={[styles.playButton, { backgroundColor: themeColors.primary }]}
          onPress={toggleAudio}
          disabled={isLoading}>
          <MaterialCommunityIcons
            name={isLoading ? 'loading' : isPlaying ? 'pause' : 'play'}
            size={28}
            color="#fff"
          />
        </TouchableOpacity>
        <View style={styles.sliderContainer}>
          <Text style={[styles.timeText, { color: themeColors.text }]}>
            {formatTime(isSeeking ? seekValue : progress)}
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={duration}
            value={isSeeking ? seekValue : progress}
            disabled={isLoading || !sound}
            onValueChange={(value) => {
              setIsSeeking(true);
              setSeekValue(value);
            }}
            onSlidingComplete={(value) => {
              try {
                if (sound) {
                  sound.setCurrentTime(value);
                  setProgress(value);
                }
              } catch (error) {
                console.error('Error seeking audio:', error);
              }
              setIsSeeking(false);
            }}
            minimumTrackTintColor={themeColors.primary}
            maximumTrackTintColor={themeColors.text}
          />
          <Text style={[styles.timeText, { color: themeColors.text }]}>
            {formatTime(duration)}
          </Text>
        </View>
        {audioError ? <Text style={styles.errorText}>{audioError}</Text> : null}
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: themeColors.background }} {...panResponder.panHandlers}>
      <Animated.View style={[animatedStyle, { paddingHorizontal: 20, paddingBottom: 20 }]}>
        <Text
          style={{
            paddingTop: 10,
            fontSize: song.artist ? 16 : 0,
            marginBottom: song.artist ? 10 : 0,
            color: themeColors.text,
          }}>
          {song.artist ? 'રચનાર :' : ''} {song.artist}
        </Text>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}>
          <Text style={{ fontSize: fontSize, color: themeColors.text }} {...panResponder.panHandlers}>
            {song.content}
          </Text>
        </ScrollView>
        {renderAudioControls()}
      </Animated.View>

      {song.youtube && (
        <FAB
          icon={() => <MaterialCommunityIcons name="youtube" color="#fff" size={25} />}
          color={themeColors.primary}
          placement="right"
          style={{ marginBottom: 82, borderRadius: 50 }}
          onPress={openYouTubeApp}
        />
      )}
      <FAB
        style={{ transform: [{ scale: fabAnim }] }}
        icon={() => (
          <MaterialCommunityIcons name={isSaved ? 'heart' : 'heart-outline'} color="#fff" size={25} />
        )}
        color={themeColors.primary}
        placement="right"
        onPress={handleFABClick}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  audioContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  slider: {
    flex: 1,
  },
  timeText: {
    fontSize: 14,
  },
  errorText: {
    color: 'red',
    marginTop: 5,
    fontSize: 12,
  },
});

// --- Export wrapped with Error Boundary ---
export default function WrappedDetailPage(props) {
  return (
    <ErrorBoundary>
      <DetailPage {...props} />
    </ErrorBoundary>
  );
}
