import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  Animated,
  Dimensions,
  Platform,
  Pressable,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ThemeContext } from '../../../App';

const { width } = Dimensions.get('window');

const Collections = ({ navigation }) => {
  const { themeColors } = useContext(ThemeContext);
  const [collections, setCollections] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ visible: false, collectionId: null, collectionName: '' });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // Create an array of animated values for each item
  const [itemAnimations, setItemAnimations] = useState([]);

  // Initialize animations when collection data changes
  useEffect(() => {
    if (collections.length > 0) {
      const newAnimations = collections.map(() => ({
        fade: new Animated.Value(0),
        scale: new Animated.Value(0.9),
      }));
      setItemAnimations(newAnimations);

      // Animate each item with a staggered delay
      collections.forEach((_, index) => {
        const delay = index * 50;
        Animated.parallel([
          Animated.timing(newAnimations[index].fade, {
            toValue: 1,
            duration: 400,
            delay,
            useNativeDriver: true,
          }),
          Animated.spring(newAnimations[index].scale, {
            toValue: 1,
            friction: 8,
            tension: 40,
            delay,
            useNativeDriver: true,
          }),
        ]).start();
      });
    }
  }, [collections]);

  useEffect(() => {
    loadCollections();
    // Animate the components when they mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
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

  const showDeleteModal = (collectionId, collectionName) => {
    setDeleteModal({ visible: true, collectionId, collectionName });
  };

  const hideDeleteModal = () => {
    setDeleteModal({ visible: false, collectionId: null, collectionName: '' });
  };

  const confirmDeleteCollection = async () => {
    try {
      const { collectionId } = deleteModal;
      const updatedCollections = collections.filter(c => c.id !== collectionId);
      await AsyncStorage.setItem('user_collections', JSON.stringify(updatedCollections));
      setCollections(updatedCollections);
      hideDeleteModal();
    } catch (error) {
      console.error('Error deleting collection:', error);
    }
  };

  const DeleteConfirmationModal = () => (
    <Modal
      transparent
      visible={deleteModal.visible}
      animationType="fade"
      onRequestClose={hideDeleteModal}
    >
      <Pressable
        style={styles.modalOverlay}
        onPress={hideDeleteModal}
      >
        <Pressable style={[styles.modalContainer, { backgroundColor: themeColors.surface }]}>
          <View style={styles.warningIconContainer}>
            <Icon name="warning" size={40} color="#FFC107" />
          </View>
          <Text style={[styles.modalTitle, { color: themeColors.text }]}>Delete Collection</Text>
          <Text style={[styles.modalMessage, { color: themeColors.placeholder }]}>
            Are you sure you want to delete "{deleteModal.collectionName}"? This action cannot be undone.
          </Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.cancelButton, { borderColor: themeColors.border }]}
              onPress={hideDeleteModal}
            >
              <Text style={[styles.buttonText, { color: themeColors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, styles.deleteButton, { backgroundColor: '#FF5252' }]}
              onPress={confirmDeleteCollection}
              testID="confirm-delete"
            >
              <Text style={[styles.buttonText, { color: '#FFFFFF' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );

  const renderItem = ({ item, index }) => {
    // Use the pre-created animation values instead of creating new ones in the render function
    const itemAnimation = itemAnimations[index] || { fade: new Animated.Value(1), scale: new Animated.Value(1) };
    
    return (
      <Animated.View
        style={[
          { opacity: itemAnimation.fade, transform: [{ scale: itemAnimation.scale }] }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.collectionItem,
            { backgroundColor: themeColors.surface, borderColor: themeColors.border }
          ]}
          onPress={() => handleCollectionPress(item)}
        >
          <View style={styles.collectionIcon}>
            <MaterialCommunityIcons 
              name="playlist-music" 
              size={28} 
              color={themeColors.primary} 
            />
          </View>
          <View style={styles.collectionInfo}>
            <Text style={[styles.collectionName, { color: themeColors.text }]}>{item.name}</Text>
            <Text style={[styles.songCount, { color: themeColors.placeholder }]}>
              {item.songs?.length || 0} {item.songs?.length === 1 ? 'song' : 'songs'}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => showDeleteModal(item.id, item.name)}
            style={styles.deleteButton}
            testID={`delete-button-${item.id}`}
          >
            <MaterialCommunityIcons name="delete-outline" size={24} color="#FF5252" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const EmptyComponent = () => (
    <Animated.View 
      style={[
        styles.emptyContainer,
        { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
      ]}
    >
      <MaterialCommunityIcons 
        name="playlist-music-outline" 
        size={80} 
        color={themeColors.placeholder} 
        style={styles.emptyIcon}
      />
      <Text style={[styles.emptyText, { color: themeColors.text }]}>
        No collections yet
      </Text>
      <Text style={[styles.emptySubText, { color: themeColors.placeholder }]}>
        Create one by saving songs to a collection!
      </Text>
    </Animated.View>
  );

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <FlatList
        data={collections}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={collections.length === 0 ? styles.listContentEmpty : styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[themeColors.primary]}
            tintColor={themeColors.primary}
          />
        }
        ListEmptyComponent={EmptyComponent}
        showsVerticalScrollIndicator={false}
      />
      <DeleteConfirmationModal />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  collectionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(103, 59, 183, 0.1)', // Light purple background for the icon
    marginRight: 16,
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 16,
    fontWeight: '600',
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
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: '80%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    maxWidth: 320,
    borderRadius: 16,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  warningIconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    marginRight: 8,
    borderWidth: 1,
  },
  deleteButton: {
    marginLeft: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Collections;