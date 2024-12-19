import React, { useState, useEffect } from 'react';
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
import { debounce } from 'lodash';

const Search = ({ route }) => {
  const navigation = useNavigation();
  const [lyrics, setLyrics] = useState([]);
  const [filteredLyrics, setFilteredLyrics] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const { collectionName } = route.params;

  const loadLyrics = async () => {
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
      extractAllWords(lyricsWithIndex);
    } catch (error) {
      console.error('Error loading lyrics:', error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLyrics();
  }, [collectionName]);

  const extractAllWords = (lyrics) => {
    const wordSet = new Set();

    lyrics.forEach((lyric) => {
      const fields = ['title', 'content', 'artist'];

      fields.forEach((field) => {
        if (lyric[field]) {
          const words = lyric[field]
            .split(/\s+/)
            .map((word) => word.trim().replace(/[^ઁ-૱\u0A80-\u0AFFa-zA-Z0-9]/g, ''));
          words.forEach((word) => {
            if (word) {
              wordSet.add(word);
            }
          });
        }
      });

      if (lyric.tags && Array.isArray(lyric.tags)) {
        lyric.tags.forEach((tag) => {
          const words = tag
            .split(/\s+/)
            .map((word) => word.trim().replace(/[^ઁ-૱\u0A80-\u0AFFa-zA-Z0-9]/g, ''));
          words.forEach((word) => {
            if (word) {
              wordSet.add(word);
            }
          });
        });
      }
    });

    setSuggestions(Array.from(wordSet));
  };

  const handleSearch = debounce((text) => {
    setSearchQuery(text);
    if (!text.trim()) {
      setFilteredLyrics([]);
      return;
    }

    const terms = text.split(' ').filter((term) => term.trim() !== '');
    const results = lyrics.filter((item) => {
      return terms.every((term) => {
        const searchText = term.toLowerCase();
        return (
          item.title.toLowerCase().includes(searchText) ||
          item.content.toLowerCase().includes(searchText) ||
          (item.tags && item.tags.some((tag) => tag.toLowerCase().includes(searchText)))
        );
      });
    });
    setFilteredLyrics(results);
  });

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

  const onRefresh = () => {
    loadLyrics();
  };

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
    const terms = searchQuery.split(' ').filter((term) => term.trim() !== '');
    
    // Find the line containing the search term
    const matchingLine = item.content
      .split('\n')
      .find((line) =>
        terms.some((term) => line.toLowerCase().includes(term.toLowerCase()))
      ) || item.content.split('\n')[0]; // Fallback to the first line if no match
    
    return (
      <Pressable onPress={() => handleItemPress(item)} style={styles.itemContainer}>
        <View style={styles.leftContainer}>
          <View style={styles.numberingContainer}>
            <Text style={styles.numberingText}>{item.numbering}</Text>
          </View>
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

          {searchQuery.trim() !== '' && (
            <FlatList
              data={suggestions.filter((suggestion) =>
                suggestion.toLowerCase().includes(searchQuery.toLowerCase())
              )}
              renderItem={({ item }) => (
                <List.Item
                  title={item}
                  onPress={() => handleSuggestionClick(item)}
                  titleStyle={styles.suggestionItem}
                />
              )}
              keyExtractor={(item, index) => index.toString()}
              style={{
                ...styles.suggestionsList,
                height: suggestions.length > 0 ? Math.min(suggestions.length * 40, 200) : 0,
              }}
            />
          )}

          {filteredLyrics.length === 0 && searchQuery.trim() !== '' && (
            <Text style={styles.noResultsText}>No results found</Text>
          )}

          <FlatList
            data={filteredLyrics}
            renderItem={renderItem}
            keyExtractor={(item) => item.id.toString()}
            ListEmptyComponent={<EmptyList filteredLyrics={filteredLyrics} />}
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
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginVertical: 6,
    borderRadius: 10,
    backgroundColor: '#fff',
    elevation: 2, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  numberingContainer: {
    marginRight: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberingText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6200EE',
  },
  detailsContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  content: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  highlight: {
    backgroundColor: 'rgba(255, 255, 0, 0.5)',
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
