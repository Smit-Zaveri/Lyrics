import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  FlatList,
  SafeAreaView,
  RefreshControl,
  View,
  ActivityIndicator,
  Text,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { getFromAsyncStorage } from '../config/DataService';
import TagItem from './TagItem';
import ListItem from './ListItem';
import EmptyList from './EmptyList';
import { ThemeContext } from '../../App';

const List = ({ route }) => {
  const { collectionName, Tags, title, customLyrics } = route.params;
  const navigation = useNavigation();
  const { themeColors } = useContext(ThemeContext);

  const [header, setHeader] = useState(true);
  const [lyrics, setLyrics] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const filterAndSortLyrics = (tags, lyrics) => {
    // Ensure lyrics is always a valid array
    if (!lyrics || !Array.isArray(lyrics)) {
      return [];
    }

    const filteredItems = lyrics.filter(item => {
      // Skip null or undefined items
      if (!item) return false;
      
      if (tags.length === 0) return true;
      
      return tags.every(selectedTag => {
        // Ensure item.tags is an array before using .some()
        const itemTags = Array.isArray(item.tags) ? item.tags : [];
        const hasTag = itemTags.some(tag => 
          tag && selectedTag && tag.toLowerCase() === selectedTag.toLowerCase()
        );
        
        // Check collection name match if tag not found
        const collectionMatch = item.collectionName && selectedTag && 
          item.collectionName.toLowerCase() === selectedTag.toLowerCase();
          
        return hasTag || collectionMatch;
      });
    });

    // Sort items safely
    const sortedItems = filteredItems.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      // Use numbering as backup, with fallback to 0
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
        // If we have custom lyrics (from a collection), use those
        setLyrics(Array.isArray(customLyrics) ? customLyrics : []);
        setTags([]);
      } else {
        // Otherwise load from AsyncStorage as before
        const fetchedDataTags = await getFromAsyncStorage(Tags);
        const fetchedDataLyrics = await getFromAsyncStorage(collectionName);

        const tagsArray = Array.isArray(fetchedDataTags) ? fetchedDataTags : [];
        const sortedTags = [...tagsArray].sort((a, b) => {
          const numA = a.numbering !== undefined ? a.numbering : 0;
          const numB = b.numbering !== undefined ? b.numbering : 0;
          return numA - numB;
        });

        const allLyrics = Array.isArray(fetchedDataLyrics)
          ? fetchedDataLyrics
          : [];
        
        const hasValidOrder = allLyrics.length > 0 && allLyrics.every(
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
  }, [navigation, header, title, collectionName]);

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
      itemNumberingparas: item.filteredIndex,
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
        <Text style={{ color: themeColors.error, textAlign: 'center', marginBottom: 20 }}>
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
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <View style={{flexGrow: 0, flexShrink: 0}}>
        {/* Only show tags if not using customLyrics and tags are available */}
        {!customLyrics && tags && tags.length > 0 && (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={tags}
            keyExtractor={(item, index) => (item.id?.toString() || `tag-${index}`)}
            renderItem={({item}) => (
              <TagItem
                item={item}
                selectedTags={selectedTags}
                onTagPress={handleTagPress}
                themeColors={themeColors}
              />
            )}
          />
        )}

        {/* Lyrics List */}
        <FlatList
          contentContainerStyle={{
            backgroundColor: themeColors.background,
            paddingBottom: 100,
            flexGrow: filteredLyrics.length === 0 ? 1 : undefined,
          }}
          data={filteredLyrics}
          keyExtractor={(item, index) => (item.id?.toString() || `item-${index}`)}
          renderItem={({item}) => (
            <ListItem
              item={{...item, numbering: item.displayNumbering}}
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
