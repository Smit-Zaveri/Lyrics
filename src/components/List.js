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
  const [isLoading, setIsLoading] = useState(true);
  const [numberedFilteredLyrics, setNumberedFilteredLyrics] = useState([]);

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

  const loadData = async () => {
    try {
      setIsLoading(true);
      setRefreshing(true);

      const fetchedDataTags = await getFromAsyncStorage(Tags);
      const fetchedDataLyrics = await getFromAsyncStorage(collectionName);

      const tagsArray = Array.isArray(fetchedDataTags) ? fetchedDataTags : [];
      const sortedTags = [...tagsArray].sort(
        (a, b) => (a.numbering || 0) - (b.numbering || 0),
      );

      const allLyrics = Array.isArray(fetchedDataLyrics)
        ? fetchedDataLyrics
        : [];
      const hasValidOrder = allLyrics.every(
        (item, index, arr) =>
          item.order !== undefined &&
          item.order !== null &&
          typeof item.order === 'number' &&
          arr.filter(({order}) => order === item.order).length === 1,
      );

      const lyricsWithNumbering = hasValidOrder
        ? allLyrics
            .sort((a, b) => a.order - b.order)
            .map(item => ({...item, numbering: item.order}))
        : allLyrics.map((item, index) => ({
            ...item,
            numbering: index + 1,
          }));

      setLyrics(lyricsWithNumbering);
      setTags(sortedTags);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [Tags, collectionName, getFromAsyncStorage]);

  const filteredLyrics = filterAndSortLyrics(selectedTags, lyrics);

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
    },
    [selectedTags],
  );

  const handleItemPress = item => {
    // Create a new array with updated numbering for filtered items
    const numberedFilteredLyrics = filteredLyrics.map((lyric, index) => ({
      ...lyric,
      numbering: index + 1,
    }));

    navigation.navigate('Details', {
      Lyrics: numberedFilteredLyrics,
      itemNumberingparas: (numberedFilteredLyrics.findIndex(lyric => lyric.id === item.id) + 1).toString(),
    });
    setHeader(true);
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
      <View style={{flexGrow: 0, flexShrink: 0}}>
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
          contentContainerStyle={{
            backgroundColor: themeColors.background,
            paddingBottom: 100
          }}
          data={filteredLyrics}
          keyExtractor={item => item.id?.toString()}
          renderItem={({item}) => (
            <ListItem
              item={item}
              themeColors={themeColors}
              onItemPress={handleItemPress}
            />
          )}
          ListEmptyComponent={<EmptyList filteredLyrics={filteredLyrics} />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={loadData} />
          }
        />
      </View>
    </SafeAreaView>
  );
};

export default List;
