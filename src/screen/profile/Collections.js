import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../../App';

const Collections = ({ navigation }) => {
  const { themeColors } = useContext(ThemeContext);
  const [collections, setCollections] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadCollections();
  }, []);

  const loadCollections = async () => {
    try {
      const savedCollections = await AsyncStorage.getItem('user_collections');
      if (savedCollections) {
        setCollections(JSON.parse(savedCollections));
      }
    } catch (error) {
      console.error('Error loading collections:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCollections();
    setRefreshing(false);
  };

  const handleCollectionPress = (collection) => {
    navigation.navigate('List', {
      collectionName: collection.name,
      title: collection.name,
      customLyrics: collection.songs,
    });
  };

  const deleteCollection = async (collectionId) => {
    Alert.alert(
      'Delete Collection',
      'Are you sure you want to delete this collection?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedCollections = collections.filter(c => c.id !== collectionId);
              await AsyncStorage.setItem('user_collections', JSON.stringify(updatedCollections));
              setCollections(updatedCollections);
            } catch (error) {
              console.error('Error deleting collection:', error);
            }
          }
        }
      ]
    );
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.collectionItem, { borderBottomColor: themeColors.border }]}
      onPress={() => handleCollectionPress(item)}
    >
      <View style={styles.collectionInfo}>
        <Text style={[styles.collectionName, { color: themeColors.text }]}>{item.name}</Text>
        <Text style={[styles.songCount, { color: themeColors.placeholder }]}>
          {item.songs?.length || 0} songs
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => deleteCollection(item.id)}
        style={styles.deleteButton}
      >
        <MaterialCommunityIcons name="delete-outline" size={24} color={themeColors.error} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <FlatList
        data={collections}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[themeColors.primary]}
            tintColor={themeColors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: themeColors.text }]}>
              No collections yet. Create one by saving a song!
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  collectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  songCount: {
    fontSize: 14,
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Collections;