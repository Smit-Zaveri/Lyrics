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
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ThemeContext } from '../../../App';
import EditCollectionModal from '../../components/EditCollectionModal';
import CreateCollectionModal from '../../components/CreateCollectionModal';

const { width } = Dimensions.get('window');

// Generate a unique ID using timestamp and random numbers
const generateUniqueId = () => {
  return 'id_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
};

const Collections = ({ navigation }) => {
  const { themeColors } = useContext(ThemeContext);
  const [collections, setCollections] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ visible: false, collectionId: null, collectionName: '' });
  
  // Enhanced animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const iconRotateAnim = useRef(new Animated.Value(0)).current;

  // New state for edit collection modal
  const [editModal, setEditModal] = useState({ 
    visible: false, 
    collectionId: null, 
    collectionName: '' 
  });
  const [newName, setNewName] = useState('');
  const editSlideAnim = useRef(new Animated.Value(0)).current;
  
  // State variables for the create collection modal
  const [createModal, setCreateModal] = useState({
    visible: false
  });
  const [createName, setCreateName] = useState('');
  const createSlideAnim = useRef(new Animated.Value(0)).current;
  
  // Create an array of animated values for each item
  const [itemAnimations, setItemAnimations] = useState([]);

  // New state for duplicate name error modal
  const [errorModal, setErrorModal] = useState({ 
    visible: false, 
    message: '',
    title: ''
  });

  // State variables for handling input errors inline
  const [editErrorMessage, setEditErrorMessage] = useState('');
  const [createErrorMessage, setCreateErrorMessage] = useState('');

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
    // Initialize animations with visible values
    fadeAnim.setValue(1);
    scaleAnim.setValue(1);
    slideAnim.setValue(0);
    iconRotateAnim.setValue(1);
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

  const showEditModal = (collectionId, collectionName) => {
    setEditModal({ visible: true, collectionId, collectionName });
    setNewName(collectionName);
    Animated.timing(editSlideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideEditModal = () => {
    Animated.timing(editSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setEditModal({ visible: false, collectionId: null, collectionName: '' });
      setNewName('');
      setEditErrorMessage('');
    });
  };

  const confirmEditCollection = async () => {
    try {
      const { collectionId } = editModal;
      
      if (!newName.trim()) {
        setEditErrorMessage("Please enter a collection name");
        return;
      }

      // Check if another collection with the same name already exists
      const collectionExists = collections.some(
        collection => collection.id !== collectionId && 
                     collection.name.toLowerCase() === newName.trim().toLowerCase()
      );

      if (collectionExists) {
        setEditErrorMessage("A collection with this name already exists");
        return;
      }

      const updatedCollections = collections.map(c => 
        c.id === collectionId ? { ...c, name: newName.trim() } : c
      );
      await AsyncStorage.setItem('user_collections', JSON.stringify(updatedCollections));
      setCollections(updatedCollections);
      hideEditModal();
    } catch (error) {
      console.error('Error editing collection:', error);
    }
  };

  const showCreateModal = () => {
    setCreateModal({ visible: true });
    setCreateName('');
    Animated.timing(createSlideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideCreateModal = () => {
    Animated.timing(createSlideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCreateModal({ visible: false });
      setCreateName('');
    });
  };

  const confirmCreateCollection = async () => {
    try {
      if (!createName.trim()) {
        setCreateErrorMessage("Please enter a collection name");
        return;
      }

      // Check if a collection with the same name already exists
      const collectionExists = collections.some(
        collection => collection.name.toLowerCase() === createName.trim().toLowerCase()
      );

      if (collectionExists) {
        setCreateErrorMessage("A collection with this name already exists");
        return;
      }

      const newCollection = {
        id: generateUniqueId(),
        name: createName.trim(),
        songs: [],
        createdAt: new Date().toISOString()
      };
      
      const updatedCollections = [...collections, newCollection];
      await AsyncStorage.setItem('user_collections', JSON.stringify(updatedCollections));
      setCollections(updatedCollections);
      hideCreateModal();
    } catch (error) {
      console.error('Error creating collection:', error);
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
    const itemAnimation = itemAnimations[index] || { fade: new Animated.Value(1), scale: new Animated.Value(1) };
    
    return (
      <Animated.View
        style={[
          { 
            opacity: itemAnimation.fade, 
            transform: [{ scale: itemAnimation.scale }],
          }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.collectionItem,
            { 
              backgroundColor: themeColors.surface, 
              borderColor: themeColors.primary + '15'
            }
          ]}
          onPress={() => handleCollectionPress(item)}
          activeOpacity={0.7}
        >
          <View style={[styles.collectionIconContainer, { 
            backgroundColor: `${themeColors.primary}15`,
            borderColor: `${themeColors.primary}25`
          }]}>
            <MaterialCommunityIcons 
              name="playlist-music" 
              size={28} 
              color={themeColors.primary} 
            />
          </View>
          <View style={styles.collectionInfo}>
            <Text style={[styles.collectionName, { color: themeColors.text }]}>
              {item.name}
            </Text>
            <Text style={[styles.songCount, { color: themeColors.placeholder }]}>
              {item.songs?.length || 0} {item.songs?.length === 1 ? 'song' : 'songs'}
            </Text>
          </View>
          <View style={styles.collectionActions}>
            <TouchableOpacity
              onPress={() => showEditModal(item.id, item.name)}
              style={[styles.actionButton, { 
                backgroundColor: themeColors.primary + '10',
                borderColor: themeColors.primary + '20'
              }]}
              testID={`edit-button-${item.id}`}
            >
              <MaterialCommunityIcons name="pencil" size={20} color={themeColors.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => showDeleteModal(item.id, item.name)}
              style={[styles.actionButton, { 
                backgroundColor: 'rgba(255, 82, 82, 0.1)',
                borderColor: 'rgba(255, 82, 82, 0.25)'
              }]}
              testID={`delete-button-${item.id}`}
            >
              <MaterialCommunityIcons name="delete" size={20} color="#FF5252" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const EmptyComponent = () => {
    const spin = iconRotateAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '360deg'],
    });

    return (
      <Animated.View 
        style={[
          styles.emptyContainer,
          { 
            backgroundColor: themeColors.background,
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim },
            ]
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.emptyIconContainer, 
            { 
              backgroundColor: `${themeColors.primary}15`,
              transform: [{ rotate: spin }]
            }
          ]}
        >
          <MaterialCommunityIcons 
            name="playlist-music-outline" 
            size={60} 
            color={themeColors.primary}
          />
        </Animated.View>
        <Animated.Text 
          style={[
            styles.emptyText, 
            { 
              color: themeColors.text,
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ]
            }
          ]}
        >
          No Collections Yet
        </Animated.Text>
        <Animated.Text 
          style={[
            styles.emptySubText, 
            { 
              color: themeColors.placeholder,
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateY: slideAnim }
              ]
            }
          ]}
        >
          Create a collection to organize your favorite songs
        </Animated.Text>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim }
            ]
          }}
        >
          <TouchableOpacity
            style={[styles.createEmptyButton, { backgroundColor: themeColors.primary }]}
            onPress={showCreateModal}
          >
            <MaterialCommunityIcons name="playlist-plus" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text style={styles.createEmptyButtonText}>Create Collection</Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: themeColors.background }}>
      <View style={{ flex: 1 }}>
        <FlatList
          data={collections}
          renderItem={renderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={[
            styles.listContent,
            { flexGrow: 1, backgroundColor: themeColors.background, paddingBottom: 100 },
            collections.length === 0 && styles.emptyListContainer
          ]}
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
        
        {/* Floating Action Button */}
          <TouchableOpacity
            style={[styles.fab, { 
              backgroundColor: themeColors.primary,
              borderWidth: 2,
              borderColor: 'rgba(255,255,255,0.2)'
            }]}
            onPress={showCreateModal}
            testID="create-collection-fab"
          >
          <MaterialCommunityIcons name="playlist-plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <DeleteConfirmationModal />
        <EditCollectionModal 
          visible={editModal.visible}
          themeColors={themeColors}
          collectionName={editModal.collectionName}
          editSlideAnim={editSlideAnim}
          onClose={hideEditModal}
          onChangeText={(text) => {
            setNewName(text);
            setEditErrorMessage(''); // Clear error when user types
          }}
          onConfirm={confirmEditCollection}
          value={newName}
          errorMessage={editErrorMessage}
        />
        <CreateCollectionModal
          visible={createModal.visible}
          themeColors={themeColors}
          createSlideAnim={createSlideAnim}
          onClose={hideCreateModal}
          onChangeText={(text) => {
            setCreateName(text);
            setCreateErrorMessage(''); // Clear error when user types
          }}
          onConfirm={confirmCreateCollection}
          value={createName}
          errorMessage={createErrorMessage}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 14,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 14,
  },
  emptyListContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  collectionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  collectionInfo: {
    flex: 1,
  },
  collectionName: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 3,
    letterSpacing: 0.3,
  },
  songCount: {
    fontSize: 13,
    opacity: 0.75,
  },
  collectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 7,
    marginLeft: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },
  emptyIconContainer: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  emptyIcon: {
    marginBottom: 14,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  emptySubText: {
    fontSize: 14,
    textAlign: 'center',
    maxWidth: '85%',
    marginBottom: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  createEmptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 18,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  createEmptyButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.82,
    maxWidth: 300,
    borderRadius: 14,
    paddingTop: 18,
    paddingHorizontal: 18,
    paddingBottom: 14,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  warningIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 193, 7, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 193, 7, 0.3)',
  },
  errorIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  modalMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
    opacity: 0.85,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cancelButton: {
    marginRight: 6,
    borderWidth: 1.5,
  },
  saveButton: {
    marginLeft: 6,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  textInput: {
    width: '100%',
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 11,
    marginBottom: 14,
    fontSize: 15,
  },
  singleButtonContainer: {
    width: '100%',
  },
  singleButton: {
    width: '100%',
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    bottom: 22,
    right: 22,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
});

export default Collections;