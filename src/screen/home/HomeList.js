import NetInfo from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';
import { useCallback, useContext, useEffect, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ThemeContext } from '../../../App';
import HomeSkeleton from '../../components/HomeSkeleton';
import { getFromAsyncStorage, refreshAllData } from '../../config/dataService';
import { LanguageContext } from '../../context/LanguageContext';
import { useSingerMode } from '../../context/SingerModeContext';

// HomeList component displays the main list of collections
const HomeList = () => {
  const navigation = useNavigation();
  const { themeColors } = useContext(ThemeContext);
  const { getString } = useContext(LanguageContext);
  const { isSingerMode } = useSingerMode();

  // State for data, loading, refreshing, error, and network status
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [networkStatus, setNetworkStatus] = useState(true);

  // Helper function to process collections: filter, sort, and renumber
  const processCollections = useCallback((collections) => {
    return [...collections]
      .filter(collection => {
        // Filter out added-songs if singer mode is off
        if (!isSingerMode && collection.name === 'added-songs') return false;
        return true;
      })
      .sort((a, b) => (a.numbering || 0) - (b.numbering || 0))
      .map((collection, index) => ({
        ...collection,
        numbering: index + 1,
      }));
  }, [isSingerMode]);

  // Effect to monitor network status and auto-refresh on reconnection
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const isConnected = state.isConnected;
      setNetworkStatus(isConnected);
      // Auto-refresh data if connection restored and there was an error
      if (isConnected && error) loadData(true);
    });
    // Initial network check
    NetInfo.fetch().then(state => setNetworkStatus(state.isConnected));
    return () => unsubscribe();
  }, [error, loadData]);

  // Load data from storage or refresh from server
  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      let collections;
      if (isRefresh && networkStatus) {
        // Refresh data from server if online
        await refreshAllData();
      }
      collections = await getFromAsyncStorage('collections');
      if (collections && collections.length > 0) {
        setData(processCollections(collections));
        setError(null);
      } else {
        // No cached data, try refresh if online
        const isConnected = await refreshAllData();
        if (isConnected) {
          collections = await getFromAsyncStorage('collections');
          if (collections && collections.length > 0) {
            setData(processCollections(collections));
            setError(null);
          } else {
            setData([]);
          }
        } else {
          setData([]);
          setError('no_connection');
        }
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError(`Error loading data: ${err.message}`);
      setData([]);
    } finally {
      setIsLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, [networkStatus, processCollections]);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Get localized display name for items
  const getLocalizedDisplayName = item => {
    if (Array.isArray(item.displayName)) return getString(item.displayName);
    return item.displayName || item.name;
  };

  // Handle item press to navigate to list
  const handleItemPress = useCallback(item => () => {
    navigation.navigate('List', {
      collectionName: item.name,
      Tags: 'tags',
      title: Array.isArray(item.displayName) ? item.displayName : item.displayName || item.name,
    });
  }, [navigation]);

  // Render each item in the list
  const renderItem = ({ item, index }) => {
    const displayName = getLocalizedDisplayName(item);
    return (
      <Pressable
        onPress={handleItemPress(item)}
        style={({ pressed }) => [
          styles.itemContainer,
          index === 0 && styles.firstItem,
          {
            backgroundColor: pressed ? themeColors.surface + '30' : themeColors.surface,
            ...Platform.select({
              ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.08,
                shadowRadius: 3,
              },
              android: { elevation: 2 },
            }),
          },
        ]}>
        <View style={styles.leftContainer}>
          <View style={styles.numberingContainer}>
            <Text style={[styles.numberingText, { color: themeColors.primary }]}>
              {item.numbering}
            </Text>
          </View>
          <View style={styles.detailsContainer}>
            <Text style={[styles.title, { color: themeColors.text }]}>
              {displayName}
            </Text>
          </View>
          <Icon
            name="chevron-right"
            size={24}
            color={themeColors.textSecondary || '#797979'}
            style={styles.chevronIcon}
          />
        </View>
      </Pressable>
    );
  };

  // Component for no connection state
  const NoConnectionView = () => (
    <View style={[styles.noConnectionContainer, { backgroundColor: themeColors.background }]}>
      <View style={[styles.noConnectionCard, { backgroundColor: themeColors.surface }]}>
        <View style={[styles.noConnectionIconWrap, { backgroundColor: `${themeColors.primary}1A` }]}>
          <Icon name="signal-wifi-off" size={40} color={themeColors.primary} />
        </View>
        <Text style={[styles.noConnectionTitle, { color: themeColors.text }]}>
          Internet Required
        </Text>
        <Text style={[styles.noConnectionSubtitle, { color: themeColors.textSecondary }]}>
          Connect once to load content. After that, offline works.
        </Text>
        <Pressable
          onPress={() => loadData(true)}
          disabled={refreshing}
          style={({ pressed }) => [
            styles.retryButton,
            { backgroundColor: themeColors.primary },
            pressed && !refreshing && styles.retryButtonPressed,
            refreshing && styles.retryButtonDisabled,
          ]}>
          <Text style={styles.retryText}>
            {refreshing ? 'Retrying...' : 'Retry'}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  // Render loading skeleton
  if (isLoading || refreshing) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: themeColors.background }]}>
        <HomeSkeleton themeColors={themeColors} />
      </SafeAreaView>
    );
  }

  // Render no connection view
  if (error === 'no_connection') return <NoConnectionView />;

  // Render error view
  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: themeColors.background }]}>
        <Text style={{ color: themeColors.error }}>{error}</Text>
        <Pressable
          onPress={() => loadData(true)}
          disabled={refreshing}
          style={({ pressed }) => [
            styles.retryButton,
            { backgroundColor: themeColors.primary },
            pressed && !refreshing && styles.retryButtonPressed,
            refreshing && styles.retryButtonDisabled,
          ]}>
          <Text style={styles.retryText}>
            {refreshing ? 'Retrying...' : 'Retry'}
          </Text>
        </Pressable>
      </View>
    );
  }

  // Main render
  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: themeColors.background }]}>
      {data.length > 0 ? (
        <FlatList
          contentContainerStyle={{ backgroundColor: themeColors.background }}
          data={data}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => loadData(true)} />}
          getItemLayout={(data, index) => ({ length: 70, offset: 70 * index, index })}
        />
      ) : (
        <View style={[styles.centered, { backgroundColor: themeColors.background }]}>
          <Text style={{ color: themeColors.text }}>
            No collections available. Pull down to refresh.
          </Text>
        </View>
      )}
      {/* Floating action button for singer mode */}
      {isSingerMode && (
        <View style={{ position: 'absolute', bottom: 20, right: 20, alignItems: 'center' }}>
          <TouchableOpacity
            style={[styles.fab, { backgroundColor: themeColors.primary }]}
            onPress={() => navigation.navigate('SingerMode')}>
            <Icon name="music-note" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={{ marginTop: 4, fontSize: 12, fontWeight: 'bold', color: themeColors.text }}>
            Singer Mode
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
	marginHorizontal: 16,
	marginVertical: 6,
	borderRadius: 12,
	padding: 16,
	height: 72,
	flexDirection: 'row',
	alignItems: 'center',
  },
  firstItem: {
	marginTop: 12,
  },
  leftContainer: {flexDirection: 'row', alignItems: 'center', flex: 1},
  numberingContainer: {
	width: 44,
	height: 44,
	justifyContent: 'center',
	alignItems: 'center',
	marginRight: 14,
	borderRadius: 12,
	backgroundColor: 'rgba(103, 58, 183, 0.1)',
  },
  numberingText: {
	fontSize: 18,
	fontWeight: '700',
	textAlign: 'center',
  },
  detailsContainer: {flex: 1},
  title: {fontWeight: '600', fontSize: 16},
  chevronIcon: {
	opacity: 0.6,
  },
  retryButton: {
	marginTop: 20,
	paddingVertical: 12,
	paddingHorizontal: 30,
	borderRadius: 8,
	...Platform.select({
	  ios: {
		shadowColor: '#000',
		shadowOffset: {width: 0, height: 2},
		shadowOpacity: 0.1,
		shadowRadius: 4,
	  },
	  android: {
		elevation: 3,
	  },
	}),
  },
  retryButtonPressed: {
	opacity: 0.7,
	transform: [{scale: 0.95}],
  },
  retryButtonDisabled: {
	opacity: 0.6,
  },
  retryText: {color: '#fff', fontWeight: 'bold', fontSize: 16},
  noConnectionContainer: {
	flex: 1,
	justifyContent: 'center',
	alignItems: 'center',
	padding: 24,
  },
  noConnectionCard: {
	width: '100%',
	maxWidth: 360,
	paddingVertical: 28,
	paddingHorizontal: 24,
	borderRadius: 20,
	alignItems: 'center',
	...Platform.select({
	  ios: {
		shadowColor: '#000',
		shadowOffset: {width: 0, height: 4},
		shadowOpacity: 0.12,
		shadowRadius: 14,
	  },
	  android: {
		elevation: 7,
	  },
	}),
  },
  noConnectionIconWrap: {
	width: 64,
	height: 64,
	borderRadius: 32,
	alignItems: 'center',
	justifyContent: 'center',
	marginBottom: 20,
  },
  noConnectionTitle: {
	fontSize: 22,
	fontWeight: '700',
	marginBottom: 10,
	textAlign: 'center',
  },
  noConnectionSubtitle: {
	fontSize: 15,
	textAlign: 'center',
	marginBottom: 24,
	lineHeight: 22,
  },
  fab: {
	position: 'absolute',
	bottom: 20,
	// right: 20,
	width: 56,
	height: 56,
	borderRadius: 28,
	justifyContent: 'center',
	alignItems: 'center',
	elevation: 4,
  },
});

export default HomeList;
