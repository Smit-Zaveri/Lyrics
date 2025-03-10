import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useContext,
} from 'react';
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
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Searchbar, List, Portal, Provider} from 'react-native-paper';
import {getFromAsyncStorage} from '../config/DataService';
import {colors} from '../theme/Theme';
import EmptyList from './EmptyList';
import ListItem from './ListItem';
import { ThemeContext } from '../../App';

// Precompiled regex patterns for suggestion fixes
const camelCaseRegex = /([a-z])([A-Z])/g;
const devanagariRegex = /([a-zA-Z])([\u0A80-\u0AFF])/g;

// Helper function to escape regex special characters in search terms
const escapeRegExp = string => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const Search = ({route}) => {
  const navigation = useNavigation();
  const searchbarRef = useRef(null);
  const { currentTheme, themeColors } = useContext(ThemeContext);
  const {collectionName} = route.params;

  const [lyrics, setLyrics] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Focus the Searchbar after a short delay when the component mounts
  useEffect(() => {
    const focusTimeout = setTimeout(() => {
      searchbarRef.current?.focus();
    }, 500);
    return () => clearTimeout(focusTimeout);
  }, []);

  // Load lyrics from storage and update suggestions.
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

  // Cache suggestions by extracting words from selected fields
  const cacheSuggestions = lyricsData => {
    const wordSet = new Set();
    lyricsData.forEach(lyric => {
      const fields = ['title', 'content', 'artist', 'tags'];
      fields.forEach(field => {
        const text = lyric[field];
        if (Array.isArray(text)) {
          text.forEach(item => item && addWordsToSet(item, wordSet));
        } else if (typeof text === 'string') {
          addWordsToSet(text, wordSet);
        }
      });
    });
    
    const fixedSuggestions = Array.from(wordSet)
      .filter(Boolean)
      .map(word => word
        .replace(camelCaseRegex, '$1 $2')
        .replace(devanagariRegex, '$1 $2')
      );
    setSuggestions(fixedSuggestions);
  };

  const addWordsToSet = (text, wordSet) => {
    text
      .split(/\s+/)
      .map(word => word.trim().replace(/[^ઁ-૱\u0A80-\u0AFFa-zA-Z0-9]/g, ''))
      .filter(Boolean)
      .forEach(word => wordSet.add(word));
  };

  // Only update search query; filtering is derived via useMemo below.
  const handleSearch = useCallback(text => {
    setSearchQuery(text);
  }, []);

  // Updated filtering logic to add bonus if all search terms appear in the same field, including numbering
  const filteredLyrics = useMemo(() => {
    if (!searchQuery.trim()) return [];
    
    const terms = searchQuery.split(/\s+/).filter(Boolean);
    const lowerCaseQuery = searchQuery.toLowerCase();
    
    const scoredLyrics = lyrics.map(item => {
      let score = 0;
      
      // Helper function to check term matches
      const checkTermMatches = (field, weight) => {
        if (!field) return 0;
        const lowerField = field.toLowerCase();
        // Exact match bonus
        if (lowerField.includes(lowerCaseQuery)) {
          score += 10 * weight;
        }
        // Individual terms bonus
        const matchingTerms = terms.filter(term => 
          lowerField.includes(term.toLowerCase())
        ).length;
        score += matchingTerms * weight;
      };

      // Add numbering search
      const numberQuery = parseInt(searchQuery);
      if (!isNaN(numberQuery)) {
        // Check both order and numbering properties
        const itemNumber = item.order || item.numbering;
        if (itemNumber === numberQuery) {
          score += 100; // High priority for exact number matches
        }
      }

      // Prioritize matches: Title (highest), Content (medium), Tags (lowest)
      checkTermMatches(item.title, 10);     // Title matches get 10x weight
      checkTermMatches(item.content, 5);    // Content matches get 5x weight
      if (Array.isArray(item.tags)) {
        item.tags.forEach(tag => checkTermMatches(tag, 2)); // Tag matches get 2x weight
      }
      
      return { item, score };
    }).filter(({ score }) => score > 0);
    
    // Sort by score in descending order
    scoredLyrics.sort((a, b) => b.score - a.score);
    
    // Add filtered index to search results
    return scoredLyrics.map((obj, index) => ({
      ...obj.item,
      displayNumbering: obj.item.order || obj.item.numbering,
      filteredIndex: index + 1
    }));
  }, [lyrics, searchQuery]);

  // Update the search query when a suggestion is tapped.
  const handleSuggestionClick = suggestion => {
    setSearchQuery(suggestion);
  };

  // Navigate to the details view for a lyric with proper filtered index
  const handleItemPress = item => {
    const searchResults = filteredLyrics.map((lyric, index) => ({
      ...lyric,
      filteredIndex: index + 1
    }));
    navigation.navigate('Details', {
      Lyrics: searchResults,
      itemNumberingparas: item.filteredIndex
    });
  };

  const onRefresh = useCallback(() => {
    loadLyrics();
  }, [loadLyrics]);

  // Updated highlightSearchTerms to use the first line that contains any search term (matchingLine logic) like the old behavior
  const highlightSearchTerms = (text, terms) => {
    if (!text) return null;
    const lines = text.split('\n');
    const matchingLine = lines.find(line => terms.some(term => line.toLowerCase().includes(term.toLowerCase())));
    const lineToProcess = matchingLine || lines[0];
    const escapedTerms = terms.map(term => escapeRegExp(term));
    const regex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
    const parts = lineToProcess.split(regex);
    return parts.map((part, index) => {
      const isMatch = terms.some(term => term.toLowerCase() === part.toLowerCase());
      return isMatch ? (
        <Text key={index} style={styles.highlight}>
          {part}
        </Text>
      ) : (
        part
      );
    });
  };

  // Update renderItem function to use ListItem component for consistent styling
  const renderItem = ({item}) => {
    const terms = searchQuery.split(' ').filter(Boolean);
    return (
      <ListItem
        item={item}
        themeColors={themeColors}
        onItemPress={handleItemPress}
        searchTerms={terms}
        highlightFunction={highlightSearchTerms}
      />
    );
  };

  // Filter suggestions based on current search query.
  const filteredSuggestions = useMemo(
    () =>
      suggestions.filter(s =>
        s && s.toLowerCase().includes(searchQuery.trim().toLowerCase()),
      ),
    [suggestions, searchQuery],
  );

  return (
    <Provider>
      <Portal>
        <Modal visible={loading} transparent animationType="fade">
          <View style={styles.modalContainer}>
            <ActivityIndicator size="large" color={themeColors.primary} />
            <Text style={styles.loadingText}>Loading lyrics...</Text>
          </View>
        </Modal>
      </Portal>
      <SafeAreaView
        style={[
          {backgroundColor: themeColors.background},
          styles.container,
        ]}>
        <Searchbar
          placeholder="Search lyrics, artist, or tags"
          ref={searchbarRef}
          onChangeText={handleSearch}
          value={searchQuery}
          iconColor={themeColors.text}
          style={[styles.searchbar, {backgroundColor: themeColors.cardBackground}]}
          inputStyle={{fontSize: 16, color: themeColors.text}}
          placeholderTextColor={themeColors.text}
        />
        {!!searchQuery.trim() && filteredSuggestions.length > 0 && (
          <View style={[styles.suggestionsContainer, {backgroundColor: themeColors.card}]}>
            <FlatList
              data={filteredSuggestions}
              renderItem={({item}) => (
                <List.Item
                  title={item}
                  onPress={() => handleSuggestionClick(item)}
                  titleStyle={[styles.suggestionItem, {color: themeColors.primary}]}
                />
              )}
              keyExtractor={(item, index) => index.toString()}
              style={styles.suggestionsList}
            />
          </View>
        )}
        {filteredLyrics.length === 0 && searchQuery.trim() && (
          <Text style={[styles.noResultsText, {color: themeColors.text}]}>
            No results found
          </Text>
        )}
        <FlatList
          data={filteredLyrics}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          ListEmptyComponent={<EmptyList />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContainer}
        />
      </SafeAreaView>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  searchbar: {
    marginVertical: 15,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  suggestionsContainer: {
    maxHeight: 250,
    marginTop: 5,
    borderRadius: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
  suggestionsList: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  suggestionItem: {
    fontSize: 16,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginVertical: 4,
    borderRadius: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 6,
    // Background will be overridden by theme
    backgroundColor: '#ffffff',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  numberingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#6200EE',
    width: 36,
    height: 36,
    borderRadius: 18,
    textAlign: 'center',
    textAlignVertical: 'center',
    marginRight: 12,
  },
  detailsContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
  },
  highlight: {
    backgroundColor: 'rgba(255, 235, 59, 0.4)',
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
    textAlign: 'center',
    marginTop: 30,
  },
});

export default Search;
