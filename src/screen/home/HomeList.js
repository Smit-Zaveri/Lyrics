import React, {useState, useEffect, useCallback, useContext} from 'react';
import {
  FlatList,
  Text,
  StyleSheet,
  View,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {getFromAsyncStorage, refreshAllData} from '../../config/DataService';
import {ThemeContext} from '../../../App';
import {LanguageContext} from '../../context/LanguageContext';

const HomeList = () => {
  const navigation = useNavigation();
  const {themeColors} = useContext(ThemeContext);
  const {getString} = useContext(LanguageContext);

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    }
    try {
      const collections = await getFromAsyncStorage('collections');
      if (collections && collections.length > 0) {
        // Make sure collections is an array before sorting
        const sortedCollections = [...collections].sort(
          (a, b) => (a.numbering || 0) - (b.numbering || 0),
        );
        setData(sortedCollections);
      } else {
        const isConnected = await refreshAllData();
        if (isConnected) {
          const refreshedCollections = await getFromAsyncStorage('collections');
          // Make sure refreshedCollections is an array before sorting
          if (refreshedCollections && refreshedCollections.length > 0) {
            const sortedCollections = [...refreshedCollections].sort(
              (a, b) => (a.numbering || 0) - (b.numbering || 0),
            );
            setData(sortedCollections);
          } else {
            setData([]);
          }
        } else {
          // No internet connection and no cached data
          setData([]);
          setError(
            'No internet connection. Please connect to the internet and try again.',
          );
        }
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError(`Error loading data: ${error.message}`);
      setData([]);
    } finally {
      setIsLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Get localized display name based on the user's language preference
  const getLocalizedDisplayName = item => {
    // Check if displayName is an array for multi-language support
    if (Array.isArray(item.displayName)) {
      return getString(item.displayName);
    }

    // Fallback to the regular displayName if it exists
    if (item.displayName) {
      return item.displayName;
    }

    // Final fallback to the collection name
    return item.name;
  };

  const handleItemPress = useCallback(
    item => () => {
      navigation.navigate('List', {
        collectionName: item.name,
        Tags: 'tags',
        // Pass the original displayName array if available, enabling instant language updates
        title: Array.isArray(item.displayName)
          ? item.displayName
          : item.displayName || item.name,
      });
    },
    [navigation],
  );

  const renderItem = ({item}) => {
    const displayName = getLocalizedDisplayName(item);

    return (
      <Pressable
        onPress={handleItemPress(item)}
        style={({pressed}) => [
          styles.itemContainer,
          {
            backgroundColor: pressed
              ? themeColors.surface
              : themeColors.background,
            borderBottomColor:
              themeColors.border || themeColors.divider || '#444',
          },
        ]}>
        <View style={styles.leftContainer}>
          <View style={styles.numberingContainer}>
            <Text
              style={[
                styles.numberingText,
                {backgroundColor: themeColors.primary, color: '#fff'},
              ]}>
              {item.numbering}
            </Text>
          </View>
          <View style={styles.detailsContainer}>
            <Text style={[styles.title, {color: themeColors.text}]}>
              {displayName}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  if (isLoading) {
    return (
      <View
        style={[styles.centered, {backgroundColor: themeColors.background}]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[styles.centered, {backgroundColor: themeColors.background}]}>
        <Text style={{color: themeColors.error}}>{error}</Text>
        <Pressable
          onPress={() => loadData(true)}
          style={[styles.retryButton, {backgroundColor: themeColors.primary}]}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.flex, {backgroundColor: themeColors.background}]}>
      {data.length > 0 ? (
        <FlatList
          contentContainerStyle={{backgroundColor: themeColors.background}}
          data={data}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => loadData(true)}
            />
          }
          getItemLayout={(data, index) => ({
            length: 70,
            offset: 70 * index,
            index,
          })}
        />
      ) : (
        <View
          style={[styles.centered, {backgroundColor: themeColors.background}]}>
          <Text style={{color: themeColors.text}}>
            No collections available. Pull down to refresh.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  itemContainer: {
    borderBottomWidth: 0.5,
    padding: 12,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftContainer: {flexDirection: 'row', alignItems: 'center', flex: 1},
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
  detailsContainer: {flex: 1},
  title: {fontWeight: 'bold', fontSize: 16},
  retryButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  retryText: {color: '#fff', fontWeight: 'bold'},
});

export default HomeList;
