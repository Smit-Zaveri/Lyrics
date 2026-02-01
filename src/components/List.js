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
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  UIManager,
  LayoutAnimation,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {getFromAsyncStorage} from '../config/dataService';
import TagItem from './TagItem';
import ListItem from './ListItem';
import EmptyList from './EmptyList';
import SkeletonItem from './SkeletonItem';
import {ThemeContext} from '../../App';
import {LanguageContext} from '../context/LanguageContext';
import {useSingerMode} from '../context/SingerModeContext';

// Enable layout animations on iOS for smooth UI transitions
if (Platform.OS === 'ios') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const List = ({route}) => {
  const {collectionName, Tags, title, customLyrics, returnToIndex} =
    route.params || {};
  const navigation = useNavigation();
  const {themeColors} = useContext(ThemeContext);
  const {getString, language} = useContext(LanguageContext);
  const {isSingerMode} = useSingerMode();

  // Refs for scroll handling and preventing duplicate operations
  const flatListRef = useRef(null);
  const tagsScrollViewRef = useRef(null);
  const highlightedItemId = useRef(null);
  const targetItemId = useRef(null);
  const hasProcessedIndex = useRef(null);
  const animatedOpacity = useRef(new Animated.Value(1)).current;

  // Animation and layout values
  const [highlightAnim] = useState(new Animated.Value(0));
  const [scrollY] = useState(new Animated.Value(0));
  const itemHeight = 70;

  // Core state management
  const [header, setHeader] = useState(true);
  const [lyrics, setLyrics] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortedTagIds, setSortedTagIds] = useState([]);
  const [tagsMap, setTagsMap] = useState({});
  const [forceUpdate, setForceUpdate] = useState(0);
  const [lastFilteredList, setLastFilteredList] = useState([]);
  const [listKey, setListKey] = useState('lyrics-list-0');
  const [hasLyrics, setHasLyrics] = useState(true);

  // Configure navigation header with localized title and search icon
  useEffect(() => {
    const localizedTitle = Array.isArray(title) ? getString(title) : title;
    navigation.setOptions({
      title: localizedTitle || 'List',
      headerRight: hasLyrics
        ? () => (
            <Icon
              name="search"
              color="#fff"
              size={26}
              onPress={() =>
                navigation.navigate('Search', {
                  collectionName,
                  title: localizedTitle,
                })
              }
            />
          )
        : null,
      headerShown: header,
    });
  }, [navigation, header, title, collectionName, language, hasLyrics]);

  // Filter lyrics by selected tags and sort by order/numbering
  const filterAndSortLyrics = useCallback(
    (tags, lyrics) => {
      if (!lyrics || !Array.isArray(lyrics)) return [];

      const filteredItems = lyrics.filter(item => {
        if (!item) return false;
        if (tags.length === 0) return true;

        return tags.every(selectedTag => {
          const itemTags = Array.isArray(item.tags) ? item.tags : [];
          const hasTag = itemTags.some(tag => {
            if (Array.isArray(tag)) {
              return getString(tag).toLowerCase() === selectedTag.toLowerCase();
            }
            return (
              tag &&
              selectedTag &&
              tag.toLowerCase() === selectedTag.toLowerCase()
            );
          });

          let collectionMatch = false;
          if (item.collectionName) {
            const nameToCompare = Array.isArray(item.collectionName)
              ? getString(item.collectionName)
              : item.collectionName;
            collectionMatch =
              nameToCompare.toLowerCase() === selectedTag.toLowerCase();
          }

          return hasTag || collectionMatch;
        });
      });

      const sortedItems = filteredItems.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined)
          return a.order - b.order;
        return (a.numbering || 0) - (b.numbering || 0);
      });

      return sortedItems.map((item, index) => ({
        ...item,
        displayNumbering: item.order || item.numbering || index + 1,
        filteredIndex: index + 1,
        stableId: item.id || `item-${item.numbering || index}`,
      }));
    },
    [getString],
  );

  // Load lyrics and tags from storage or use custom data
  const loadData = async (isRefresh = false) => {
    try {
      setIsLoading(true);
      setRefreshing(true);
      setError(null);

      if (isRefresh) {
        targetItemId.current = null;
        highlightedItemId.current = null;
      }

      if (customLyrics) {
        const lyricsArray = Array.isArray(customLyrics) ? customLyrics : [];
        setLyrics(lyricsArray);
        setHasLyrics(lyricsArray.length > 0);
        setTags([]);
      } else {
        const [fetchedDataTags, fetchedDataLyrics] = await Promise.all([
          getFromAsyncStorage(Tags),
          getFromAsyncStorage(collectionName),
        ]);

        const tagsArray = Array.isArray(fetchedDataTags) ? fetchedDataTags : [];

        // Add number filter tags in singer mode
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
            if (a.id?.startsWith('num')) return -1;
            if (b.id?.startsWith('num')) return 1;
            return (a.numbering || 0) - (b.numbering || 0);
          })
          .map(tag => ({
            ...tag,
            displayName: Array.isArray(tag.displayName)
              ? getString(tag.displayName)
              : tag.displayName || tag.name,
          }));

        let allLyrics = Array.isArray(fetchedDataLyrics)
          ? fetchedDataLyrics
          : [];

        // Filter out user-added songs when not in singer mode
        if (!isSingerMode && collectionName !== 'added-songs') {
          allLyrics = allLyrics.filter(item => {
            if (item.fromAddedSongs === true) return false;
            if (item.collectionName === 'added-songs') return false;
            if (
              Array.isArray(item.collections) &&
              item.collections.includes('added-songs')
            )
              return false;
            return true;
          });
        }

        // Empty state for added-songs when singer mode is off
        if (!isSingerMode && collectionName === 'added-songs') {
          setLyrics([]);
          setTags(sortedTags);
          setHasLyrics(false);
          setIsLoading(false);
          setRefreshing(false);
          return;
        }

        // Validate and assign order/numbering to all items
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
          : allLyrics.map((item, index) => ({...item, numbering: index + 1}));

        setLyrics(lyricsWithNumbering);
        setTags(sortedTags);
        setHasLyrics(lyricsWithNumbering.length > 0);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Pull down to refresh.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Load data on mount and when dependencies change
  useEffect(() => {
    loadData();
  }, [Tags, collectionName, isSingerMode]);

  // Refresh data when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => loadData(true));
    return unsubscribe;
  }, [navigation, Tags, collectionName, isSingerMode]);

  // Update tags when language changes
  useEffect(() => {
    if (!customLyrics && tags.length > 0) {
      const updateTagsForLanguageChange = async () => {
        try {
          const fetchedDataTags = await getFromAsyncStorage(Tags);
          if (Array.isArray(fetchedDataTags) && fetchedDataTags.length > 0) {
            const updatedTags = [...fetchedDataTags].sort(
              (a, b) => (a.numbering || 0) - (b.numbering || 0),
            );
            setTags(updatedTags);
          }
        } catch (error) {
          console.error('Error updating tags for language change:', error);
        }
      };
      updateTagsForLanguageChange();
    }
  }, [language, Tags, customLyrics]);

  // Build tags map and sort IDs by selection state and numbering
  useEffect(() => {
    if (tags.length > 0) {
      const newTagsMap = {};
      tags.forEach(tag => {
        const tagId =
          tag.id?.toString() || `tag-${tag.name}-${tag.numbering || 0}`;
        newTagsMap[tagId] = tag;
      });
      setTagsMap(newTagsMap);

      const sortedIds = Object.keys(newTagsMap).sort((idA, idB) => {
        const tagA = newTagsMap[idA];
        const tagB = newTagsMap[idB];
        const aSelected = selectedTags.includes(tagA.name);
        const bSelected = selectedTags.includes(tagB.name);

        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;
        if (tagA.id?.startsWith('num') && tagB.id?.startsWith('num'))
          return tagA.name.localeCompare(tagB.name);
        if (tagA.id?.startsWith('num')) return -1;
        if (tagB.id?.startsWith('num')) return 1;
        return (tagA.numbering || 0) - (tagB.numbering || 0);
      });

      if (Platform.OS === 'ios') {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }

      setSortedTagIds(sortedIds);
    }
  }, [tags, selectedTags]);

  // Apply filters and restore scroll position after tag selection
  useEffect(() => {
    const newFilteredLyrics = filterAndSortLyrics(selectedTags, lyrics);
    setLastFilteredList(newFilteredLyrics);

    if (targetItemId.current) {
      const newIndex = newFilteredLyrics.findIndex(
        item => item.stableId === targetItemId.current,
      );
      if (newIndex !== -1) {
        const isInitialHighlighted =
          hasProcessedIndex.current === targetItemId.current;
        requestAnimationFrame(() =>
          smoothScrollToIndex(newIndex, !isInitialHighlighted, true),
        );
      } else {
        targetItemId.current = null;
        highlightedItemId.current = null;
      }
    }
  }, [selectedTags, lyrics, filterAndSortLyrics]);

  // Toggle tag selection with smooth fade animation
  const handleTagPress = useCallback(
    tagName => {
      let currentStableId = null;

      if (highlightedItemId.current) {
        const currentItem = lastFilteredList.find(
          item =>
            item.id?.toString() === highlightedItemId.current ||
            `item-${item.filteredIndex - 1}` === highlightedItemId.current,
        );
        if (currentItem) {
          currentStableId = currentItem.stableId;
          targetItemId.current = currentStableId;
        }
      }

      Animated.timing(animatedOpacity, {
        toValue: 0.7,
        duration: 150,
        useNativeDriver: true,
      }).start();

      const newSelectedTags = selectedTags.includes(tagName)
        ? selectedTags.filter(t => t !== tagName)
        : [...selectedTags, tagName];

      setSelectedTags(newSelectedTags);
      setListKey(`lyrics-list-${Date.now()}`);

      setTimeout(() => {
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }, 100);

      if (
        !targetItemId.current &&
        !currentStableId &&
        !hasProcessedIndex.current
      ) {
        setTimeout(
          () =>
            flatListRef.current?.scrollToOffset({offset: 0, animated: true}),
          50,
        );
      }
    },
    [selectedTags, lastFilteredList, animatedOpacity],
  );

  // Navigate to song details with correct index
  const handleItemPress = item => {
    const filteredLyrics = filterAndSortLyrics(selectedTags, lyrics);
    const originalIndex = filteredLyrics.findIndex(
      lyric => lyric.stableId === item.stableId,
    );
    const correctIndex =
      originalIndex !== -1 ? originalIndex + 1 : item.filteredIndex;

    navigation.navigate('Details', {
      Lyrics: filteredLyrics,
      itemNumberingparas: correctIndex,
      originalItem: item,
      previousScreen: 'List',
    });
    setHeader(true);
  };

  // Smooth scroll to item with highlight animation
  const smoothScrollToIndex = useCallback(
    (index, highlightAfter = true, forceScroll = false) => {
      if (!flatListRef.current || index < 0 || index >= lastFilteredList.length)
        return;

      const itemToHighlight = lastFilteredList[index];
      if (!itemToHighlight) return;

      const stableId = itemToHighlight.stableId;
      if (!forceScroll && hasProcessedIndex.current === stableId) return;

      if (highlightAfter) targetItemId.current = stableId;

      const performHighlight = () => {
        highlightedItemId.current =
          itemToHighlight.id?.toString() || `item-${index}`;
        highlightAnim.setValue(0);

        setTimeout(() => {
          Animated.sequence([
            Animated.timing(highlightAnim, {
              toValue: 1,
              duration: 450,
              useNativeDriver: true,
              easing: Easing.out(Easing.cubic),
            }),
            Animated.timing(highlightAnim, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: true,
              easing: Easing.bezier(0.22, 1, 0.36, 1),
            }),
          ]).start(() => {
            highlightedItemId.current = null;
          });
        }, 600);
      };

      try {
        flatListRef.current.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.25,
          viewOffset: 20,
        });
        hasProcessedIndex.current = stableId;
        if (highlightAfter) performHighlight();
      } catch (error) {
        console.warn('Precise scroll failed, using fallback', error);
        const estimatedOffset = index * itemHeight;
        flatListRef.current.scrollToOffset({
          offset: Math.max(0, estimatedOffset - 100),
          animated: true,
        });
        hasProcessedIndex.current = stableId;
        if (highlightAfter) performHighlight();
      }
    },
    [lastFilteredList, highlightAnim, itemHeight],
  );

  // Handle return navigation with scroll restoration
  useEffect(() => {
    let hasAttemptedScroll = false;
    let isMounted = true;

    const handleReturnToIndex = () => {
      if (!isMounted || hasAttemptedScroll) return;
      hasAttemptedScroll = true;

      const returnedIndex = route.params?.returnToIndex;
      if (returnedIndex && flatListRef.current && lastFilteredList.length > 0) {
        const targetIndex = parseInt(returnedIndex, 10);
        const indexToScrollTo = lastFilteredList.findIndex(
          item => item.filteredIndex === targetIndex,
        );

        if (indexToScrollTo !== -1) {
          const targetItem = lastFilteredList[indexToScrollTo];
          const shouldProcess =
            hasProcessedIndex.current !== targetItem.stableId;

          setTimeout(() => {
            if (!isMounted) return;
            if (shouldProcess) {
              smoothScrollToIndex(indexToScrollTo, true);
              hasProcessedIndex.current = targetItem.stableId;
            }
          }, 500);
        }
      }
    };

    if (route.params?.returnToIndex) {
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          if (isMounted) handleReturnToIndex();
        }),
      );
    }

    return () => {
      isMounted = false;
    };
  }, [route.params?.returnToIndex, lastFilteredList, smoothScrollToIndex]);

  // Reset scroll tracking when leaving screen
  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      hasProcessedIndex.current = null;
    });
    return unsubscribe;
  }, [navigation]);

  // Clear return params after navigation
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route.params?.returnToIndex) {
        if (!route.params?.transitionType) hasProcessedIndex.current = null;
        setTimeout(
          () =>
            navigation.setParams({
              returnToIndex: undefined,
              transitionType: undefined,
            }),
          1000,
        );
      }
    });
    return unsubscribe;
  }, [navigation]);

  // Render list item with optional highlight animation
  const renderItem = useCallback(
    ({item, index}) => {
      const isHighlighted =
        item.id?.toString() === highlightedItemId.current ||
        `item-${index}` === highlightedItemId.current;

      if (isHighlighted) {
        return (
          <Animated.View
            style={{
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
            }}>
            <ListItem
              item={{...item, numbering: item.displayNumbering}}
              themeColors={themeColors}
              onItemPress={handleItemPress}
            />
          </Animated.View>
        );
      }

      return (
        <View>
          <ListItem
            item={{...item, numbering: item.displayNumbering}}
            themeColors={themeColors}
            onItemPress={handleItemPress}
          />
        </View>
      );
    },
    [themeColors, handleItemPress, highlightAnim],
  );

  // Loading skeleton UI
  if (isLoading) {
    return (
      <SafeAreaView
        style={[styles.container, {backgroundColor: themeColors.background}]}>
        <View style={styles.contentWrapper}>
          {!customLyrics && (
            <View style={styles.tagContainer}>
              <View style={styles.tagListContent}>
                {[1, 2, 3, 4, 5].map(i => (
                  <View
                    key={`skeleton-tag-${i}`}
                    style={[
                      styles.skeletonTag,
                      {
                        backgroundColor: themeColors.isDark
                          ? 'rgba(255,255,255,0.06)'
                          : 'rgba(0,0,0,0.04)',
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          )}
          <View style={styles.listWrapper}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map(i => (
              <SkeletonItem
                key={`skeleton-${i}`}
                themeColors={themeColors}
                index={i}
              />
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Error state UI with retry
  if (error) {
    return (
      <View
        style={[
          styles.errorContainer,
          {backgroundColor: themeColors.background},
        ]}>
        <Icon
          name="error-outline"
          color={themeColors.primary}
          size={48}
          style={styles.errorIcon}
        />
        <Text style={[styles.errorText, {color: themeColors.text}]}>
          {error}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, {backgroundColor: themeColors.primary}]}
          onPress={loadData}
          activeOpacity={0.8}>
          <Icon
            name="refresh"
            color="#fff"
            size={20}
            style={styles.retryIcon}
          />
          <Text style={styles.retryText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Main list UI with tags and optimized FlatList
  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: themeColors.background}]}>
      <View style={styles.contentWrapper}>
        {!customLyrics && tags?.length > 0 && (
          <View style={styles.tagContainer}>
            <ScrollView
              ref={tagsScrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tagListContent}
              keyboardShouldPersistTaps="handled"
              scrollEventThrottle={16}
              directionalLockEnabled={true}
              overScrollMode="never"
              removeClippedSubviews={false}
              key={`tags-${forceUpdate}`}>
              {sortedTagIds.map(tagId => {
                const item = tagsMap[tagId];
                if (!item) return null;
                return (
                  <TagItem
                    key={tagId}
                    item={item}
                    selectedTags={selectedTags}
                    onTagPress={handleTagPress}
                    themeColors={themeColors}
                    isSticky={selectedTags.includes(item.name)}
                  />
                );
              })}
            </ScrollView>
          </View>
        )}

        <View style={styles.listWrapper}>
          <Animated.FlatList
            key={listKey}
            ref={flatListRef}
            style={[styles.lyricsList, {opacity: animatedOpacity}]}
            contentContainerStyle={styles.lyricsListContent}
            data={lastFilteredList}
            keyExtractor={item => item.stableId}
            renderItem={renderItem}
            ListEmptyComponent={<EmptyList />}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadData(true)}
                colors={[themeColors.primary]}
                tintColor={themeColors.primary}
              />
            }
            windowSize={21}
            maxToRenderPerBatch={30}
            updateCellsBatchingPeriod={10}
            getItemLayout={(data, index) => ({
              length: itemHeight,
              offset: itemHeight * index,
              index,
            })}
            removeClippedSubviews={true}
            initialNumToRender={25}
            onScroll={Animated.event(
              [{nativeEvent: {contentOffset: {y: scrollY}}}],
              {useNativeDriver: true},
            )}
            scrollEventThrottle={8}
            decelerationRate="normal"
            bounces={false}
            overScrollMode="never"
            maintainVisibleContentPosition={{minIndexForVisible: 0}}
            disableAutoLayout={false}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onScrollToIndexFailed={info => {
              console.warn('Scroll to index failed:', info);
              const targetItem = lastFilteredList[info.index];
              if (!targetItem) return;

              targetItemId.current = targetItem.stableId;
              const offset = info.index * itemHeight;
              const finalOffset = Math.max(0, offset - 100);

              requestAnimationFrame(() => {
                flatListRef.current?.scrollToOffset({
                  offset: finalOffset,
                  animated: true,
                });
                setTimeout(() => {
                  highlightedItemId.current =
                    targetItem.id?.toString() || `item-${info.index}`;
                  highlightAnim.setValue(0);
                  Animated.timing(highlightAnim, {
                    toValue: 1,
                    duration: 450,
                    useNativeDriver: true,
                    easing: Easing.out(Easing.cubic),
                  }).start();
                }, 500);
              });
            }}
          />
        </View>

        {collectionName === 'added-songs' && isSingerMode && (
          <TouchableOpacity
            style={[
              styles.fab,
              {backgroundColor: themeColors.primary, position: 'absolute'},
            ]}
            onPress={() =>
              navigation.navigate('AddSong', {
                returnScreen: 'List',
                collectionName: collectionName,
              })
            }
            activeOpacity={0.8}>
            <Icon name="add" color="#fff" size={24} />
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  contentWrapper: {flex: 1},
  centerContainer: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorIcon: {marginBottom: 16},
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  retryIcon: {marginRight: 8},
  retryText: {color: '#fff', fontSize: 15, fontWeight: '600'},
  tagContainer: {
    maxHeight: 48,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
    backgroundColor: 'transparent',
    paddingVertical: 4,
  },
  tagListContent: {
    paddingHorizontal: 12,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  listWrapper: {flex: 1},
  lyricsList: {flex: 1},
  lyricsListContent: {flexGrow: 1, paddingTop: 4, paddingBottom: 80},
  fab: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    right: 20,
    bottom: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    zIndex: 10,
  },
  skeletonTag: {
    width: 70,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
    opacity: 0.7,
  },
});

export default List;
