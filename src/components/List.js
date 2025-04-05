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

  // useEffect for updating title and header - moved from inside filterAndSortLyrics
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

      // Simple animation for iOS only
      if (Platform.OS === 'ios') {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }

      setSortedTagIds(sortedIds);
    }
  }, [tags, selectedTags]);

  const filteredLyrics = filterAndSortLyrics(selectedTags, lyrics);

  const handleTagPress = useCallback(
    (tagName) => {
      // Simple animation for iOS only
      if (Platform.OS === 'ios') {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      }

      const newSelectedTags = selectedTags.includes(tagName)
        ? selectedTags.filter(selectedTag => selectedTag !== tagName)
        : [...selectedTags, tagName];

      setSelectedTags(newSelectedTags);

      // Scroll to beginning when a tag is selected or all tags are unselected
      if (!selectedTags.includes(tagName) || newSelectedTags.length === 0) {
        tagsScrollViewRef.current?.scrollTo({x: 0, animated: true});
      }

      // Force refresh for Android
      if (Platform.OS === 'android') {
        setTimeout(() => {
          setForceUpdate(prev => prev + 1);
        }, 50);
      }
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
    [themeColors, handleItemPress],
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
          removeClippedSubviews={Platform.OS === 'android' ? false : true}
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
