import React, { useState, useEffect, useCallback } from 'react';
import {
  FlatList,
  SafeAreaView,
  RefreshControl,
  View,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { getFromAsyncStorage } from '../config/dataService';
import { colors } from '../theme/theme';
import TagItem from './TagItem';
import ListItem from './ListItem';
import EmptyList from './EmptyList';

const List = ({ route }) => {
  const { collectionName, Tags, title } = route.params;
  const navigation = useNavigation();

  const systemTheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemTheme === 'dark');
  const [header, setHeader] = useState(true);
  const [lyrics, setLyrics] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filteredLyrics, setFilteredLyrics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1); // For tracking pagination
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(0); // Track last fetch time

  const itemsPerPage = 10; // Number of items to load per page
  const themeColors = isDarkMode ? colors.dark : colors.light;

  useEffect(() => {
    setIsDarkMode(systemTheme === 'dark');
  }, [systemTheme]);

  const filterAndSortLyrics = (tags, lyrics) => {
    const filteredItems = lyrics.filter(item =>
      tags.every(selectedTag =>
        item.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase())
      )
    );

    return filteredItems.sort((a, b) => Number(a.numbering) - Number(b.numbering));
  };

  const loadData = async (newPage = 1) => {
    if (newPage === 1) {
      setIsLoading(true); // Initial loading state
      setLyrics([]); // Reset lyrics on full reload
    } else {
      setIsFetchingMore(true); // Set loading state for pagination
    }

    try {
      const fetchedDataTags = await getFromAsyncStorage(Tags);
      const fetchedDataLyrics = await getFromAsyncStorage(collectionName);

      const tagsArray = Array.isArray(fetchedDataTags) ? fetchedDataTags : [];
      const allLyrics = Array.isArray(fetchedDataLyrics) ? fetchedDataLyrics : [];
      const startIdx = (newPage - 1) * itemsPerPage;
      const endIdx = newPage * itemsPerPage;
      const paginatedLyrics = allLyrics.slice(startIdx, endIdx);

      const hasValidOrder = paginatedLyrics.every(
        (item, index, arr) =>
          item.order !== undefined &&
          item.order !== null &&
          typeof item.order === 'number' &&
          arr.filter(({ order }) => order === item.order).length === 1
      );

      const lyricsWithNumbering = hasValidOrder
        ? paginatedLyrics
            .sort((a, b) => a.order - b.order)
            .map(item => ({ ...item, numbering: item.order }))
        : paginatedLyrics.map((item, index) => ({
            ...item,
            numbering: startIdx + index + 1,
          }));

      setLyrics(prevLyrics => (newPage === 1 ? lyricsWithNumbering : [...prevLyrics, ...lyricsWithNumbering]));
      setTags(tagsArray);
      setPage(newPage); // Update page number after successful load
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setRefreshing(false);
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    loadData(); // Load first page of data on mount
  }, [Tags, collectionName]);

  useEffect(() => {
    setFilteredLyrics(filterAndSortLyrics(selectedTags, lyrics));
  }, [selectedTags, lyrics]);

  useEffect(() => {
    navigation.setOptions({
      title: title || 'List',
      headerRight: () => (
        <Icon
          name="search"
          color="#fff"
          onPress={() => navigation.navigate('Search', { collectionName })}
          size={26}
        />
      ),
      headerShown: header,
    });
  }, [navigation, header, title]);

  const handleTagPress = useCallback(
    tag => {
      const newSelectedTags = selectedTags.includes(tag)
        ? selectedTags.filter(selectedTag => selectedTag !== tag)
        : [...selectedTags, tag];
      setSelectedTags(newSelectedTags);
      setFilteredLyrics(filterAndSortLyrics(newSelectedTags, lyrics));
    },
    [selectedTags, lyrics]
  );

  const handleItemPress = item => {
    navigation.navigate('Details', {
      Lyrics: lyrics,
      itemNumberingparas: item.numbering.toString(),
    });
    setHeader(true);
  };

  const fetchMoreData = () => {
    const currentTime = Date.now();
    if (!isFetchingMore && currentTime - lastFetchTime > 1000) {
      loadData(page + 1);
      setLastFetchTime(currentTime); // Update last fetch time
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.background }}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <View style={{ flexGrow: 0, flexShrink: 0 }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={tags}
          renderItem={({ item }) => (
            <TagItem
              key={item.id}
              item={item}
              selectedTags={selectedTags}
              onTagPress={handleTagPress}
              themeColors={themeColors}
            />
          )}
        />
      </View>

      <View style={{ flex: 1 }}>
        <FlatList
          contentContainerStyle={{ backgroundColor: themeColors.background }}
          data={filteredLyrics}
          renderItem={({ item }) => (
            <ListItem
              key={item.id}
              item={item}
              themeColors={themeColors}
              onItemPress={handleItemPress}
            />
          )}
          ListEmptyComponent={<EmptyList filteredLyrics={filteredLyrics} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(1)} />}
          onEndReached={fetchMoreData}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingMore ? (
              <View style={{ paddingVertical: 20 }}>
                <ActivityIndicator size="small" color={themeColors.primary} />
              </View>
            ) : null
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default List;