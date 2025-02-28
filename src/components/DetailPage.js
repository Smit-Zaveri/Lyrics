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
  Modal,
  TextInput,
  FlatList,
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

  const [collections, setCollections] = useState([]);
  const [showCollectionsModal, setShowCollectionsModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const slideUpAnim = useRef(new Animated.Value(0)).current;

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
          song => song.filteredIndex === numbering
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
      title: `${song?.displayNumbering}. ${song?.title}`,  // Use displayNumbering instead of numbering
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
          const currentIndex = parseInt(prev, 10);
          let newIndex = currentIndex + toValue;
          if (newIndex < 1) {
            newIndex = Lyrics.length;
          } else if (newIndex > Lyrics.length) {
            newIndex = 1;
          }
          return newIndex;
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

  const handleFABClick = () => {
    setShowCollectionsModal(true);
    Animated.spring(slideUpAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 8
    }).start();
  };

  const closeCollectionsModal = () => {
    Animated.timing(slideUpAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => setShowCollectionsModal(false));
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

  // Load collections on mount
  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const savedCollections = await AsyncStorage.getItem('user_collections');
      if (savedCollections) {
        setCollections(JSON.parse(savedCollections));
      }
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  const createNewCollection = async () => {
    if (!newCollectionName.trim()) return;

    try {
      const newCollection = {
        id: Date.now().toString(),
        name: newCollectionName.trim(),
        songs: []
      };
      const updatedCollections = [...collections, newCollection];
      await AsyncStorage.setItem('user_collections', JSON.stringify(updatedCollections));
      setCollections(updatedCollections);
      setNewCollectionName('');
    } catch (error) {
      console.error('Error creating collection:', error);
    }
  };

  const toggleSongInCollection = async (collectionId) => {
    try {
      const updatedCollections = collections.map(collection => {
        if (collection.id === collectionId) {
          const songExists = collection.songs.some(s => s.id === song.id);
          if (songExists) {
            // Remove song and reorder remaining songs
            collection.songs = collection.songs
              .filter(s => s.id !== song.id)
              .map((s, index) => ({
                ...s,
                order: index + 1
              }));
          } else {
            // Add song with next order number
            collection.songs = [
              ...collection.songs,
              {
                ...song,
                order: collection.songs.length + 1
              }
            ];
          }
        }
        return collection;
      });
      await AsyncStorage.setItem('user_collections', JSON.stringify(updatedCollections));
      setCollections(updatedCollections);
    } catch (error) {
      console.error('Error updating collection:', error);
    }
  };

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
          outputRange: [1, 0, -1],
        }),
      },
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
        icon={() => {
          const isInAnyCollection = collections.some(collection => 
            collection.songs?.some(s => s.id === song?.id)
          );
          return (
            <MaterialCommunityIcons 
              name={isInAnyCollection ? 'bookmark' : 'bookmark-outline'} 
              color="#fff" 
              size={25} 
            />
          );
        }}
        color={themeColors.primary}
        placement="right"
        onPress={handleFABClick}
      />

      <Modal
        visible={showCollectionsModal}
        transparent
        animationType="none"
        onRequestClose={closeCollectionsModal}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={closeCollectionsModal}
        >
          <Animated.View
            style={[
              styles.collectionsModal,
              {
                backgroundColor: themeColors.surface,
                transform: [{
                  translateY: slideUpAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [600, 0]
                  })
                }]
              }
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: themeColors.text }]}>Save to Collection</Text>
            </View>

            <View style={styles.newCollectionInput}>
              <TextInput
                style={[styles.input, { color: themeColors.text, borderColor: themeColors.border }]}
                placeholder="Create new collection..."
                placeholderTextColor={themeColors.placeholder}
                value={newCollectionName}
                onChangeText={setNewCollectionName}
              />
              <TouchableOpacity
                style={[styles.createButton, { backgroundColor: themeColors.primary }]}
                onPress={createNewCollection}
              >
                <Text style={{ color: '#fff' }}>Create</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={collections}
              keyExtractor={item => item.id}
              renderItem={({ item }) => {
                const isSavedInCollection = item.songs?.some(s => s.id === song?.id);
                return (
                  <TouchableOpacity
                    style={[styles.collectionItem, { borderBottomColor: themeColors.border }]}
                    onPress={() => toggleSongInCollection(item.id)}
                  >
                    <Text style={[styles.collectionName, { color: themeColors.text }]}>{item.name}</Text>
                    <MaterialCommunityIcons
                      name={isSavedInCollection ? 'check-circle' : 'circle-outline'}
                      size={24}
                      color={isSavedInCollection ? themeColors.primary : themeColors.text}
                    />
                  </TouchableOpacity>
                );
              }}
            />
          </Animated.View>
        </TouchableOpacity>
      </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  collectionsModal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  newCollectionInput: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 10,
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  collectionName: {
    fontSize: 16,
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
