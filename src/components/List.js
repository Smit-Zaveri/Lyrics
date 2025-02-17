import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  FlatList,
  SafeAreaView,
  RefreshControl,
  View,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { getFromAsyncStorage } from '../config/DataService';
import TagItem from './TagItem';
import ListItem from './ListItem';
import EmptyList from './EmptyList';
import { ThemeContext } from '../../App';

const List = ({ route }) => {
  const { collectionName, Tags, title } = route.params;
  const navigation = useNavigation();
  const { themeColors } = useContext(ThemeContext);

  const [header, setHeader] = useState(true);
  const [lyrics, setLyrics] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [numberedFilteredLyrics, setNumberedFilteredLyrics] = useState([]);

  const filterAndSortLyrics = (tags, lyrics) => {
    const filteredItems = lyrics.filter(item =>
      tags.every(
        selectedTag =>
          item.tags.some(
            tag => tag.toLowerCase() === selectedTag.toLowerCase(),
          ) || item.collectionName.toLowerCase() === selectedTag.toLowerCase(),
      ),
    );

    // Preserve original numbering while sorting by filtered order
    return filteredItems.map((item, index) => ({
      ...item,
      displayNumbering: item.numbering, // Keep original numbering for display
      filteredIndex: index + 1, // Add filtered index for navigation
    }));
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
    const filteredLyrics = filterAndSortLyrics(selectedTags, lyrics);
    // Pass the entire filtered array and current item's filtered index
    navigation.navigate('Details', {
      Lyrics: filteredLyrics,
      itemNumberingparas: item.filteredIndex,  // Remove toString() as we'll handle it in DetailPage
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
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
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
          data={filterAndSortLyrics(selectedTags, lyrics)}
          keyExtractor={item => item.id?.toString()}
          renderItem={({item}) => (
            <ListItem
              item={{...item, numbering: item.displayNumbering}} // Use original numbering for display
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
