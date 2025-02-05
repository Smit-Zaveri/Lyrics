import React, {useState, useEffect, useCallback} from 'react';
import {
  FlatList,
  SafeAreaView,
  RefreshControl,
  View,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {getFromAsyncStorage} from '../config/DataService';
import {colors} from '../theme/Theme';
import TagItem from './TagItem';
import ListItem from './ListItem';
import EmptyList from './EmptyList';

const List = ({route}) => {
  const {collectionName, Tags, title} = route.params;
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
  const [page, setPage] = useState(1);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(0);

  const itemsPerPage = 10;
  const themeColors = isDarkMode ? colors.dark : colors.light;

  useEffect(() => {
    setIsDarkMode(systemTheme === 'dark');
  }, [systemTheme]);

  const filterAndSortLyrics = (tags, lyrics) => {
    const filteredItems = lyrics.filter(item =>
      tags.every(
        selectedTag =>
          item.tags.some(
            tag => tag.toLowerCase() === selectedTag.toLowerCase(),
          ) || item.collectionName.toLowerCase() === selectedTag.toLowerCase(),
      ),
    );

    return filteredItems.sort(
      (a, b) => Number(a.numbering) - Number(b.numbering),
    );
  };

  const loadData = async (newPage = 1) => {
    if (newPage === 1) {
      setIsLoading(true);
      setLyrics([]);
    } else {
      setIsFetchingMore(true);
    }

    try {
      // Ensure data is not null by providing default empty arrays
      const fetchedDataTags = (await getFromAsyncStorage(Tags)) || [];
      const fetchedDataLyrics =
        (await getFromAsyncStorage(collectionName)) || [];

      const tagsArray = Array.isArray(fetchedDataTags) ? fetchedDataTags : [];
      const sortedTags = [...tagsArray].sort(
        (a, b) => (a.numbering || 0) - (b.numbering || 0),
      );

      const allLyrics = Array.isArray(fetchedDataLyrics)
        ? fetchedDataLyrics
        : [];
      const startIdx = (newPage - 1) * itemsPerPage;
      const endIdx = newPage * itemsPerPage;
      const paginatedLyrics = allLyrics.slice(startIdx, endIdx);

      const hasValidOrder = paginatedLyrics.every(
        (item, index, arr) =>
          item.order !== undefined &&
          item.order !== null &&
          typeof item.order === 'number' &&
          arr.filter(({order}) => order === item.order).length === 1,
      );

      const lyricsWithNumbering = hasValidOrder
        ? paginatedLyrics
            .sort((a, b) => a.order - b.order)
            .map(item => ({...item, numbering: item.order}))
        : paginatedLyrics.map((item, index) => ({
            ...item,
            numbering: startIdx + index + 1,
          }));

      setLyrics(prevLyrics =>
        newPage === 1
          ? lyricsWithNumbering
          : [...prevLyrics, ...lyricsWithNumbering],
      );
      setTags(sortedTags);
      setPage(newPage);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setRefreshing(false);
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

  useEffect(() => {
    loadData();
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
          onPress={() => navigation.navigate('Search', {collectionName})}
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
    [selectedTags, lyrics],
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
      setLastFetchTime(currentTime);
    }
  };

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

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: themeColors.background}}>
      {/* Tag List */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={tags}
        keyExtractor={item => item.id?.toString()}
        renderItem={({item}) => (
          <TagItem
            item={item}
            selectedTags={selectedTags}
            onTagPress={handleTagPress}
            themeColors={themeColors}
          />
        )}
      />

      {/* Lyrics List */}
      <FlatList
        contentContainerStyle={{backgroundColor: themeColors.background}}
        data={filteredLyrics}
        keyExtractor={item => item.id?.toString()} // Ensure keys are explicitly defined
        renderItem={({item}) => (
          <ListItem
            item={item}
            themeColors={themeColors}
            onItemPress={handleItemPress}
          />
        )}
        ListEmptyComponent={<EmptyList filteredLyrics={filteredLyrics} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(1)}
          />
        }
        onEndReached={fetchMoreData}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingMore ? (
            <View style={{paddingVertical: 20}}>
              <ActivityIndicator size="small" color={themeColors.primary} />
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
};

export default List;
