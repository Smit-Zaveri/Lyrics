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
  ScrollView,
  Platform,
  UIManager,
  LayoutAnimation,
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

// Enable simple layout animation for iOS only
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

  const flatListRef = useRef(null);
  const tagsScrollViewRef = useRef(null);
  const highlightedItemId = useRef(null);
  const initialScrollDone = useRef(false);
  const targetItemId = useRef(null);
  const hasProcessedIndex = useRef(null);
  const animatedOpacity = useRef(new Animated.Value(1)).current;

  const [highlightAnim] = useState(new Animated.Value(0));
  const [scrollY] = useState(new Animated.Value(0));
  const itemHeight = 70;

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
  const [listKey, setListKey] = useState("lyrics-list-0");

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

  const filterAndSortLyrics = useCallback((tags, lyrics) => {
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
      stableId: item.id || `item-${item.numbering || index}`,
    }));
  }, [getString]);

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
        setLyrics(Array.isArray(customLyrics) ? customLyrics : []);
        setTags([]);
      } else {
        const fetchedDataTags = await getFromAsyncStorage(Tags);
        const fetchedDataLyrics = await getFromAsyncStorage(collectionName);

        const tagsArray = Array.isArray(fetchedDataTags) ? fetchedDataTags : [];

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

  useEffect(() => {
    if (tags.length > 0) {
      const newTagsMap = {};
      tags.forEach(tag => {
        const tagId = tag.id?.toString() || `tag-${tag.name}-${tag.numbering || 0}`;
        newTagsMap[tagId] = tag;
      });
      setTagsMap(newTagsMap);

      const tagIds = Object.keys(newTagsMap);

      const sortedIds = tagIds.sort((idA, idB) => {
        const tagA = newTagsMap[idA];
        const tagB = newTagsMap[idB];

        const aSelected = selectedTags.includes(tagA.name);
        const bSelected = selectedTags.includes(tagB.name);

        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;

        if (tagA.id?.startsWith('num') && tagB.id?.startsWith('num')) {
          return tagA.name.localeCompare(tagB.name);
        }

        if (tagA.id?.startsWith('num')) return -1;
        if (tagB.id?.startsWith('num')) return 1;

        const numA = tagA.numbering !== undefined ? tagA.numbering : 0;
        const numB = tagB.numbering !== undefined ? tagB.numbering : 0;
        return numA - numB;
      });

      if (Platform.OS === 'ios') {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }

      setSortedTagIds(sortedIds);
    }
  }, [tags, selectedTags]);

  useEffect(() => {
    const newFilteredLyrics = filterAndSortLyrics(selectedTags, lyrics);
    setLastFilteredList(newFilteredLyrics);
    
    if (targetItemId.current) {
      const newIndex = newFilteredLyrics.findIndex(
        item => item.stableId === targetItemId.current
      );
      
      if (newIndex !== -1) {
        const isInitialHighlighted = hasProcessedIndex.current === targetItemId.current;
        requestAnimationFrame(() => {
          smoothScrollToIndex(newIndex, !isInitialHighlighted, true);
        });
      } else {
        targetItemId.current = null;
        highlightedItemId.current = null;
      }
    }
  }, [selectedTags, lyrics, filterAndSortLyrics]);

  const handleTagPress = useCallback(
    tagName => {
      let currentStableId = null;
      
      if (highlightedItemId.current) {
        const currentItem = lastFilteredList.find(
          item => item.id?.toString() === highlightedItemId.current || 
                 `item-${item.filteredIndex-1}` === highlightedItemId.current
        );
        
        if (currentItem) {
          currentStableId = currentItem.stableId;
          targetItemId.current = currentStableId;
        }
      }

      // Start fade-out animation
      Animated.timing(animatedOpacity, {
        toValue: 0.7,
        duration: 150,
        useNativeDriver: true,
      }).start();

      const newSelectedTags = selectedTags.includes(tagName)
        ? selectedTags.filter(selectedTag => selectedTag !== tagName)
        : [...selectedTags, tagName];

      setSelectedTags(newSelectedTags);
      
      // Force list recreation with new key
      setListKey(`lyrics-list-${Date.now()}`);

      // Fade back in after a short delay
      setTimeout(() => {
        Animated.timing(animatedOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }).start();
      }, 100);

      if (!targetItemId.current && !currentStableId && !hasProcessedIndex.current) {
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
        }, 50);
      }
    },
    [selectedTags, lastFilteredList, animatedOpacity],
  );

  const handleItemPress = item => {
    const filteredLyrics = filterAndSortLyrics(selectedTags, lyrics);
    
    // Find the exact song by its original order/numbering to ensure consistency
    const originalIndex = filteredLyrics.findIndex(lyric => {
      // Match by stable identifier (id, order, or numbering)
      return lyric.stableId === item.stableId;
    });
    
    // Use the found index + 1 (since itemNumberingparas is 1-based) or fallback to filteredIndex
    const correctIndex = originalIndex !== -1 ? originalIndex + 1 : item.filteredIndex;
    
    navigation.navigate('Details', {
      Lyrics: filteredLyrics,
      itemNumberingparas: correctIndex,
      originalItem: item, // Pass the original item for reference
      previousScreen: 'List',
    });
    setHeader(true);
  };

  const smoothScrollToIndex = useCallback(
    (index, highlightAfter = true, forceScroll = false) => {
      if (!flatListRef.current || index < 0 || index >= lastFilteredList.length) return;

      const itemToHighlight = lastFilteredList[index];
      if (!itemToHighlight) return;

      const stableId = itemToHighlight.stableId;
      if (!forceScroll && hasProcessedIndex.current === stableId) {
        return;
      }

      if (highlightAfter) {
        targetItemId.current = stableId;
      }

      try {
        flatListRef.current.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.25,
          viewOffset: 20,
        });

        hasProcessedIndex.current = stableId;

        if (highlightAfter) {
          highlightedItemId.current = itemToHighlight.id?.toString() || `item-${index}`;
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
        }
      } catch (error) {
        console.warn('Precise scroll failed, using fallback', error);
        
        const estimatedOffset = index * itemHeight;
        flatListRef.current.scrollToOffset({
          offset: Math.max(0, estimatedOffset - 100),
          animated: true,
        });
        
        hasProcessedIndex.current = stableId;
        
        setTimeout(() => {
          highlightedItemId.current = itemToHighlight.id?.toString() || `item-${index}`;
          highlightAnim.setValue(0);
          
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
      }
    },
    [lastFilteredList, highlightAnim, itemHeight],
  );

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
          const shouldProcess = hasProcessedIndex.current !== targetItem.stableId;
          
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
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (isMounted) handleReturnToIndex();
        });
      });
    }

    return () => {
      isMounted = false;
    };
  }, [route.params?.returnToIndex, lastFilteredList, smoothScrollToIndex]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('blur', () => {
      hasProcessedIndex.current = null;
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (route.params?.returnToIndex) {
        if (!route.params?.transitionType) {
          hasProcessedIndex.current = null;
        }

        setTimeout(() => {
          navigation.setParams({
            returnToIndex: undefined,
            transitionType: undefined,
          });
        }, 1000);
      }
    });

    return unsubscribe;
  }, [navigation]);

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
              key={`tags-${forceUpdate}`}
            >
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

        <Animated.FlatList
          key={listKey}
          ref={flatListRef}
          style={[styles.lyricsList, { opacity: animatedOpacity }]}
          contentContainerStyle={styles.lyricsListContent}
          data={lastFilteredList}
          keyExtractor={(item) => item.stableId}
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
          windowSize={7}
          maxToRenderPerBatch={12}
          updateCellsBatchingPeriod={30}
          getItemLayout={(data, index) => ({
            length: itemHeight,
            offset: itemHeight * index,
            index,
          })}
          removeClippedSubviews={Platform.OS === 'android' ? false : true}
          initialNumToRender={20}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y: scrollY } } }],
            { useNativeDriver: true }
          )}
          scrollEventThrottle={16}
          decelerationRate={Platform.OS === 'ios' ? 'fast' : 0.85}
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  tagContainer: {
    maxHeight: 44,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    backgroundColor: 'transparent',
  },
  tagListContent: {
    paddingHorizontal: 8,
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  lyricsList: {
    flex: 1,
  },
  lyricsListContent: {
    flexGrow: 1,
  },
});

export default List;
