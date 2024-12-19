import React, { useState, useEffect, useCallback } from 'react';
import {
  SafeAreaView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Searchbar, List, Portal, Provider } from 'react-native-paper';
import { getFromAsyncStorage } from '../config/dataService';
import EmptyList from './EmptyList';

const Search = ({ route }) => {
  const navigation = useNavigation();
  const [lyrics, setLyrics] = useState([]);
  const [filteredLyrics, setFilteredLyrics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const { collectionName } = route.params;

  const loadLyrics = useCallback(async () => {
    setLoading(true);
    setRefreshing(true);

    try {
      const fetchedLyrics = await getFromAsyncStorage(collectionName);
      const lyricsArray = Array.isArray(fetchedLyrics) ? fetchedLyrics : [];

      const lyricsWithIndex = lyricsArray.map((item, index) => ({
        ...item,
        numbering: index + 1,
      }));

      setLyrics(lyricsWithIndex);
      cacheSuggestions(lyricsWithIndex);
    } catch (error) {
      console.error('Error loading lyrics:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [collectionName]);

  useEffect(() => {
    loadLyrics();
  }, [collectionName, loadLyrics]);

  // Cache suggestions and split concatenated words
  const cacheSuggestions = (lyrics) => {
    const wordSet = new Set();

    lyrics.forEach((lyric) => {
      const fields = ['title', 'content', 'artist', 'tags'];
      fields.forEach((field) => {
        const text = lyric[field];
        if (Array.isArray(text)) {
          text.forEach((item) => addWordsToSet(item, wordSet));
        } else if (typeof text === 'string') {
          addWordsToSet(text, wordSet);
        }
      });
    });

    // Additional logic to handle concatenated words
    const fixedSuggestions = Array.from(wordSet).map(word => {
      // Check if word contains concatenated parts (i.e., camel case or transliterated words)
      if (word.match(/[a-zA-Z]+[A-Z][a-zA-Z]/)) {
        // Insert space before capital letter (camel-case detection)
        return word.replace(/([a-zA-Z])([A-Z])/g, '$1 $2');
      } else if (word.match(/[a-zA-Z]+[\u0A80-\u0AFF]/)) {
        // Handling camel-case for mixed scripts (Latin + Gujarati)
        return word.replace(/([a-zA-Z])([\u0A80-\u0AFF])/g, '$1 $2');
      }
      return word;
    });

    setSuggestions(fixedSuggestions);
  };

  // Function to add words to the set
  const addWordsToSet = (text, wordSet) => {
    // Split the text using space and additional punctuation, handle Gujarati characters as well
    text
      .split(/\s+/)  // Split by whitespace characters
      .map((word) => word.trim().replace(/[^ઁ-૱\u0A80-\u0AFFa-zA-Z0-9]/g, '')) // Keep only Gujarati and alphanumeric
      .filter((word) => word)  // Remove empty words
      .forEach((word) => wordSet.add(word));
  };

  const handleSearch = (text) => {
    setSearchQuery(text);

    if (!text.trim()) {
      setFilteredLyrics([]);
      return;
    }

    const terms = text.split(/\s+/).filter((term) => term.trim()); // Split by any whitespace
    const lowerCaseQuery = text.toLowerCase();

    const results = lyrics.filter((item) => {
      const fields = [item.title, item.content, ...(item.tags || [])];

      // Check for exact phrase match (entire query)
      const phraseMatch = fields.some((field) =>
        field?.toLowerCase().includes(lowerCaseQuery)
      );

      // Check for all individual terms (split words)
      const termsMatch = terms.every((term) =>
        fields.some((field) =>
          field?.toLowerCase().includes(term.toLowerCase())
        )
      );

      return phraseMatch || termsMatch;
    });

    setFilteredLyrics(results);
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    handleSearch(suggestion);
  };

  const handleItemPress = (item) => {
    navigation.navigate('Details', {
      Lyrics: lyrics,
      itemNumberingparas: item.numbering.toString(),
    });
  };

  const onRefresh = useCallback(() => {
    loadLyrics();
  }, [loadLyrics]);

  const highlightSearchTerms = (text, terms) => {
    if (!text) return null;

    const parts = text.split(new RegExp(`(${terms.join('|')})`, 'gi'));
    return parts.map((part, index) =>
      terms.includes(part.toLowerCase()) ? (
        <Text key={index} style={styles.highlight}>
          {part}
        </Text>
      ) : (
        part
      )
    );
  };

  const renderItem = ({ item }) => {
    const terms = searchQuery.split(' ').filter((term) => term.trim());
    const matchingLine =
      item.content
        .split('\n')
        .find((line) =>
          terms.some((term) => line.toLowerCase().includes(term.toLowerCase()))
        ) || item.content.split('\n')[0];

    return (
      <Pressable onPress={() => handleItemPress(item)} style={styles.itemContainer}>
        <View style={styles.leftContainer}>
          <Text style={styles.numberingText}>{item.numbering}</Text>
          <View style={styles.detailsContainer}>
            <Text style={styles.title}>{highlightSearchTerms(item.title, terms)}</Text>
            <Text style={styles.content} numberOfLines={1}>
              {highlightSearchTerms(matchingLine, terms)}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  return (
    <Provider>
      <Portal>
        <Modal visible={loading} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <ActivityIndicator size="large" color="#6200EE" />
            <Text style={styles.loadingText}>Loading lyrics...</Text>
          </View>
        </Modal>
      </Portal>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <SafeAreaView style={styles.container}>
          <Searchbar
            placeholder="Search lyrics, artist, or tags"
            onChangeText={handleSearch}
            value={searchQuery}
            style={styles.searchbar}
            inputStyle={styles.searchbarInput}
          />
          {!!searchQuery.trim() && (
            <FlatList
              data={suggestions.filter((s) =>
                s.toLowerCase().includes(searchQuery.toLowerCase())
              )}
              renderItem={({ item }) => (
                <List.Item
                  title={item}
                  onPress={() => handleSuggestionClick(item)}
                  titleStyle={styles.suggestionItem}
                />
              )}
              keyExtractor={(item, index) => index.toString()}
              style={styles.suggestionsList}
            />
          )}
          {filteredLyrics.length === 0 && searchQuery.trim() && (
            <Text style={styles.noResultsText}>No results found</Text>
          )}
          <FlatList
            data={filteredLyrics}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={<EmptyList />}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            contentContainerStyle={styles.listContainer}
          />
        </SafeAreaView>
      </TouchableWithoutFeedback>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  searchbar: {
    marginVertical: 15,
    borderRadius: 25,
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    backgroundColor: '#ffffff',
  },
  searchbarInput: {
    fontSize: 16,
    color: '#333',
  },
  suggestionsList: {
    marginTop: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  suggestionItem: {
    color: '#6200EE',
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    marginVertical: 8,
    borderRadius: 10,
    backgroundColor: '#ffffff',
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  numberingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6200EE',
    backgroundColor: '#E0E0E0',
    width: 36,
    height: 36,
    borderRadius: 18,
    textAlign: 'center',
    textAlignVertical: 'center', // For Android vertical alignment
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  content: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  highlight: {
    backgroundColor: 'rgba(255, 235, 59, 0.4)', // Yellow highlight
    borderRadius: 3,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#fff',
  },
  listContainer: {
    paddingBottom: 20,
  },
  noResultsText: {
    fontSize: 16,
    color: '#777',
    textAlign: 'center',
    marginTop: 30,
  },
});

export default Search;
