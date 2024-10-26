import React, { useState, useEffect } from 'react';
import {
  FlatList,
  SafeAreaView,
  TextInput,
  View,
  Keyboard,
  RefreshControl,
  TouchableWithoutFeedback,
  Animated,
  TouchableOpacity,
  Text,
  useColorScheme,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { getFromAsyncStorage } from '../config/DataService'; // Fetch lyrics based on collectionName
import { colors } from '../theme/theme';
import ListItem from './ListItem';
import EmptyList from './EmptyList';

const Search = ({ route }) => {
  const navigation = useNavigation();
  const [lyrics, setLyrics] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filteredLyrics, setFilteredLyrics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearchPerformed, setIsSearchPerformed] = useState(false);

  const systemTheme = useColorScheme();
  const isDarkMode = systemTheme === 'dark';
  const themeColors = isDarkMode ? colors.dark : colors.light;
  const searchBarAnim = new Animated.Value(0);

  const { collectionName } = route.params; // Extract collectionName from route params

  // Fetch lyrics based on collectionName (from AsyncStorage)
  const loadLyrics = async () => {
    setRefreshing(true);
    try {
      // Fetch lyrics from AsyncStorage using collectionName
      const fetchedLyrics = await getFromAsyncStorage(collectionName);

      let lyricsArray = Array.isArray(fetchedLyrics) ? fetchedLyrics : [];

      // Ensure lyrics have numbering based on index
      const lyricsWithIndex = lyricsArray.map((item, index) => ({
        ...item,
        numbering: index + 1, // Set numbering based on index
      }));

      setLyrics(lyricsWithIndex);
    } catch (error) {
      console.error('Error loading lyrics:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Fetch suggestions (tags)
  const loadSuggestions = async () => {
    try {
      const fetchedDataSuggestion = await getFromAsyncStorage('suggestions');
      setSuggestions(fetchedDataSuggestion || []);
    } catch (error) {
      console.error('Error loading suggestions:', error);
    }
  };

  useEffect(() => {
    loadLyrics();
    loadSuggestions();
  }, [collectionName]); // Re-fetch when collectionName changes

  // Filter and sort lyrics based on the search query
  const filterAndSortLyrics = (lyrics, query) => {
    const lowerCaseQuery = query.toLowerCase();
  
    return lyrics
      .filter(item => {
        const { title, numbering, content, tags } = item;
        return (
          (title && title.toLowerCase().includes(lowerCaseQuery)) ||
          (numbering && numbering.toString().includes(lowerCaseQuery)) ||
          (content && content.toString().includes(lowerCaseQuery)) ||
          (tags && tags.some(tag => tag.toLowerCase().includes(lowerCaseQuery)))
        );
      })
      .sort((a, b) => Number(a.numbering) - Number(b.numbering));
  };
  
  
  

  // When lyrics or search query change, update filtered lyrics
  useEffect(() => {
    if (searchQuery.trim() !== '') {
      const sortedFilteredItems = filterAndSortLyrics(lyrics, searchQuery);
      setFilteredLyrics(sortedFilteredItems);
    } else {
      setFilteredLyrics([]);
    }
  }, [lyrics, searchQuery]);

  // Update navigation options (if needed)
  useEffect(() => {
    navigation.setOptions({
      title: 'Search',
    });
  }, [navigation]);

  // Handle search query input
  const handleSearch = text => {
    setSearchQuery(text);
    if (!isSearchPerformed) {
      setIsSearchPerformed(true);
      Animated.timing(searchBarAnim, {
        toValue: -60,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = suggestion => {
    setSearchQuery(suggestion);
    setIsSearchPerformed(true);
    handleSearch(suggestion);
  };

  // Handle item press to navigate to details
  const handleItemPress = item => {
    navigation.navigate('Details', {
      Lyrics: lyrics,
      itemNumberingparas: item.numbering.toString(),
    });
  };

  return (
    <SafeAreaView
      style={{
        backgroundColor: themeColors.background,
        flex: 1,
        paddingHorizontal: 20,
      }}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          {/* Search Bar */}
          <Animated.View
            style={{
              transform: [{ translateY: searchBarAnim }],
              alignItems: 'center',
              paddingTop: isSearchPerformed ? 20 : '30%',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 6,
            }}
          >
            <TextInput
              style={{
                height: 50,
                width: '90%',
                color: themeColors.text,
                borderColor: themeColors.link,
                borderWidth: 1,
                paddingHorizontal: 20,
                marginBottom: 20,
                borderRadius: 30,
                backgroundColor: themeColors.surface,
                textAlign: 'center',
                fontSize: 16,
              }}
              placeholder="Search lyrics..."
              placeholderTextColor={themeColors.text}
              value={searchQuery}
              onChangeText={handleSearch}
            />
          </Animated.View>

          {/* Suggestions */}
          {!isSearchPerformed && suggestions.length > 0 && (
            <View
              style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                paddingHorizontal: 10,
                marginTop: 15,
              }}
            >
              {suggestions.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleSuggestionClick(item.name)}
                  style={{
                    backgroundColor: themeColors.surface,
                    borderRadius: 20,
                    paddingHorizontal: 15,
                    paddingVertical: 8,
                    margin: 5,
                    height: 40,
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.2,
                    shadowRadius: 5,
                    elevation: 3,
                  }}
                >
                  <Text
                    style={{
                      color: themeColors.text,
                      fontSize: 14,
                      fontWeight: '500',
                    }}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Lyrics List */}
          {isSearchPerformed && (
            <FlatList
              style={{ flex: 1 }}
              contentContainerStyle={{ flexGrow: 1, paddingTop: 10 }}
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
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={loadLyrics} />
              }
            />
          )}
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};

export default Search;
