import React, {useState, useEffect, useCallback} from 'react';
import {
  FlatList,
  SafeAreaView,
  RefreshControl,
  View,
  ActivityIndicator, // Import ActivityIndicator for showing loading state
  useColorScheme,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import {getFromAsyncStorage} from '../config/dataService';
import {colors} from '../theme/theme';
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
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const [shouldAutoRefresh, setShouldAutoRefresh] = useState(true); // Track if auto-refresh is needed

  const themeColors = isDarkMode ? colors.dark : colors.light;

  useEffect(() => {
    setIsDarkMode(systemTheme === 'dark');
  }, [systemTheme]);

  const filterAndSortLyrics = (tags, lyrics) => {
    const currentDate = new Date();
    const filteredItems = lyrics.filter(item =>
      tags.every(
        selectedTag =>
          item.tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase()) ||
          item.collectionName.includes(selectedTag),
      ),
    );

    const isPublishedWithinWeek = publishDate => {
      const publishDateTime = new Date(publishDate.seconds * 1000);
      const timeDiff = Math.ceil(
        (currentDate - publishDateTime) / (1000 * 60 * 60 * 24),
      );
      return timeDiff <= 7;
    };

    return filteredItems.sort((a, b) => {
      if (a.newFlag && isPublishedWithinWeek(a.publishDate)) {
        if (!b.newFlag || !isPublishedWithinWeek(b.publishDate)) {
          return -1;
        }
      } else if (b.newFlag && isPublishedWithinWeek(b.publishDate)) {
        return 1;
      }
      return Number(a.numbering) - Number(b.numbering);
    });
  };

  const loadData = async () => {
    setRefreshing(true);
    setIsLoading(true); // Set loading state
    try {
      const fetchedDataTags = await getFromAsyncStorage(Tags);
      const fetchedDataLyrics = await getFromAsyncStorage(collectionName);
  
      let lyricsArray = Array.isArray(fetchedDataLyrics)
        ? fetchedDataLyrics
        : [];
      let tagsArray = Array.isArray(fetchedDataTags) ? fetchedDataTags : [];
  
      // Check if all items have unique and valid 'order' field
      const hasValidOrder = lyricsArray.every(
        (item, index, arr) =>
          item.order !== undefined &&
          item.order !== null &&
          typeof item.order === 'number' &&
          // Ensure order is not repeated
          arr.filter(({ order }) => order === item.order).length === 1
      );
  
      let lyricsWithNumbering;
      if (hasValidOrder) {
        // Sort lyrics by 'order' if it's valid
        lyricsWithNumbering = lyricsArray
          .sort((a, b) => a.order - b.order)
          .map(item => ({
            ...item,
            numbering: item.order, // Use 'order' as numbering
          }));
      } else {
        // Fallback to numbering based on index if 'order' is missing or invalid
        lyricsWithNumbering = lyricsArray.map((item, index) => ({
          ...item,
          numbering: index + 1, // Use index-based numbering
        }));
      }
  
      // Ensure tags have numbering based on index or other numerical property
      const sortedTagsArray = tagsArray.sort(
        (a, b) => Number(a.numbering) - Number(b.numbering),
      );
  
      setLyrics(lyricsWithNumbering); // Set lyrics with either order or index numbering
      setTags(sortedTagsArray);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setRefreshing(false);
      setIsLoading(false); // Turn off loading state when data is ready
    }
  };
  

  useEffect(() => {
    loadData(); // Automatically load data on mount
  }, [Tags, collectionName]);

  useEffect(() => {
    const sortedFilteredItems = filterAndSortLyrics(selectedTags, lyrics);
    setFilteredLyrics(sortedFilteredItems);
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

  // Show loading indicator until data is fetched
  if (isLoading) {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: themeColors.background}}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: themeColors.background}}>
      <View style={{flexGrow: 0, flexShrink: 0}}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={tags}
          renderItem={({item}) => (
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

      <View style={{flex: 1}}>
        <FlatList
          contentContainerStyle={{
            backgroundColor: themeColors.background,
          }}
          data={filteredLyrics}
          renderItem={({item}) => (
            <ListItem
              key={item.id}
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
