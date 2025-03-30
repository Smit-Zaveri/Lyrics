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
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Sound from 'react-native-sound';
import CustomMaterialMenu from './CustomMaterialMenu';
import {ThemeContext} from '../../App';
import {LanguageContext} from '../context/LanguageContext';
import {Linking} from 'react-native';

// Import sub-components
import {
  AudioPlayer,
  CollectionsModal,
  ActionButtons,
  NavigationHandler,
} from './DetailPageComponents';

const DetailPage = ({navigation, route}) => {
  const {themeColors} = useContext(ThemeContext);
  const {getString} = useContext(LanguageContext);
  const {itemNumberingparas, Lyrics} = route.params;

  // Main state
  const [itemNumbering, setItemNumbering] = useState(itemNumberingparas);
  const [song, setSong] = useState(null);
  const [fontSize, setFontSize] = useState(18);

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

  // Function to get content in the user's selected language
  const getLocalizedContent = item => {
    if (!item) return '';

    // Handle array-based content structure
    if (Array.isArray(item.content)) {
      return getString(item.content);
    }

    // Fallback to string-based content for backward compatibility
    return item.content;
  };

  // Function to get title in the user's selected language
  const getLocalizedTitle = item => {
    if (!item) return '';

    // Handle array-based title structure
    if (Array.isArray(item.title)) {
      return getString(item.title);
    }

    // Fallback to string-based title for backward compatibility
    return item.title;
  };

  // Function to get artist in the user's selected language
  const getLocalizedArtist = item => {
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
    loadFontSize();
  }, []);

  const loadFontSize = async () => {
    try {
      const savedFontSize = await AsyncStorage.getItem('fontSize');
      if (savedFontSize) {
        setFontSize(parseInt(savedFontSize, 10));
      }
    } catch (error) {
      console.error('Error loading font size:', error);
    }
  };

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

  // Header options with localized title
  const headerOptions = useCallback(
    () => ({
      headerTitle: song ? `${itemNumbering}. ${getLocalizedTitle(song)}` : '',
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
    [song, itemNumbering, themeColors],
  );

  useLayoutEffect(() => {
    navigation.setOptions(headerOptions());
  }, [navigation, headerOptions]);

  // Set song based on current numbering
  const setSongByNumbering = useCallback(
    number => {
      return Lyrics.find(item => item.filteredIndex === number);
    },
    [Lyrics],
  );

  useEffect(() => {
    const foundSong = setSongByNumbering(itemNumbering);
    setSong(foundSong);
  }, [itemNumbering, setSongByNumbering]);

  // Update the beforeRemove handler for smoother transitions
  useEffect(() => {
    let hasNavigated = false;
    let isAnimating = false;

    const unsubscribe = navigation.addListener('beforeRemove', e => {
      // Prevent handling the event multiple times or during animation
      if (hasNavigated || isAnimating) return;
      hasNavigated = true;

      // Store the current index
      const currentIndex = itemNumbering;

      // Cancel the default navigation behavior
      e.preventDefault();

      // Add a smoother fade out animation
      isAnimating = true;

      // Sequential animations for smoother transition
      Animated.sequence([
        // First gently fade and scale for a more natural transition
        Animated.parallel([
          Animated.timing(opacityAnim, {
            toValue: 0.7,
            duration: 220, // Slightly longer for smoother effect
            useNativeDriver: true,
            easing: Easing.bezier(0.4, 0, 0.2, 1), // Material Design natural easing
          }),
          Animated.timing(scaleAnim, {
            toValue: 0.98, // Subtle scale change
            duration: 220,
            useNativeDriver: true,
            easing: Easing.bezier(0.4, 0, 0.2, 1),
          }),
        ]),
        // Then continue fading to complete the transition
        Animated.timing(opacityAnim, {
          toValue: 0.4,
          duration: 120,
          useNativeDriver: true,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
      ]).start(() => {
        // Then navigate back with the current index
        setTimeout(() => {
          navigation.navigate({
            name: route.params?.previousScreen || 'List',
            params: {
              returnToIndex: currentIndex,
              transitionType: 'fade',
            },
            merge: true,
          });
        }, 50); // Short delay before navigation completes the effect
      });
    });

    return unsubscribe;
  }, [navigation, itemNumbering, opacityAnim, scaleAnim]);

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
        // Change to next/previous song
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

        // Reset slide position for entry animation
        slideAnim.setValue(toValue * -1);

        // Animate back in
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

  // Collection management
  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) return;

    try {
      // Check if collection name already exists
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

      // Reset error message
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
            // Add song to collection
            return {
              ...collection,
              songs: [...(collection.songs || []), song],
            };
          } else {
            // Remove song from collection
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

  // Show collections modal with animation
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

  // Audio playback functions
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

          // Start progress tracking
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

  // Define a specific value for translateX based on animation instead of passing Animated.Value directly
  const translateXValue = slideAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: [-300, 0, 300],
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
        {/* Lyrics Content */}
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
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{paddingBottom: 30}}>
            <Text
              style={{fontSize: 18, textAlign: '', color: themeColors.text}}
              {...panResponder.panHandlers}>
              {getLocalizedContent(song)}
            </Text>
          </ScrollView>
        </Animated.View>

        {/* Audio Player */}
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

        {/* Action Buttons (FABs) */}
        <ActionButtons
          song={song}
          collections={collections}
          fabAnim={fabAnim}
          themeColors={themeColors}
          onBookmarkPress={handleFABClick}
          onYoutubePress={openYouTubeApp}
        />

        {/* Collections Modal */}
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
