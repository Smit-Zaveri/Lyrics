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
import { LanguageContext } from '../context/LanguageContext';

// Precompiled regex patterns for suggestion fixes
const camelCaseRegex = /([a-z])([A-Z])/g;
const devanagariRegex = /([a-zA-Z])([\u0A80-\u0AFF])/g;

// Helper function to escape regex special characters in search terms
const escapeRegex = term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const Search = ({route}) => {
  const {collectionName} = route.params;
  const navigation = useNavigation();
  const { themeColors } = useContext(ThemeContext);
  const { getString } = useContext(LanguageContext);
  const searchbarRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [lyrics, setLyrics] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const focusTimeout = setTimeout(() => {
      searchbarRef.current?.focus();
    }, 500);
    return () => clearTimeout(focusTimeout);
  }, []);

  // Function to get content in the user's selected language
  const getLocalizedContent = (item) => {
    if (!item) return '';
    
    // Handle array-based content structure
    if (Array.isArray(item.content)) {
      return getString(item.content);
    }
    
    // Fallback to string-based content for backward compatibility
    return item.content;
  };

  // Function to get title in the user's selected language
  const getLocalizedTitle = (item) => {
    if (!item) return '';
    
    // Handle array-based title structure
    if (Array.isArray(item.title)) {
      return getString(item.title);
    }
    
    // Fallback to string-based title for backward compatibility
    return item.title;
  };

  // Get suggestions based on the lyrics data
  const generateSuggestions = useCallback(lyricsData => {
    const suggestions = new Set();
    lyricsData.forEach(item => {
      // Add words from all language versions of title
      if (Array.isArray(item.title)) {
        item.title.forEach(titleVersion => {
          if (titleVersion) {
            titleVersion.split(' ').forEach(word => {
              if (word.length > 2) {
                suggestions.add(word);
              }
            });
          }
        });
      } else if (item.title) {
        item.title.split(' ').forEach(word => {
          if (word.length > 2) {
            suggestions.add(word);
          }
        });
      }

      // Add words from all language versions of content
      if (Array.isArray(item.content)) {
        item.content.forEach(contentVersion => {
          if (contentVersion) {
            contentVersion.split(' ').forEach(word => {
              if (word.length > 2) {
                suggestions.add(word);
              }
            });
          }
        });
      } else if (item.content) {
        item.content.split(' ').forEach(word => {
          if (word.length > 2) {
            suggestions.add(word);
          }
        });
      }

      // Add words from all language versions of tags
      if (Array.isArray(item.tags)) {
        item.tags.forEach(tag => {
          if (Array.isArray(tag)) {
            tag.forEach(tagVersion => {
              if (tagVersion && tagVersion.length > 2) {
                suggestions.add(tagVersion);
              }
            });
          } else if (tag && tag.length > 2) {
            suggestions.add(tag);
          }
        });
      }
    });

    return Array.from(suggestions);
  }, [getString]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedData = await getFromAsyncStorage(collectionName);
      if (fetchedData) {
        setLyrics(fetchedData);
        const newSuggestions = generateSuggestions(fetchedData);
        setSuggestions(newSuggestions);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [collectionName, generateSuggestions]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  }, [loadData]);

  const filteredLyrics = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const terms = searchQuery
      .toLowerCase()
      .trim()
      .split(' ')
      .filter(Boolean)
      .map(escapeRegex);

    if (terms.length === 0) return [];

    const searchRegexes = terms.map(term => new RegExp(term, 'gi'));

    return lyrics
      .filter(item => {
        // Search in all language versions of title and content
        const allTitles = Array.isArray(item.title) ? item.title.join(' ') : item.title || '';
        const allContent = Array.isArray(item.content) ? item.content.join(' ') : item.content || '';
        
        // Get tags in all languages
        const tags = Array.isArray(item.tags) 
          ? item.tags.map(tag => Array.isArray(tag) ? tag.join(' ') : tag).join(' ')
          : '';

        const searchableText = `${allTitles} ${allContent} ${tags}`.toLowerCase();

        return searchRegexes.every(regex => searchableText.match(regex));
      })
      .map((item, index) => ({
        ...item,
        displayNumbering: item.order || item.numbering || index + 1,
        filteredIndex: index + 1,
      }));
  }, [searchQuery, lyrics]);

  const highlightSearchTerms = useCallback((text, searchTerms) => {
    if (!text || !searchTerms || searchTerms.length === 0) {
      return text;
    }

    const regex = new RegExp(
      `(${searchTerms.map(escapeRegex).join('|')})`,
      'gi',
    );

    return text.split(regex).map((part, index) => {
      if (regex.test(part)) {
        return (
          <Text key={index} style={[styles.highlight, {color: themeColors.text}]}>
            {part}
          </Text>
        );
      }
      return part;
    });
  }, [themeColors]);

  const handleSearch = query => {
    setSearchQuery(query);
  };

  const handleSuggestionClick = suggestion => {
    setSearchQuery(suggestion);
  };

  const handleItemPress = item => {
    navigation.navigate('Details', {
      Lyrics: filteredLyrics,
      itemNumberingparas: item.filteredIndex,
    });
  };

  // Update renderItem to use localized content
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

  // Filter suggestions based on current search query
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
          <View style={styles.noResultsContainer}>
            <Text style={[styles.noResultsText, {color: themeColors.text}]}>
              No results found
            </Text>
          </View>
        )}
        <FlatList
          data={filteredLyrics}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          ListEmptyComponent={<EmptyList />}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={[
            styles.listContainer,
            !filteredLyrics.length && styles.emptyListContainer,
          ]}
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
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  numberingContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  numberingText: {
    width: 40,
    height: 40,
    lineHeight: 40,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    borderRadius: 20,
    overflow: 'hidden',
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
    flexGrow: 1,
    paddingBottom: 20,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
  },
});

export default Search;
