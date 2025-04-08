import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
  useLayoutEffect,
} from 'react';
import {
  View,
  Text,
  Animated,
  Easing,
  PanResponder,
  ScrollView,
  Alert,
  TouchableOpacity,
  Modal,
  Pressable,
  Image,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Sound from 'react-native-sound';
import CustomMaterialMenu from './CustomMaterialMenu';
import {ThemeContext} from '../../App';
import {LanguageContext} from '../context/LanguageContext';
import {FontSizeContext} from '../context/FontSizeContext';
import {Linking} from 'react-native';
import {useSingerMode} from '../context/SingerModeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import sub-components
import {
  AudioPlayer,
  CollectionsModal,
  ActionButtons,
  NavigationHandler,
  RelatedSongs,
  MediaContent,
} from './DetailPageComponents';

const DetailPage = ({navigation, route}) => {
  const {themeColors} = useContext(ThemeContext);
  const {getString} = useContext(LanguageContext);
  const {fontSize} = useContext(FontSizeContext);
  const {isSingerMode} = useSingerMode();
  const {itemNumberingparas, Lyrics} = route.params;

  // Main state
  const [itemNumbering, setItemNumbering] = useState(itemNumberingparas);
  const [song, setSong] = useState(null);
  const [relatedSongs, setRelatedSongs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Collections state
  const [collections, setCollections] = useState([]);
  const [showCollectionsModal, setShowCollectionsModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [collectionError, setCollectionError] = useState('');
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Audio playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audioError, setAudioError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [seekValue, setSeekValue] = useState(0);

  // Animation values
  const [slideAnim] = useState(new Animated.Value(0));
  const [opacityAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));
  const [fabAnim] = useState(new Animated.Value(1));
  const slideUpAnim = useRef(new Animated.Value(0)).current;

  // Refs
  const scrollViewRef = useRef(null);
  const progressIntervalRef = useRef(null);

  // Add state to track updates
  const [refreshKey, setRefreshKey] = useState(0);

  // Helper function to shuffle an array (Fisher-Yates algorithm)
  const shuffleArray = array => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Function to refresh song data
  const refreshSongData = useCallback(async () => {
    if (!song || !song.id) return;

    try {
      let updatedSong = null;

      const addedSongsData = await AsyncStorage.getItem(
        'cachedData_added-songs',
      );
      if (addedSongsData) {
        const addedSongs = JSON.parse(addedSongsData);
        updatedSong = addedSongs.find(s => s.id === song.id);
      }

      if (!updatedSong) {
        const lyricsData = await AsyncStorage.getItem('cachedData_lyrics');
        if (lyricsData) {
          const lyrics = JSON.parse(lyricsData);
          updatedSong = lyrics.find(s => s.id === song.id);
        }
      }

      if (updatedSong) {
        setSong(updatedSong);

        const updatedLyrics = Lyrics.map(item =>
          item.id === updatedSong.id ? updatedSong : item,
        );

        if (isSingerMode) {
          const findNumericTag = tags => {
            if (!tags || !Array.isArray(tags)) return null;

            for (const tag of tags) {
              const tagValue = Array.isArray(tag) ? getString(tag) : tag;
              if (/^[1-9]$/.test(tagValue)) {
                return tagValue;
              }
            }
            return null;
          };

          const songNumericTag = findNumericTag(updatedSong.tags);

          if (songNumericTag) {
            const matchingSongs = updatedLyrics.filter(
              item =>
                item.id !== updatedSong.id &&
                Array.isArray(item.tags) &&
                item.tags.some(tag => {
                  const tagValue = Array.isArray(tag) ? getString(tag) : tag;
                  return tagValue === songNumericTag;
                }),
            );

            const related = shuffleArray(matchingSongs).slice(0, 5);

            setRelatedSongs(related);
          }
        }
      }
    } catch (error) {
      console.error('Error refreshing song data:', error);
    }
  }, [song, Lyrics, isSingerMode, getString]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route.params?.songUpdated) {
        refreshSongData();

        navigation.setParams({
          songUpdated: undefined,
          listNeedsRefresh: true,
          updatedSongId: route.params?.updatedSongId || (song ? song.id : null),
        });
      }
    });

    return unsubscribe;
  }, [navigation, refreshSongData, route.params?.songUpdated, song]);

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

  const getLocalizedContent = item => {
    if (!item) return '';

    if (Array.isArray(item.content)) {
      return getString(item.content);
    }

    return item.content;
  };

  const getLocalizedTitle = item => {
    if (!item) return '';

    if (Array.isArray(item.title)) {
      return getString(item.title);
    }

    return item.title;
  };

  const getLocalizedArtist = item => {
    if (!item) return '';

    if (Array.isArray(item.artist)) {
      return getString(item.artist);
    }

    return item.artist;
  };

  const getDisplayNumber = useCallback(songItem => {
    if (!songItem) return '';

    if (
      songItem.displayNumbering !== null &&
      songItem.displayNumbering !== undefined
    ) {
      return songItem.displayNumbering.toString();
    } else if (songItem.order !== null && songItem.order !== undefined) {
      return songItem.order.toString();
    } else if (
      songItem.numbering !== null &&
      songItem.numbering !== undefined
    ) {
      return songItem.numbering.toString();
    } else if (
      songItem.filteredIndex !== null &&
      songItem.filteredIndex !== undefined
    ) {
      return songItem.filteredIndex.toString();
    } else {
      return '1';
    }
  }, []);

  const isImageDataUrl = url => {
    return url && url.startsWith('data:image/');
  };

  const isAudioDataUrl = url => {
    return url && url.startsWith('data:audio/');
  };

  const getMediaFormat = url => {
    if (!url || !url.startsWith('data:')) return null;

    const parts = url.split(',')[0].split(':')[1].split(';')[0];
    return parts;
  };

  const hasMultipleImages = songItem => {
    return (
      songItem &&
      songItem.images &&
      Array.isArray(songItem.images) &&
      songItem.images.length > 0
    );
  };

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

  const headerOptions = useCallback(
    () => ({
      headerTitle: song
        ? `${getDisplayNumber(song)}. ${getLocalizedTitle(song)}`
        : '',
      headerRight: () =>
        song && (
          <CustomMaterialMenu
            menuText=""
            item={song}
            isIcon={true}
            theme={themeColors}
          />
        ),
    }),
    [song, themeColors, getDisplayNumber],
  );

  useLayoutEffect(() => {
    navigation.setOptions(headerOptions());
  }, [navigation, headerOptions]);

  const setSongByNumbering = useCallback(
    number => {
      return Lyrics.find(item => item.filteredIndex === number);
    },
    [Lyrics],
  );

  useEffect(() => {
    const foundSong = setSongByNumbering(itemNumbering);
    setSong(foundSong);

    if (foundSong && isSingerMode) {
      const findNumericTag = tags => {
        if (!tags || !Array.isArray(tags)) return null;

        for (const tag of tags) {
          const tagValue = Array.isArray(tag) ? getString(tag) : tag;
          if (/^[1-9]$/.test(tagValue)) {
            return tagValue;
          }
        }
        return null;
      };

      const songNumericTag = findNumericTag(foundSong.tags);

      if (songNumericTag) {
        const matchingSongs = Lyrics.filter(
          item =>
            item.id !== foundSong.id &&
            Array.isArray(item.tags) &&
            item.tags.some(tag => {
              const tagValue = Array.isArray(tag) ? getString(tag) : tag;
              return tagValue === songNumericTag;
            }),
        );

        const related = shuffleArray(matchingSongs).slice(0, 5);

        setRelatedSongs(related);
      } else {
        setRelatedSongs([]);
      }
    } else {
      setRelatedSongs([]);
    }
  }, [itemNumbering, setSongByNumbering, isSingerMode, Lyrics, getString]);

  useEffect(() => {
    let hasNavigated = false;
    let isAnimating = false;

    const unsubscribe = navigation.addListener('beforeRemove', e => {
      if (hasNavigated || isAnimating) return;
      hasNavigated = true;

      const currentIndex = parseInt(itemNumbering, 10);

      e.preventDefault();

      isAnimating = true;

      Animated.sequence([
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 0.7,
            duration: 220,
            useNativeDriver: true,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.98,
            duration: 220,
            useNativeDriver: true,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
          }),
        ]),
        Animated.timing(opacityAnim, {
          toValue: 0.4,
          duration: 120,
          useNativeDriver: true,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
      ]).start(() => {
        setTimeout(() => {
          navigation.navigate({
            name: route.params?.previousScreen || 'List',
            params: {
              returnToIndex: currentIndex,
              transitionType: 'fade',
              updatedFilters: true,
              listNeedsRefresh:
                route.params?.songUpdated ||
                route.params?.listNeedsRefresh ||
                false,
              updatedSongId:
                route.params?.updatedSongId || (song ? song.id : null),
            },
            merge: true,
          });
        }, 50);
      });
    });

    return unsubscribe;
  }, [navigation, itemNumbering, opacityAnim, scaleAnim, route.params, song]);

  const navigateSong = direction => {
    try {
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
          const currentSong = Lyrics.find(
            item => item.filteredIndex === currentIndex,
          );

          const currentPosition = currentSong
            ? Lyrics.findIndex(item => item.stableId === currentSong.stableId)
            : -1;

          if (currentPosition === -1) {
            let newIndex = currentIndex + toValue;
            if (newIndex < 1) {
              newIndex = Lyrics.length;
            } else if (newIndex > Lyrics.length) {
              newIndex = 1;
            }
            return newIndex;
          }

          let nextPosition = currentPosition + toValue;

          if (nextPosition < 0) {
            nextPosition = Lyrics.length - 1;
          } else if (nextPosition >= Lyrics.length) {
            nextPosition = 0;
          }

          const nextSong = Lyrics[nextPosition];
          return nextSong ? nextSong.filteredIndex : 1;
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
      Animated.timing(fabAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;

    try {
      const collectionExists = collections.some(
        collection =>
          collection.name.toLowerCase() ===
          newCollectionName.trim().toLowerCase(),
      );

      if (collectionExists) {
        setHasError(true);
        setErrorMessage('Collection with this name already exists');
        return;
      }

      setHasError(false);
      setErrorMessage('');

      const newCollection = {
        id: Date.now().toString(),
        name: newCollectionName.trim(),
        songs: [],
      };
      const updatedCollections = [...collections, newCollection];
      await AsyncStorage.setItem(
        'user_collections',
        JSON.stringify(updatedCollections),
      );
      setCollections(updatedCollections);
      setNewCollectionName('');
    } catch (error) {
      console.error('Error creating collection:', error);
      setCollectionError('Error creating collection');
    }
  };

  const handleCollectionNameChange = text => {
    setNewCollectionName(text);
    setHasError(false);
  };

  const toggleSongInCollection = async collectionId => {
    try {
      const updatedCollections = collections.map(collection => {
        if (collection.id === collectionId) {
          const songIndex = collection.songs?.findIndex(s => s.id === song.id);
          if (songIndex === -1 || songIndex === undefined) {
            return {
              ...collection,
              songs: [...(collection.songs || []), song],
            };
          } else {
            return {
              ...collection,
              songs: collection.songs.filter(s => s.id !== song.id),
            };
          }
        }
        return collection;
      });

      await AsyncStorage.setItem(
        'user_collections',
        JSON.stringify(updatedCollections),
      );
      setCollections(updatedCollections);
    } catch (error) {
      console.error('Error toggling song in collection:', error);
    }
  };

  const handleFABClick = () => {
    setShowCollectionsModal(true);
    Animated.spring(slideUpAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
  };

  const closeCollectionsModal = () => {
    Animated.timing(slideUpAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowCollectionsModal(false));
  };

  const togglePlayback = async () => {
    if (!song?.audio) return;

    try {
      if (sound) {
        if (isPlaying) {
          sound.pause();
          setIsPlaying(false);
        } else {
          sound.play(success => {
            if (!success) {
              setAudioError('Playback failed');
              setIsPlaying(false);
            }
          });
          setIsPlaying(true);
        }
      } else {
        setIsLoading(true);
        const newSound = new Sound(song.audio, null, error => {
          setIsLoading(false);
          if (error) {
            setAudioError('Error loading audio');
            return;
          }
          setDuration(newSound.getDuration());
          newSound.play(success => {
            if (!success) {
              setAudioError('Playback failed');
              setIsPlaying(false);
            }
          });
          setSound(newSound);
          setIsPlaying(true);

          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
          progressIntervalRef.current = setInterval(() => {
            newSound.getCurrentTime(seconds => {
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

  const handleSeekValueChange = value => {
    setIsSeeking(true);
    setSeekValue(value);
  };

  const handleSeekComplete = async value => {
    setIsSeeking(false);
    if (sound) {
      sound.setCurrentTime(value);
      setProgress(value);
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

  const deleteSong = async () => {
    if (!song) return;

    Alert.alert(
      'Delete Song',
      'Are you sure you want to delete this song? This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);

              const lyricsData =
                await AsyncStorage.getItem('cachedData_lyrics');
              if (lyricsData) {
                const lyrics = JSON.parse(lyricsData);
                const updatedLyrics = lyrics.filter(
                  item => item.id !== song.id,
                );
                await AsyncStorage.setItem(
                  'cachedData_lyrics',
                  JSON.stringify(updatedLyrics),
                );
              }

              const addedSongsData = await AsyncStorage.getItem(
                'cachedData_added-songs',
              );
              if (addedSongsData) {
                const addedSongs = JSON.parse(addedSongsData);
                const updatedAddedSongs = addedSongs.filter(
                  item => item.id !== song.id,
                );
                await AsyncStorage.setItem(
                  'cachedData_added-songs',
                  JSON.stringify(updatedAddedSongs),
                );
              }

              navigation.goBack();
            } catch (error) {
              console.error('Error deleting song:', error);
              Alert.alert('Error', 'Failed to delete song. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
      {cancelable: true},
    );
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

  const translateXValue = slideAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [175, 0, -175],
  });

  const animatedStyle = {
    paddingHorizontal: 20,
    paddingBottom: 20,
    opacity: opacityAnim,
    transform: [{translateX: translateXValue}, {scale: scaleAnim}],
  };

  return (
    <NavigationHandler onNavigate={navigateSong}>
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
              fontSize: getLocalizedArtist(song) ? 16 : 0,
              marginBottom: getLocalizedArtist(song) ? 10 : 0,
              color: themeColors.text,
            }}>
            {getLocalizedArtist(song) ? 'રચનાર :' : null}{' '}
            {getLocalizedArtist(song)}
          </Text>
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 30}}>
            <Text
              style={{
                fontSize: fontSize,
                textAlign: '',
                color: themeColors.text,
              }}
              {...panResponder.panHandlers}>
              {getLocalizedContent(song)}
            </Text>

            {(song.mediaUrl || hasMultipleImages(song)) && (
              <MediaContent
                mediaUrl={song.mediaUrl}
                themeColors={themeColors}
                images={song.images}
              />
            )}

            {isSingerMode && relatedSongs.length > 0 && (
              <View style={{marginTop: 60}}>
                <RelatedSongs
                  relatedSongs={relatedSongs}
                  themeColors={themeColors}
                  onSongPress={relatedSong => {
                    setItemNumbering(relatedSong.filteredIndex);
                    scrollViewRef.current?.scrollTo({
                      x: 0,
                      y: 0,
                      animated: true,
                    });
                  }}
                  getLocalizedTitle={getLocalizedTitle}
                  getDisplayNumber={getDisplayNumber}
                />
              </View>
            )}
          </ScrollView>
        </Animated.View>

        <AudioPlayer
          song={song}
          sound={sound}
          isPlaying={isPlaying}
          isLoading={isLoading}
          audioError={audioError}
          progress={progress}
          duration={duration}
          seekValue={seekValue}
          themeColors={themeColors}
          onTogglePlayback={togglePlayback}
          onSeekValueChange={handleSeekValueChange}
          onSeekComplete={handleSeekComplete}
        />

        <ActionButtons
          song={song}
          collections={collections}
          fabAnim={fabAnim}
          themeColors={themeColors}
          onBookmarkPress={handleFABClick}
          onYoutubePress={openYouTubeApp}
        />

        {isSingerMode && song?.collectionName === 'added-songs' && (
          <View
            style={{
              position: 'absolute',
              bottom: 80,
              right: 16,
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
            }}>
            <TouchableOpacity
              style={{
                backgroundColor: '#4CAF50',
                borderRadius: 50,
                padding: 15,
                elevation: 5,
              }}
              onPress={() => {
                navigation.navigate('AddSong', {
                  songToEdit: song,
                  isEditing: true,
                  returnToDetailPage: true,
                  returnScreen: 'DetailPage',
                  previousScreen: route.params?.previousScreen || 'List',
                });
              }}>
              <Icon name="edit" size={24} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: '#FF5252',
                borderRadius: 50,
                padding: 15,
                elevation: 5,
              }}
              onPress={deleteSong}>
              <Icon name="delete" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        <CollectionsModal
          visible={showCollectionsModal}
          themeColors={themeColors}
          collections={collections}
          newCollectionName={newCollectionName}
          slideUpAnim={slideUpAnim}
          song={song}
          onClose={closeCollectionsModal}
          onNewCollectionNameChange={handleCollectionNameChange}
          onCreateCollection={handleCreateCollection}
          onToggleCollection={toggleSongInCollection}
          collectionError={collectionError}
          hasError={hasError}
          errorMessage={errorMessage}
          onClearError={() => setCollectionError('')}
        />
      </View>
    </NavigationHandler>
  );
};

export default DetailPage;
