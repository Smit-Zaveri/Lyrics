import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  useRef,
} from 'react';
import {
  FlatList,
  SafeAreaView,
  RefreshControl,
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  Animated,
  Easing,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {getFromAsyncStorage} from '../config/DataService';
import TagItem from './TagItem';
import ListItem from './ListItem';
import EmptyList from './EmptyList';
import {ThemeContext} from '../../App';
import {LanguageContext} from '../context/LanguageContext';
import {useSingerMode} from '../context/SingerModeContext';

const List = ({route}) => {
  const {collectionName, Tags, title, customLyrics, returnToIndex} =
    route.params || {};
  const navigation = useNavigation();
  const {themeColors} = useContext(ThemeContext);
  const {getString, language} = useContext(LanguageContext);
  const {isSingerMode} = useSingerMode();

  const flatListRef = useRef(null);
  const initialScrollDone = useRef(false);
  const highlightedItemId = useRef(null);

  const [highlightAnim] = useState(new Animated.Value(0));

  const [header, setHeader] = useState(true);
  const [lyrics, setLyrics] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const filterAndSortLyrics = (tags, lyrics) => {
    if (!lyrics || !Array.isArray(lyrics)) {
      return [];
    }

    const filteredItems = lyrics.filter(item => {
      if (!item) return false;

      if (tags.length === 0) return true;

      return tags.every(selectedTag => {
        const itemTags = Array.isArray(item.tags) ? item.tags : [];
        const hasTag = itemTags.some(tag => {
          if (Array.isArray(tag)) {
            const localizedTag = getString(tag);
            return localizedTag.toLowerCase() === selectedTag.toLowerCase();
          }
          return (
            tag &&
            selectedTag &&
            tag.toLowerCase() === selectedTag.toLowerCase()
          );
        });

        let collectionMatch = false;
        if (item.collectionName) {
          if (Array.isArray(item.collectionName)) {
            const localizedName = getString(item.collectionName);
            collectionMatch =
              localizedName.toLowerCase() === selectedTag.toLowerCase();
          } else {
            collectionMatch =
              item.collectionName.toLowerCase() === selectedTag.toLowerCase();
          }
        }

        return hasTag || collectionMatch;
      });
    });

    const sortedItems = filteredItems.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return (a.numbering || 0) - (b.numbering || 0);
    });

    return sortedItems.map((item, index) => ({
      ...item,
      displayNumbering: item.order || item.numbering || index + 1,
      filteredIndex: index + 1,
    }));
  };

  const getFilteredLyrics = useCallback(
    (items, selectedTag) => {
      if (!selectedTag) return items;

      const filteredItems = items.filter(item => {
        const hasTag = item.tags?.some(tag => {
          if (Array.isArray(tag)) {
            const localizedTag = getString(tag);
            return localizedTag.toLowerCase() === selectedTag.toLowerCase();
          }
          return tag.toLowerCase() === selectedTag.toLowerCase();
        });

        let collectionMatch = false;
        if (item.collectionName) {
          if (Array.isArray(item.collectionName)) {
            const localizedName = getString(item.collectionName);
            collectionMatch =
              localizedName.toLowerCase() === selectedTag.toLowerCase();
          } else {
            collectionMatch =
              item.collectionName.toLowerCase() === selectedTag.toLowerCase();
          }
        }

        return hasTag || collectionMatch;
      });

      const sortedItems = filteredItems.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) {
          return a.order - b.order;
        }
        if (a.numbering !== undefined && b.numbering !== undefined) {
          return a.numbering - b.numbering;
        }
        return 0;
      });

      return sortedItems.map((item, index) => ({
        ...item,
        displayNumbering: item.order || item.numbering || index + 1,
        filteredIndex: index + 1,
      }));
    },
    [getString],
  );

  const loadData = async () => {
    try {
      setIsLoading(true);
      setRefreshing(true);
      setError(null);

      if (customLyrics) {
        setLyrics(Array.isArray(customLyrics) ? customLyrics : []);
        setTags([]);
      } else {
        const fetchedDataTags = await getFromAsyncStorage(Tags);
        const fetchedDataLyrics = await getFromAsyncStorage(collectionName);

        const tagsArray = Array.isArray(fetchedDataTags) ? fetchedDataTags : [];

        // Add numbered tags when Singer Mode is enabled
        const numberTags = isSingerMode
          ? [
              {id: 'num4', name: '4', displayName: '4'},
              {id: 'num3', name: '3', displayName: '3'},
              {id: 'num2', name: '2', displayName: '2'},
              {id: 'num1', name: '1', displayName: '1'},
            ]
          : [];

        const sortedTags = [...numberTags, ...tagsArray]
          .sort((a, b) => {
            // Keep number tags at the start
            if (a.id?.startsWith('num')) return -1;
            if (b.id?.startsWith('num')) return 1;

            const numA = a.numbering !== undefined ? a.numbering : 0;
            const numB = b.numbering !== undefined ? b.numbering : 0;
            return numA - numB;
          })
          .map(tag => ({
            ...tag,
            displayName: Array.isArray(tag.displayName)
              ? getString(tag.displayName)
              : tag.displayName || tag.name,
          }));

        const allLyrics = Array.isArray(fetchedDataLyrics)
          ? fetchedDataLyrics
          : [];
        const hasValidOrder =
          allLyrics.length > 0 &&
          allLyrics.every(
            (item, index, arr) =>
              item.order !== undefined &&
              item.order !== null &&
              typeof item.order === 'number' &&
              arr.filter(({order}) => order === item.order).length === 1,
          );

        const lyricsWithNumbering = hasValidOrder
          ? allLyrics
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map(item => ({...item, numbering: item.order}))
          : allLyrics.map((item, index) => ({
              ...item,
              numbering: index + 1,
            }));

        setLyrics(lyricsWithNumbering);
        setTags(sortedTags);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Pull down to refresh.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [Tags, collectionName]);

  useEffect(() => {
    if (!customLyrics && tags.length > 0) {
      const updateTagsForLanguageChange = async () => {
        try {
          const fetchedDataTags = await getFromAsyncStorage(Tags);
          if (Array.isArray(fetchedDataTags) && fetchedDataTags.length > 0) {
            const updatedTags = [...fetchedDataTags].sort((a, b) => {
              const numA = a.numbering !== undefined ? a.numbering : 0;
              const numB = b.numbering !== undefined ? b.numbering : 0;
              return numA - numB;
            });
            setTags(updatedTags);
          }
        } catch (error) {
          console.error('Error updating tags for language change:', error);
        }
      };

      updateTagsForLanguageChange();
    }
  }, [language, Tags, customLyrics]);

  const filteredLyrics = filterAndSortLyrics(selectedTags, lyrics);

  const smoothScrollToIndex = useCallback(
    (index, highlightAfter = true) => {
      if (!flatListRef.current || index < 0) return;

      try {
        flatListRef.current.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.3,
          viewOffset: 20,
        });

        if (highlightAfter && index >= 0 && index < filteredLyrics.length) {
          const itemToHighlight = filteredLyrics[index];
          highlightedItemId.current =
            itemToHighlight.id?.toString() || `item-${index}`;

          highlightAnim.setValue(0);

          setTimeout(() => {
            Animated.sequence([
              Animated.timing(highlightAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
                easing: Easing.bezier(0.2, 0, 0.2, 1),
              }),
              Animated.timing(highlightAnim, {
                toValue: 0,
                duration: 1000,
                useNativeDriver: true,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
              }),
            ]).start(() => {
              highlightedItemId.current = null;
            });
          }, 600);
        }
      } catch (error) {
        console.warn('Scroll failed, using fallback', error);

        const estimatedOffset = index * 70;

        Animated.timing(new Animated.Value(0), {
          toValue: 1,
          duration: 800,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
          useNativeDriver: true,
        }).start();

        flatListRef.current.scrollToOffset({
          offset: Math.max(0, estimatedOffset - 120),
          animated: true,
        });
      }
    },
    [flatListRef, filteredLyrics, highlightAnim],
  );

  useEffect(() => {
    let hasAttemptedScroll = false;
    let isMounted = true;

    const handleFocus = () => {
      if (!isMounted || hasAttemptedScroll) return;
      hasAttemptedScroll = true;

      const returnedIndex = route.params?.returnToIndex;

      if (returnedIndex && flatListRef.current && filteredLyrics.length > 0) {
        const targetIndex = parseInt(returnedIndex, 10);

        const indexToScrollTo = filteredLyrics.findIndex(
          item => item.filteredIndex === targetIndex,
        );

        if (indexToScrollTo !== -1) {
          setTimeout(() => {
            if (!isMounted) return;
            smoothScrollToIndex(indexToScrollTo);
          }, 500);
        }
      }
    };

    if (route.params?.returnToIndex) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (isMounted) handleFocus();
        });
      });
    }

    return () => {
      isMounted = false;
    };
  }, [route.params?.returnToIndex, filteredLyrics, smoothScrollToIndex]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route.params?.returnToIndex) {
        setTimeout(() => {
          navigation.setParams({returnToIndex: undefined});
        }, 1000);
      }
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const localizedTitle = Array.isArray(title) ? getString(title) : title;

    navigation.setOptions({
      title: localizedTitle || 'List',
      headerRight: () => (
        <Icon
          name="search"
          color="#fff"
          onPress={() =>
            navigation.navigate('Search', {
              collectionName,
              title: localizedTitle,
            })
          }
          size={26}
        />
      ),
      headerShown: header,
    });
  }, [navigation, header, title, collectionName, language]);

  const handleTagPress = useCallback(
    tag => {
      const newSelectedTags = selectedTags.includes(tag)
        ? selectedTags.filter(selectedTag => selectedTag !== tag)
        : [...selectedTags, tag];

      setSelectedTags(newSelectedTags);
    },
    [selectedTags],
  );

  const handleItemPress = item => {
    const filteredLyrics = filterAndSortLyrics(selectedTags, lyrics);
    navigation.navigate('Details', {
      Lyrics: filteredLyrics,
      itemNumberingparas: item.filteredIndex,
      previousScreen: 'List',
    });
    setHeader(true);
  };

  const renderItem = useCallback(
    ({item, index}) => {
      const isHighlighted =
        item.id?.toString() === highlightedItemId.current ||
        `item-${index}` === highlightedItemId.current;

      const itemStyle = isHighlighted
        ? {
            transform: [
              {
                scale: highlightAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 1.02, 1],
                }),
              },
            ],
            backgroundColor: highlightAnim.interpolate({
              inputRange: [0, 0.3, 1],
              outputRange: [
                themeColors.background,
                themeColors.primary + '15',
                themeColors.background,
              ],
            }),
            borderRadius: 8,
            marginHorizontal: 4,
            shadowOpacity: highlightAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0.1, 0],
            }),
            shadowRadius: 4,
            shadowOffset: {width: 0, height: 2},
            elevation: highlightAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 2, 0],
            }),
          }
        : {};

      return (
        <Animated.View style={itemStyle}>
          <ListItem
            item={{...item, numbering: item.displayNumbering}}
            themeColors={themeColors}
            onItemPress={handleItemPress}
          />
        </Animated.View>
      );
    },
    [highlightAnim, themeColors, handleItemPress],
  );

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: themeColors.background,
        }}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: themeColors.background,
          padding: 20,
        }}>
        <Text
          style={{
            color: themeColors.error,
            textAlign: 'center',
            marginBottom: 20,
          }}>
          {error}
        </Text>
        <Icon
          name="refresh"
          color={themeColors.primary}
          size={40}
          onPress={loadData}
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: themeColors.background}}>
      <View style={{flex: 1}}>
        {!customLyrics && tags && tags.length > 0 && (
          <View style={styles.tagContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={tags}
              extraData={language}
              keyExtractor={(item, index) =>
                item.id?.toString() || `tag-${index}`
              }
              contentContainerStyle={styles.tagListContent}
              renderItem={({item}) => (
                <TagItem
                  item={item}
                  selectedTags={selectedTags}
                  onTagPress={handleTagPress}
                  themeColors={themeColors}
                />
              )}
            />
          </View>
        )}

        <FlatList
          ref={flatListRef}
          style={styles.lyricsList}
          contentContainerStyle={styles.lyricsListContent}
          data={filteredLyrics}
          keyExtractor={(item, index) => item.id?.toString() || `item-${index}`}
          renderItem={renderItem}
          ListEmptyComponent={<EmptyList />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadData(true)}
            />
          }
          windowSize={5}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          getItemLayout={(data, index) => ({
            length: 70,
            offset: 70 * index,
            index,
          })}
          removeClippedSubviews={true}
          initialNumToRender={20}
          onScrollToIndexFailed={info => {
            console.warn('Scroll to index failed:', info);

            const offset = info.index * 70;
            const targetY = Math.max(0, offset - 100);

            let currentOffset = 0;
            const totalFrames = 30;
            const step = targetY / totalFrames;

            function animateScroll(frame) {
              if (frame >= totalFrames || !flatListRef.current) return;

              currentOffset += step;
              flatListRef.current.scrollToOffset({
                offset: currentOffset,
                animated: false,
              });

              requestAnimationFrame(() => animateScroll(frame + 1));
            }

            requestAnimationFrame(() => animateScroll(0));
          }}
          scrollEventThrottle={16}
          decelerationRate="normal"
          keyboardShouldPersistTaps="handled"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  tagContainer: {
    maxHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  tagListContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  lyricsList: {
    flex: 1,
  },
  lyricsListContent: {
    flexGrow: 1,
  },
});

export default List;
