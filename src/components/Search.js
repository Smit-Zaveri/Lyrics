import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  useColorScheme
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSearchHistory } from '../hooks/useSearchHistory';
import { colors } from '../theme/Theme';

const Search = ({ onSearch, placeholder = "Search..." }) => {
  const [query, setQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true); // Changed to true by default
  const { searchHistory, addToHistory, removeFromHistory, getFilteredHistory, clearHistory } = useSearchHistory();
  const systemTheme = useColorScheme();
  const themeColors = systemTheme === 'dark' ? colors.dark : colors.light;

  // Add debug logging
  useEffect(() => {
    console.log('Current search history:', searchHistory);
  }, [searchHistory]);

  const handleSearch = useCallback((searchTerm) => {
    setQuery(searchTerm);
    setShowSuggestions(false);
    addToHistory(searchTerm);
    onSearch(searchTerm);
  }, [addToHistory, onSearch]);

  const handleRemoveItem = useCallback((term) => {
    removeFromHistory(term);
  }, [removeFromHistory]);

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity
      style={styles.historyItem}
      onPress={() => handleSearch(item.term)}
    >
      <View style={styles.historyItemContent}>
        <MaterialCommunityIcons 
          name="history" 
          size={20} 
          color={themeColors.text}
        />
        <Text style={[styles.historyText, { color: themeColors.text }]}>
          {item.term}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => handleRemoveItem(item.term)}
        style={styles.removeButton}
      >
        <MaterialCommunityIcons 
          name="close" 
          size={20} 
          color={themeColors.text}
        />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: themeColors.card }]}>
        <MaterialCommunityIcons 
          name="magnify" 
          size={24} 
          color={themeColors.text}
        />
        <TextInput
          style={[styles.input, { color: themeColors.text }]}
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            setShowSuggestions(true);
          }}
          onSubmitEditing={() => handleSearch(query)}
          placeholder={placeholder}
          placeholderTextColor={themeColors.text}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')}>
            <MaterialCommunityIcons 
              name="close" 
              size={24} 
              color={themeColors.text}
            />
          </TouchableOpacity>
        )}
      </View>

      {searchHistory.length > 0 && (  // Removed showSuggestions check
        <View style={[styles.suggestionsContainer, { backgroundColor: themeColors.card }]}>
          <View style={styles.historyHeader}>
            <Text style={[styles.historyTitle, { color: themeColors.text }]}>
              Recent Searches
            </Text>
            <TouchableOpacity onPress={clearHistory}>
              <Text style={[styles.clearButton, { color: themeColors.primary }]}>
                Clear All
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={getFilteredHistory(query)}
            renderItem={renderHistoryItem}
            keyExtractor={(item, index) => `${item.term}-${index}`}
            style={styles.historyList}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  suggestionsContainer: {
    marginTop: 10,
    borderRadius: 10,
    padding: 10,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    fontSize: 14,
  },
  historyList: {
    maxHeight: 200,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  historyItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  historyText: {
    marginLeft: 10,
    fontSize: 16,
  },
  removeButton: {
    padding: 5,
  },
});

export default Search;
