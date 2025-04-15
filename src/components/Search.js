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
  TouchableOpacity,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {Searchbar, List, Portal, Provider, Chip} from 'react-native-paper';
import {getFromAsyncStorage} from '../config/DataService';
import {colors} from '../theme/Theme';
import EmptyList from './EmptyList';
import ListItem from './ListItem';
import {ThemeContext} from '../../App';
import {LanguageContext} from '../context/LanguageContext';
import Fuse from 'fuse.js';
import {transliterate} from 'transliteration';

// Precompiled regex patterns for suggestion fixes
const camelCaseRegex = /([a-z])([A-Z])/g;
const devanagariRegex = /([a-zA-Z])([\u0A80-\u0AFF])/g;

// Helper function to escape regex special characters in search terms
const escapeRegex = term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Define Gujarati/Hindi common characters ranges for script detection
const GUJARATI_CHARS = /[\u0A80-\u0AFF]/;
const HINDI_CHARS = /[\u0900-\u097F]/;

// Function to detect if text has Gujarati or Hindi characters
const hasIndicChars = text => {
  return GUJARATI_CHARS.test(text) || HINDI_CHARS.test(text);
};

// Function to attempt converting Latin to approximate Indic script sounds
// This is a very simple approximation - won't be perfect but helps with search
const latinToIndic = text => {
  // Simple mapping for common sounds with both Gujarati and Hindi equivalents
  const indicSounds = {
    // Gujarati vowels
    aa: 'આ',
    ee: 'ઈ',
    oo: 'ઉ',
    a: 'અ',
    e: 'એ',
    i: 'ઇ',
    o: 'ઓ',
    u: 'ઉ',

    // Hindi vowels
    'aa-h': 'आ',
    'ee-h': 'ई',
    'oo-h': 'ऊ',
    'a-h': 'अ',
    'e-h': 'ए',
    'i-h': 'इ',
    'o-h': 'ओ',
    'u-h': 'उ',

    // Gujarati consonants
    k: 'ક',
    g: 'ગ',
    ch: 'ચ',
    j: 'જ',
    t: 'ત',
    d: 'દ',
    n: 'ન',
    p: 'પ',
    b: 'બ',
    m: 'મ',
    y: 'ય',
    r: 'ર',
    l: 'લ',
    v: 'વ',
    s: 'સ',
    h: 'હ',
    sh: 'શ',

    // Hindi consonants
    'k-h': 'क',
    'g-h': 'ग',
    'ch-h': 'च',
    'j-h': 'ज',
    't-h': 'त',
    'd-h': 'द',
    'n-h': 'न',
    'p-h': 'प',
    'b-h': 'ब',
    'm-h': 'म',
    'y-h': 'य',
    'r-h': 'र',
    'l-h': 'ल',
    'v-h': 'व',
    's-h': 'स',
    'h-h': 'ह',
    'sh-h': 'श',
  };

  // This is just a simple approximation
  let result = text.toLowerCase();

  // First try specific Hindi mappings (with -h suffix)
  Object.keys(indicSounds).forEach(sound => {
    result = result.replace(new RegExp(sound, 'g'), indicSounds[sound]);
  });

  // Create a combined result with both scripts for better search matching
  let hindiResult = '';
  let gujaratiResult = '';

  // Basic conversion for simple characters to both scripts
  // This helps with searching when language is not specified
  const basicConversions = {
    a: ['अ', 'અ'],
    e: ['ए', 'એ'],
    i: ['इ', 'ઇ'],
    o: ['ओ', 'ઓ'],
    u: ['उ', 'ઉ'],
    k: ['क', 'ક'],
    g: ['ग', 'ગ'],
    ch: ['च', 'ચ'],
    j: ['ज', 'જ'],
    t: ['त', 'ત'],
    d: ['द', 'દ'],
    n: ['न', 'ન'],
    p: ['प', 'પ'],
    b: ['ब', 'બ'],
    m: ['म', 'મ'],
    r: ['र', 'ર'],
  };

  // Apply basic conversions to generate results in both scripts
  const chars = text.toLowerCase().split('');
  chars.forEach(char => {
    if (basicConversions[char]) {
      hindiResult += basicConversions[char][0];
      gujaratiResult += basicConversions[char][1];
    } else {
      hindiResult += char;
      gujaratiResult += char;
    }
  });

  // Return the original mapping plus additional Hindi and Gujarati approximations
  return result + ' ' + hindiResult + ' ' + gujaratiResult;
};

// Debounce function to limit how often a function is called
const debounce = (func, wait) => {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};

const Search = ({route}) => {
  const {collectionName} = route.params;
  const navigation = useNavigation();
  const {themeColors} = useContext(ThemeContext);
  const {getString} = useContext(LanguageContext);
  const searchbarRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [lyrics, setLyrics] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Add new states for fuzzy search
  const [fuseInstance, setFuseInstance] = useState(null);
  const [didYouMean, setDidYouMean] = useState('');
  const [fuzzyResults, setFuzzyResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const focusTimeout = setTimeout(() => {
      searchbarRef.current?.focus();
    }, 500);
    return () => clearTimeout(focusTimeout);
  }, []);

  // Function to get content in the user's selected language
  const getLocalizedContent = item => {
    if (!item) return '';

    // Handle array-based content structure
    if (Array.isArray(item.content)) {
      return getString(item.content);
    }

    // Fallback to string-based content for backward compatibility
    return item.content;
  };

  // Function to get title in the user's selected language
  const getLocalizedTitle = item => {
    if (!item) return '';

    // Handle array-based title structure
    if (Array.isArray(item.title)) {
      return getString(item.title);
    }

    // Fallback to string-based title for backward compatibility
    return item.title;
  };

  // Process data for fuzzy search
  const processDataForFuzzy = useCallback(data => {
    return data.map(item => {
      // Prepare title in all available languages for search
      const titles = Array.isArray(item.title)
        ? item.title.filter(Boolean)
        : [item.title].filter(Boolean);

      // Prepare content in all available languages for search
      const contents = Array.isArray(item.content)
        ? item.content.filter(Boolean)
        : [item.content].filter(Boolean);

      // Prepare tags in all available languages for search
      let tags = [];
      if (Array.isArray(item.tags)) {
        item.tags.forEach(tag => {
          if (Array.isArray(tag)) {
            tags = [...tags, ...tag.filter(Boolean)];
          } else if (tag) {
            tags.push(tag);
          }
        });
      }

      // Create transliterated versions for cross-language search
      const transliteratedTitles = titles
        .map(title => {
          try {
            return hasIndicChars(title)
              ? transliterate(title)
              : latinToIndic(title);
          } catch (e) {
            return '';
          }
        })
        .filter(Boolean);

      return {
        ...item,
        searchTitles: [...titles, ...transliteratedTitles],
        searchContents: contents,
        searchTags: tags,
      };
    });
  }, []);

  // Get suggestions based on the lyrics data
  const generateSuggestions = useCallback(
    lyricsData => {
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
    },
    [getString],
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const fetchedData = await getFromAsyncStorage(collectionName);
      if (fetchedData) {
        setLyrics(fetchedData);
        const newSuggestions = generateSuggestions(fetchedData);
        setSuggestions(newSuggestions);

        // Process data for fuzzy search
        const processedData = processDataForFuzzy(fetchedData);

        // Set up Fuse.js with options optimized for Indian languages
        const fuseOptions = {
          includeScore: true,
          shouldSort: true,
          threshold: 0.4, // Lower threshold means more strict matching
          location: 0,
          distance: 100,
          maxPatternLength: 32,
          minMatchCharLength: 2,
          keys: [
            {name: 'searchTitles', weight: 0.7},
            {name: 'searchContents', weight: 0.2},
            {name: 'searchTags', weight: 0.1},
          ],
        };

        setFuseInstance(new Fuse(processedData, fuseOptions));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [collectionName, generateSuggestions, processDataForFuzzy]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  }, [loadData]);

  // Handle fuzzy search with debouncing
  const performFuzzySearch = useCallback(
    debounce(query => {
      if (!query.trim() || !fuseInstance) {
        setFuzzyResults([]);
        setDidYouMean('');
        setIsSearching(false);
        return;
      }

      // Try both original and transliterated queries
      const searchTerms = [query];
      try {
        // If query has Indic characters, add transliterated version (to Latin)
        if (hasIndicChars(query)) {
          searchTerms.push(transliterate(query));
        } else {
          // If query has Latin characters, add approximated Indic version
          searchTerms.push(latinToIndic(query));
        }
      } catch (e) {
        // Transliteration failed, continue with original query
      }

      // Search with both versions
      let allResults = [];
      searchTerms.forEach(term => {
        const results = fuseInstance.search(term);
        allResults = [...allResults, ...results];
      });

      // Remove duplicates based on item.id
      const uniqueResults = Array.from(
        new Map(allResults.map(r => [r.item.id, r])).values(),
      );

      // Sort by score (lower is better)
      uniqueResults.sort((a, b) => a.score - b.score);

      // Get top results
      const bestResults = uniqueResults.slice(0, 50);

      // Map results to include display info
      const mappedResults = bestResults.map((result, index) => ({
        ...result.item,
        displayNumbering:
          result.item.order || result.item.numbering || index + 1,
        filteredIndex: index + 1,
        score: result.score,
      }));

      setFuzzyResults(mappedResults);

      // Generate "Did you mean" if no exact matches but close ones
      if (mappedResults.length === 0 && suggestions.length > 0) {
        // Find closest suggestion
        const fuzzySuggestions = new Fuse(suggestions, {
          threshold: 0.4,
          distance: 100,
        });

        const suggestResults = fuzzySuggestions.search(query);
        if (suggestResults.length > 0) {
          setDidYouMean(suggestResults[0].item);
        }
      } else {
        setDidYouMean('');
      }

      setIsSearching(false);
    }, 300),
    [fuseInstance, suggestions],
  );

  // Effect to trigger fuzzy search when query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      setIsSearching(true);
      performFuzzySearch(searchQuery.trim());
    } else {
      setFuzzyResults([]);
      setDidYouMean('');
    }
  }, [searchQuery, performFuzzySearch]);

  // Legacy filter logic (fallback)
  const filteredLyrics = useMemo(() => {
    // If we have fuzzy results, use those instead
    if (fuzzyResults.length > 0 || isSearching) {
      return fuzzyResults;
    }

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
        const allTitles = Array.isArray(item.title)
          ? item.title.join(' ')
          : item.title || '';
        const allContent = Array.isArray(item.content)
          ? item.content.join(' ')
          : item.content || '';

        // Get tags in all languages
        const tags = Array.isArray(item.tags)
          ? item.tags
              .map(tag => (Array.isArray(tag) ? tag.join(' ') : tag))
              .join(' ')
          : '';

        const searchableText =
          `${allTitles} ${allContent} ${tags}`.toLowerCase();

        return searchRegexes.every(regex => searchableText.match(regex));
      })
      .map((item, index) => ({
        ...item,
        displayNumbering: item.order || item.numbering || index + 1,
        filteredIndex: index + 1,
      }));
  }, [searchQuery, lyrics, fuzzyResults, isSearching]);

  const highlightSearchTerms = useCallback(
    (text, searchTerms) => {
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
            <Text
              key={index}
              style={[styles.highlight, {color: themeColors.text}]}>
              {part}
            </Text>
          );
        }
        return part;
      });
    },
    [themeColors],
  );

  const handleSearch = query => {
    setSearchQuery(query);
  };

  const handleSuggestionClick = suggestion => {
    setSearchQuery(suggestion);
  };

  const handleDidYouMeanClick = () => {
    if (didYouMean) {
      setSearchQuery(didYouMean);
    }
  };

  const handleItemPress = item => {
    navigation.navigate('Details', {
      Lyrics: filteredLyrics,
      itemNumberingparas: item.filteredIndex,
      previousScreen: 'Search',
    });
  };

  // Update renderItem to use localized content and show language indicator
  const renderItem = ({item}) => {
    const terms = searchQuery.split(' ').filter(Boolean);

    // Determine language of the item for display
    let itemLanguage = '';
    if (Array.isArray(item.title) && item.title.length > 0) {
      const firstTitle = item.title[0] || '';
      if (firstTitle && hasIndicChars(firstTitle)) {
        itemLanguage = GUJARATI_CHARS.test(firstTitle) ? 'ગુજરાતી' : 'हिंदी';
      } else {
        itemLanguage = 'ENG';
      }
    }

    return (
      <ListItem
        item={item}
        themeColors={themeColors}
        onItemPress={handleItemPress}
        searchTerms={terms}
        highlightFunction={highlightSearchTerms}
        language={itemLanguage}
      />
    );
  };

  // Filter suggestions based on current search query
  const filteredSuggestions = useMemo(
    () =>
      suggestions.filter(
        s => s && s.toLowerCase().includes(searchQuery.trim().toLowerCase()),
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
        style={[{backgroundColor: themeColors.background}, styles.container]}>
        <Searchbar
          placeholder="Search lyrics, artist, or tags"
          ref={searchbarRef}
          onChangeText={handleSearch}
          value={searchQuery}
          iconColor={themeColors.text}
          style={[
            styles.searchbar,
            {backgroundColor: themeColors.cardBackground},
          ]}
          inputStyle={{fontSize: 16, color: themeColors.text}}
          placeholderTextColor={themeColors.text}
        />

        {/* Did you mean suggestion */}
        {didYouMean && searchQuery.trim() && filteredLyrics.length === 0 && (
          <TouchableOpacity onPress={handleDidYouMeanClick}>
            <View style={styles.didYouMeanContainer}>
              <Text style={[styles.didYouMeanText, {color: themeColors.text}]}>
                Did you mean:{' '}
                <Text style={{color: themeColors.primary, fontWeight: 'bold'}}>
                  {didYouMean}
                </Text>
                ?
              </Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Suggestions */}
        {!!searchQuery.trim() && filteredSuggestions.length > 0 && (
          <View
            style={[
              styles.suggestionsContainer,
              {backgroundColor: themeColors.card},
            ]}>
            <FlatList
              data={filteredSuggestions}
              renderItem={({item}) => (
                <List.Item
                  title={item}
                  onPress={() => handleSuggestionClick(item)}
                  titleStyle={[
                    styles.suggestionItem,
                    {color: themeColors.primary},
                  ]}
                />
              )}
              keyExtractor={(item, index) => index.toString()}
              style={styles.suggestionsList}
            />
          </View>
        )}

        {/* No results message */}
        {filteredLyrics.length === 0 &&
          searchQuery.trim() &&
          !didYouMean &&
          !isSearching && (
            <View style={styles.noResultsContainer}>
              <Text style={[styles.noResultsText, {color: themeColors.text}]}>
                No results found
              </Text>
            </View>
          )}

        {/* Search in progress indicator */}
        {isSearching && (
          <View style={styles.searchingContainer}>
            <ActivityIndicator size="small" color={themeColors.primary} />
            <Text style={[styles.searchingText, {color: themeColors.text}]}>
              Searching...
            </Text>
          </View>
        )}

        {/* Results list */}
        <FlatList
          data={filteredLyrics}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          ListEmptyComponent={!searchQuery.trim() ? <EmptyList /> : null}
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
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
  },
  didYouMeanContainer: {
    padding: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  didYouMeanText: {
    fontSize: 16,
    textAlign: 'center',
  },
  searchingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginBottom: 10,
  },
  searchingText: {
    fontSize: 16,
    marginLeft: 10,
  },
  languageTag: {
    alignSelf: 'flex-start',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 4,
  },
  languageTagText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default Search;
