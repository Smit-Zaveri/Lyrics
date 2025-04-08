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
  Image,
  TouchableOpacity,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {getFromAsyncStorage, refreshAllData} from '../../config/DataService';
import {ThemeContext} from '../../../App';
import {LanguageContext} from '../../context/LanguageContext';
import {useSingerMode} from '../../context/SingerModeContext';

const HomeList = () => {
  const navigation = useNavigation();
  const {themeColors} = useContext(ThemeContext);
  const {getString} = useContext(LanguageContext);
  const {isSingerMode} = useSingerMode();

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [networkStatus, setNetworkStatus] = useState(true);

  // Check for network status changes
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected;
      setNetworkStatus(isConnected);

      // If connection is restored, fetch data automatically
      if (isConnected && error) {
        loadData(true);
      }
    });

    // Check initial network status
    NetInfo.fetch().then(state => {
      setNetworkStatus(state.isConnected);
    });

    return () => unsubscribe();
  }, [error, loadData]);

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
          setError('no_connection');
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

  // Custom No Connection View
  const NoConnectionView = () => (
    <View
      style={[
        styles.noConnectionContainer,
        {backgroundColor: themeColors.background},
      ]}>
      <Image
        source={require('../../assets/logo.png')}
        style={styles.noConnectionImage}
        resizeMode="contain"
      />
      <Text style={[styles.noConnectionTitle, {color: themeColors.text}]}>
        No Internet Connection
      </Text>
      <Text
        style={[
          styles.noConnectionSubtitle,
          {color: themeColors.textSecondary},
        ]}>
        Please check your internet connection and try again
      </Text>
      <Pressable
        onPress={() => loadData(true)}
        style={[styles.retryButton, {backgroundColor: themeColors.primary}]}>
        <Text style={styles.retryText}>Retry</Text>
      </Pressable>
    </View>
  );

  if (isLoading) {
    return (
      <View
        style={[styles.centered, {backgroundColor: themeColors.background}]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  if (error === 'no_connection') {
    return <NoConnectionView />;
  } else if (error) {
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
      {isSingerMode && (
        <TouchableOpacity
          style={[styles.fab, {backgroundColor: themeColors.primary}]}
          onPress={() => navigation.navigate('SingerMode')}>
          <Icon name="mic" size={24} color="#fff" />
        </TouchableOpacity>
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
  noConnectionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noConnectionImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  noConnectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  noConnectionSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
});

export default HomeList;
