import { useNavigation } from '@react-navigation/native';
import Fuse from 'fuse.js';
import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Modal,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { List, Portal, Provider, Searchbar, Snackbar } from 'react-native-paper';
import { transliterate } from 'transliteration';
import { ThemeContext } from '../../App';
import { getFromAsyncStorage } from '../config/dataService';
import { LanguageContext } from '../context/LanguageContext';
import EmptyList from './EmptyList';
import ListItem from './ListItem';

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
  // Simple syllable-based mapping for Gujarati
  const gujaratiSyllables = {
    ka: 'ક',
    ga: 'ગ',
    cha: 'ચ',
    ja: 'જ',
    ta: 'ત',
    da: 'દ',
    na: 'ન',
    pa: 'પ',
    ba: 'બ',
    ma: 'મ',
    ya: 'ય',
    ra: 'ર',
    la: 'લ',
    va: 'વ',
    sa: 'સ',
    ha: 'હ',
    sha: 'શ',
    aa: 'આ',
    ee: 'ઈ',
    oo: 'ઉ',
    a: 'અ',
    e: 'એ',
    i: 'ઇ',
    o: 'ઓ',
    u: 'ઉ',
  };

  // Simple syllable-based mapping for Hindi
  const hindiSyllables = {
    ka: 'क',
    ga: 'ग',
    cha: 'च',
    ja: 'ज',
    ta: 'त',
    da: 'द',
    na: 'न',
    pa: 'प',
    ba: 'ब',
    ma: 'म',
    ya: 'य',
    ra: 'र',
    la: 'ल',
    va: 'व',
    sa: 'स',
    ha: 'ह',
    sha: 'श',
    aa: 'आ',
    ee: 'ई',
    oo: 'ऊ',
    a: 'अ',
    e: 'ए',
    i: 'इ',
    o: 'ओ',
    u: 'उ',
  };

  let gujaratiResult = text.toLowerCase();
  let hindiResult = text.toLowerCase();

  // Apply syllable replacements
  Object.keys(gujaratiSyllables).sort((a, b) => b.length - a.length).forEach(syllable => {
    gujaratiResult = gujaratiResult.replace(new RegExp(syllable, 'g'), gujaratiSyllables[syllable]);
  });

  Object.keys(hindiSyllables).sort((a, b) => b.length - a.length).forEach(syllable => {
    hindiResult = hindiResult.replace(new RegExp(syllable, 'g'), hindiSyllables[syllable]);
  });

  return gujaratiResult + ' ' + hindiResult;
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
  const [isFocused, setIsFocused] = useState(false);

  // Snackbar state
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Focus animation for search bar
  const focusAnim = useRef(new Animated.Value(0)).current;
  
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 150,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [focusAnim]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 150,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [focusAnim]);

  const searchBarScale = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.01],
  });

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
    [],
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

        // Check if collection is empty
        if (fetchedData.length === 0) {
          setSnackbarMessage('no songs for search');
          setSnackbarVisible(true);
          // Navigate back after a short delay to show the snackbar
          setTimeout(() => {
            navigation.goBack();
          }, 1500);
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }, [collectionName, generateSuggestions, processDataForFuzzy, navigation]);

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
        stableId:
          result.item.stableId ||
          result.item.id ||
          `item-${result.item.numbering || index}`,
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
        stableId: item.stableId || item.id || `item-${item.numbering || index}`,
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
      itemNumbering: item.filteredIndex,
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
        <Animated.View style={{transform: [{scale: searchBarScale}]}}>
          <Searchbar
            placeholder="Search lyrics, artist, or tags"
            ref={searchbarRef}
            onChangeText={handleSearch}
            onFocus={handleFocus}
            onBlur={handleBlur}
            value={searchQuery}
            iconColor={themeColors.text}
            style={[
              styles.searchbar,
              {backgroundColor: themeColors.cardBackground},
              isFocused && {elevation: 6, shadowRadius: 16, shadowOpacity: 0.2},
            ]}
            inputStyle={{fontSize: 16, color: themeColors.text, paddingLeft: 8}}
            placeholderTextColor={`${themeColors.text}80`}
            accessibilityLabel="Search lyrics"
            accessibilityHint="Enter text to search for songs, artists, or tags"
          />
        </Animated.View>

        {/* Did you mean suggestion */}
        {didYouMean && searchQuery.trim() && filteredLyrics.length === 0 && (
          <TouchableOpacity onPress={handleDidYouMeanClick}
            accessibilityLabel="Did you mean suggestion"
            accessibilityHint="Tap to use this suggested search term"
            accessibilityRole="button">
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
                  accessibilityLabel={`Search suggestion: ${item}`}
                  accessibilityHint="Tap to use this term in your search"
                  accessibilityRole="button"
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
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={Snackbar.DURATION_SHORT}
        action={{
          label: 'Go back',
          onPress: () => {
            setSnackbarVisible(false);
            navigation.goBack();
          },
        }}>
        {snackbarMessage}
      </Snackbar>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  searchbar: {
    marginVertical: 12,
    borderRadius: 25,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 0,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  suggestionsContainer: {
    maxHeight: 240,
    marginTop: 10,
    borderRadius: 18,
    borderWidth: 1,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  suggestionsList: {
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  suggestionItem: {
    fontSize: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    fontWeight: '500',
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    marginVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
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
    marginRight: 16,
    borderRadius: 20,
    opacity: 0.95,
  },
  numberingText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  detailsContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
    lineHeight: 24,
  },
  content: {
    fontSize: 15,
    lineHeight: 20,
    opacity: 0.8,
  },
  highlight: {
    backgroundColor: 'rgba(255, 235, 59, 0.3)',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  listContainer: {
    flexGrow: 1,
    paddingTop: 12,
    paddingBottom: 30,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  noResultsContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noResultsText: {
    fontSize: 16,
    textAlign: 'center',
  },
  didYouMeanContainer: {
    marginHorizontal: 12,
    marginVertical: 14,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    backgroundColor: 'rgba(103, 59, 183, 0.1)',
  },
  didYouMeanText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 20,
  },
  searchingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    marginHorizontal: 16,
    borderRadius: 12,
  },
  searchingText: {
    fontSize: 15,
    marginLeft: 10,
  },
  languageTag: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 6,
    opacity: 0.2,
  },
  languageTagText: {
    fontSize: 11,
    fontWeight: '600',
  },
});

export default Search;
