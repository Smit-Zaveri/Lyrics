import React, { useState, useEffect, useRef, useContext, useCallback, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  FlatList,
  Animated,
  PanResponder,
  Easing,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FAB } from '@rneui/themed';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Sound from 'react-native-sound';
import CustomMaterialMenu from './CustomMaterialMenu';
import { ThemeContext } from '../../App';
import { LanguageContext } from '../context/LanguageContext';
import { Linking } from 'react-native';

const DetailPage = ({navigation, route}) => {
  const { themeColors } = useContext(ThemeContext);
  const { language, getString } = useContext(LanguageContext);
  const { itemNumberingparas, Lyrics } = route.params;

  const [itemNumbering, setItemNumbering] = useState(itemNumberingparas);
  const [song, setSong] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [slideAnim] = useState(new Animated.Value(0));
  const [opacityAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));
  const [fabAnim] = useState(new Animated.Value(1));
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

  // Function to get content in the user's selected language
  const getLocalizedContent = (item) => {
    if (!item) return '';
    
    // Handle array-based content structure
    if (Array.isArray(item.content)) {
      return getString(item.content);
    }
    
    // Fallback to string-based content for backward compatibility
    return item.content;
  };

  // Function to get title in the user's selected language
  const getLocalizedTitle = (item) => {
    if (!item) return '';
    
    // Handle array-based title structure
    if (Array.isArray(item.title)) {
      return getString(item.title);
    }
    
    // Fallback to string-based title for backward compatibility
    return item.title;
  };

  // Function to get artist in the user's selected language
  const getLocalizedArtist = (item) => {
    if (!item) return '';
    
    // Handle array-based artist structure
    if (Array.isArray(item.artist)) {
      return getString(item.artist);
    }
    
    // Fallback to string-based artist for backward compatibility
    return item.artist;
  };

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

  // Check if song is saved in any collection
  const checkIfSaved = useCallback(async () => {
    if (!song) return;
    
    try {
      const savedCollections = await AsyncStorage.getItem('user_collections');
      if (savedCollections) {
        const collections = JSON.parse(savedCollections);
        const isSavedInAny = collections.some(collection => 
          collection.songs?.some(s => s.id === song.id)
        );
        setIsSaved(isSavedInAny);
      }
    } catch (error) {
      console.error('Error checking saved status:', error);
    }
  }, [song]);

  useEffect(() => {
    checkIfSaved();
  }, [song, checkIfSaved]);

  // Header options with localized title
  const headerOptions = useCallback(
    () => ({
      headerTitle: `${itemNumbering}. ${getLocalizedTitle(song)}` || '',
      headerRight: () => (
        <CustomMaterialMenu
          menuText=""
          item={song}
          isIcon={true}
          theme={themeColors}
        />
      ),
    }),
    [navigation, route, song, themeColors, getString, itemNumbering]
  );

  useLayoutEffect(() => {
    navigation.setOptions(headerOptions());
  }, [navigation, headerOptions]);

  // Set song based on current numbering
  const setSongByNumbering = useCallback((number) => {
    return Lyrics.find(item => item.filteredIndex === number);
  }, [Lyrics]);

  useEffect(() => {
    const foundSong = setSongByNumbering(itemNumbering);
    setSong(foundSong);
  }, [itemNumbering, setSongByNumbering]);

  // Handle song navigation with animations
  const navigateSong = direction => {
    try {
      // Animate FAB out
      Animated.timing(fabAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();

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

        slideAnim.setValue(toValue * -1);

        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            easing: Easing.out(Easing.exp),
            useNativeDriver: true,
          }),
          Animated.timing(fabAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } catch (error) {
      console.error('Error navigating song:', error);
      // Reset FAB animation if error occurs
      Animated.timing(fabAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

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

  // Load font size from storage
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

  // Collection management
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
          const songIndex = collection.songs?.findIndex(s => s.id === song.id);
          if (songIndex === -1 || songIndex === undefined) {
            // Add song to collection
            return {
              ...collection,
              songs: [...(collection.songs || []), song]
            };
          } else {
            // Remove song from collection
            return {
              ...collection,
              songs: collection.songs.filter(s => s.id !== song.id)
            };
          }
        }
        return collection;
      });

      await AsyncStorage.setItem('user_collections', JSON.stringify(updatedCollections));
      setCollections(updatedCollections);
      await checkIfSaved();
    } catch (error) {
      console.error('Error toggling song in collection:', error);
    }
  };

  // Show collections modal with animation
  const handleFABClick = () => {
    setShowCollectionsModal(true);
    Animated.spring(slideUpAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7
    }).start();
  };

  const closeCollectionsModal = () => {
    Animated.timing(slideUpAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true
    }).start(() => setShowCollectionsModal(false));
  };

  // Audio playback functions
  const togglePlayback = async () => {
    if (!song.audio) return;

    try {
      if (sound) {
        if (isPlaying) {
          sound.pause();
          setIsPlaying(false);
        } else {
          sound.play((success) => {
            if (!success) {
              setAudioError('Playback failed');
              setIsPlaying(false);
            }
          });
          setIsPlaying(true);
        }
      } else {
        setIsLoading(true);
        const newSound = new Sound(song.audio, null, (error) => {
          setIsLoading(false);
          if (error) {
            setAudioError('Error loading audio');
            return;
          }
          setDuration(newSound.getDuration());
          newSound.play((success) => {
            if (!success) {
              setAudioError('Playback failed');
              setIsPlaying(false);
            }
          });
          setSound(newSound);
          setIsPlaying(true);

          // Start progress tracking
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          progressIntervalRef.current = setInterval(() => {
            newSound.getCurrentTime((seconds) => {
              if (!isSeeking) {
                setProgress(seconds);
                setSeekValue(seconds);
              }
            });
          }, 100);
        });
      }
    } catch (error) {
      console.error('Error handling playback:', error);
      setAudioError('Error playing audio');
      setIsLoading(false);
    }
  };

  const handleSeekComplete = async (value) => {
    setIsSeeking(false);
    if (sound) {
      sound.setCurrentTime(value);
      setProgress(value);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAutoScroll = () => {
    setAutoScroll(!autoScroll);
    if (!autoScroll && scrollViewRef.current) {
      let position = 0;
      const interval = setInterval(() => {
        if (!autoScroll) {
          clearInterval(interval);
          return;
        }
        position += 1;
        scrollViewRef.current.scrollTo({ y: position, animated: true });
      }, 100);
    }
  };

  const openYouTubeApp = async () => {
    if (!song?.youtube) return;
    
    try {
      await Linking.openURL(song.youtube);
    } catch (error) {
      console.error('Error opening YouTube:', error);
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
          outputRange: [300, 0, -300],
        }),
      },
      { scale: scaleAnim },
    ],
    opacity: opacityAnim,
  };

  const displayContent = getLocalizedContent(song);

  const renderAudioControls = () => {
    if (!song.audio) return null;

    return (
      <View style={styles.audioContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color={themeColors.primary} />
        ) : (
          <TouchableOpacity
            style={[styles.playButton, { backgroundColor: themeColors.primary }]}
            onPress={togglePlayback}
          >
            <MaterialCommunityIcons
              name={isPlaying ? 'pause' : 'play'}
              size={30}
              color="#fff"
            />
          </TouchableOpacity>
        )}
        {audioError && (
          <Text style={styles.errorText}>{audioError}</Text>
        )}
        {sound && (
          <View style={styles.sliderContainer}>
            <Text style={[styles.timeText, { color: themeColors.text }]}>
              {formatTime(progress)}
            </Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration}
              value={seekValue}
              onValueChange={(value) => {
                setIsSeeking(true);
                setSeekValue(value);
              }}
              onSlidingComplete={handleSeekComplete}
              minimumTrackTintColor={themeColors.primary}
              maximumTrackTintColor={themeColors.border}
            />
            <Text style={[styles.timeText, { color: themeColors.text }]}>
              {formatTime(duration)}
            </Text>
          </View>
        )}
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
          {song.artist ? 'રચનાર :' : ''} {getLocalizedArtist(song)}
        </Text>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 30 }}>
          <Text style={{ fontSize: fontSize, color: themeColors.text }} {...panResponder.panHandlers}>
            {displayContent}
          </Text>
        </ScrollView>
        {renderAudioControls()}
      </Animated.View>

      {song.youtube && (
        <Animated.View 
          style={[
            styles.fabContainer,
            styles.youtubeFab,
            { opacity: fabAnim, transform: [{ scale: fabAnim }] }
          ]}
        >
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: themeColors.primary }]}
            onPress={openYouTubeApp}
          >
            <MaterialCommunityIcons name="youtube" color="#fff" size={25} />
          </TouchableOpacity>
        </Animated.View>
      )}

      <Animated.View 
        style={[
          styles.fabContainer,
          { opacity: fabAnim, transform: [{ scale: fabAnim }] }
        ]}
      >
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: themeColors.primary }]}
          onPress={handleFABClick}
        >
          <MaterialCommunityIcons 
            name={collections.some(collection => 
              collection.songs?.some(s => s.id === song?.id)
            ) ? 'bookmark' : 'bookmark-outline'} 
            color="#fff" 
            size={25} 
          />
        </TouchableOpacity>
      </Animated.View>

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
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  createButton: {
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  collectionName: {
    fontSize: 16,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  youtubeFab: {
    marginBottom: 80,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DetailPage;
