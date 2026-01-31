/**
 * DetailPage Component
 *
 * Displays detailed view of a song including lyrics, media content,
 * collections management, and navigation between songs. Supports singer mode with
 * related songs based on numeric tags.
 *
 * Features:
 * - Song lyrics display with localization support
 * - Swipe navigation between songs
 * - Collections management (add/remove songs)
 * - Edit and delete functionality for user-added songs
 * - Media content display (images/videos)
 * - Related songs in singer mode
 * - Smooth animations for transitions
 */
import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useCallback,
  useLayoutEffect,
  useMemo,
} from 'react';
import {
  View,
  Text,
  Animated,
  Easing,
  PanResponder,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomMaterialMenu from './CustomMaterialMenu';
import {ThemeContext} from '../../App';
import {LanguageContext} from '../context/LanguageContext';
import {FontSizeContext} from '../context/FontSizeContext';
import {Linking} from 'react-native';
import {useSingerMode} from '../context/SingerModeContext';

// Import sub-components
import {
  CollectionsModal,
  ActionButtons,
  NavigationHandler,
  RelatedSongs,
  MediaContent,
  DeleteConfirmationModal,
} from './DetailPageComponents';

// ==================== Helper Functions ====================

// Helper function: Seeded random generator (Mulberry32)
function seededRandom(seed) {
  let t = seed;
  return function () {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

// Helper function to shuffle an array using a seeded random
const shuffleArray = (array, seedStr) => {
  // Convert seed string to a number
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = (hash << 5) - hash + seedStr.charCodeAt(i);
    hash |= 0;
  }
  const rand = seededRandom(hash);
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Helper function to find related songs in singer mode
const findRelatedSongs = (song, Lyrics, getString) => {
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

  const songNumericTag = findNumericTag(song.tags);

  if (songNumericTag) {
    const matchingSongs = Lyrics.filter(
      item =>
        item.id !== song.id &&
        Array.isArray(item.tags) &&
        item.tags.some(tag => {
          const tagValue = Array.isArray(tag) ? getString(tag) : tag;
          return tagValue === songNumericTag;
        }),
    );

    // Use seeded shuffle for consistency
    const now = new Date();
    const hour = now.getHours();
    const songOrder =
      song.filteredIndex || song.order || song.numbering || 1;
    const seedStr = `${hour}-${songOrder}`;
    return shuffleArray(matchingSongs, seedStr).slice(0, 5);
  }

  return [];
};

// ==================== Main Component ====================

const DetailPage = ({navigation, route}) => {
  // ==================== Contexts and Hooks ====================
  const {themeColors} = useContext(ThemeContext);
  const {getString} = useContext(LanguageContext);
  const {fontSize} = useContext(FontSizeContext);
  const {isSingerMode} = useSingerMode();
  const {itemNumberingparas, Lyrics} = route.params;

  // ==================== State Variables ====================
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

  // ==================== Animation Values ====================
  const [slideAnim] = useState(new Animated.Value(0));
  const [opacityAnim] = useState(new Animated.Value(1));
  const [scaleAnim] = useState(new Animated.Value(1));
  const [fabAnim] = useState(new Animated.Value(1));
  const slideUpAnim = useRef(new Animated.Value(0)).current;
  const [editFabAnim] = useState(new Animated.Value(1));
  const [deleteFabAnim] = useState(new Animated.Value(1));

  // ==================== Refs ====================
  const scrollViewRef = useRef(null);

  // Add new state for delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // ==================== Effects ====================

  /**
   * Refreshes the current song data from AsyncStorage and updates related songs if in singer mode.
   */
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
          const related = findRelatedSongs(updatedSong, updatedLyrics, getString);
          setRelatedSongs(related);
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

  // ==================== Helper Functions ====================

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => Lyrics.length > 1,
        onMoveShouldSetPanResponder: (evt, gestureState) => {
          return (
            Lyrics.length > 1 &&
            Math.abs(gestureState.dx) > Math.abs(gestureState.dy)
          );
        },
        onPanResponderRelease: (e, gestureState) => {
          if (Lyrics.length <= 1) return;
          if (gestureState.dx > 50) {
            navigateSong('prev');
          } else if (gestureState.dx < -50) {
            navigateSong('next');
          }
        },
      }),
    [Lyrics.length],
  );

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

  // ==================== Event Handlers ====================

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
      const related = findRelatedSongs(foundSong, Lyrics, getString);
      setRelatedSongs(related);
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

  /**
   * Navigates to the next or previous song with smooth animations.
   * @param {string} direction - 'next' or 'prev'
   */
  const navigateSong = direction => {
    if (Lyrics.length <= 1) return;
    try {
      // Animate all FABs out
      Animated.parallel([
        Animated.timing(fabAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(editFabAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(deleteFabAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

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
          // Animate all FABs back in
          Animated.timing(fabAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(editFabAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(deleteFabAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      });
    } catch (error) {
      console.error('Error navigating song:', error);
      // Reset all FAB animations on error
      Animated.parallel([
        Animated.timing(fabAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(editFabAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(deleteFabAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
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

  const openYouTubeApp = async () => {
    if (!song?.youtube) return;

    try {
      await Linking.openURL(song.youtube);
    } catch (error) {
      console.error('Error opening YouTube:', error);
    }
  };

  const deleteSong = async () => {
    try {
      setLoading(true);

      const lyricsData = await AsyncStorage.getItem('cachedData_lyrics');
      if (lyricsData) {
        const lyrics = JSON.parse(lyricsData);
        const updatedLyrics = lyrics.filter(item => item.id !== song.id);
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
  };

  // ==================== Render ====================

  if (!song) {
    return (
      <View
        style={[
          styles.loadingContainer,
          {backgroundColor: themeColors.background},
        ]}>
        <Text style={[styles.loadingText, {color: themeColors.text}]}>
          Loading...
        </Text>
      </View>
    );
  }

  const translateXValue = slideAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [175, 0, -175],
  });

  const animatedStyle = {
    flex: 1,
    opacity: opacityAnim,
    transform: [{translateX: translateXValue}, {scale: scaleAnim}],
  };

  return (
    <NavigationHandler onNavigate={navigateSong}>
      <View
        style={[styles.container, {backgroundColor: themeColors.background}]}
        {...panResponder.panHandlers}>
        <Animated.View style={animatedStyle}>
          {getLocalizedArtist(song) && (
            <View style={styles.artistContainer}>
              <Text
                style={[
                  styles.artistLabel,
                  {color: themeColors.textSecondary},
                ]}>
                રચનાર
              </Text>
              <Text style={[styles.artistName, {color: themeColors.text}]}>
                {getLocalizedArtist(song)}
              </Text>
            </View>
          )}
          <ScrollView
            ref={scrollViewRef}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}>
            <Text
              style={[
                styles.contentText,
                {fontSize: fontSize, color: themeColors.text},
              ]}
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
              <View style={styles.relatedSongsContainer}>
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

        <ActionButtons
          song={song}
          collections={collections}
          fabAnim={fabAnim}
          editFabAnim={editFabAnim}
          deleteFabAnim={deleteFabAnim}
          themeColors={themeColors}
          onBookmarkPress={handleFABClick}
          onYoutubePress={openYouTubeApp}
          onEditPress={() => {
            navigation.navigate('AddSong', {
              songToEdit: song,
              isEditing: true,
              returnToDetailPage: true,
              returnScreen: 'DetailPage',
              previousScreen: route.params?.previousScreen || 'List',
            });
          }}
          onDeletePress={() => setShowDeleteModal(true)}
          showEditDelete={
            isSingerMode && song?.collectionName === 'added-songs'
          }
        />

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

        <DeleteConfirmationModal
          visible={showDeleteModal}
          themeColors={themeColors}
          onClose={() => setShowDeleteModal(false)}
          onDelete={deleteSong}
        />
      </View>
    </NavigationHandler>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  artistContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  artistLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  artistName: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  contentText: {
    marginTop: 12,
    lineHeight: 32,
  },
  relatedSongsContainer: {
    marginTop: 48,
  },
});

export default DetailPage;
