import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs, doc, getDoc } from '@firebase/firestore';
import { db } from '../firebase/config';
import NetInfo from '@react-native-community/netinfo';

const DATA_KEY_PREFIX = 'cachedData_';
let collectionGroups = [];
let all = [];

const fetchCollectionGroups = async () => {
  try {
    const docRef = doc(db, 'collectionGroups', 'groups');
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      collectionGroups = data.groupNames || [];
      all = data.allNames || [];

      await AsyncStorage.setItem(
        'collectionGroups',
        JSON.stringify(collectionGroups),
      );
      await AsyncStorage.setItem('allGroups', JSON.stringify(all));

      return {collectionGroups, all};
    } else {
      console.error('Document not found in Firestore');
      return {collectionGroups: [], all: []};
    }
  } catch (error) {
    console.error('Error fetching collection groups:', error);
    throw error;
  }
};

const loadGroupsFromStorage = async () => {
  try {
    const storedGroups = await AsyncStorage.getItem('collectionGroups');
    const storedAll = await AsyncStorage.getItem('allGroups');
    if (storedGroups && storedAll) {
      collectionGroups = JSON.parse(storedGroups);
      all = JSON.parse(storedAll);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error loading groups from storage:', error);
    return false;
  }
};

const initializeGroups = async () => {
  try {
    const loadedFromStorage = await loadGroupsFromStorage();
    if (!loadedFromStorage) {
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        await fetchCollectionGroups();
      } else {
        // Set to empty arrays if not available in storage and offline
        collectionGroups = [];
        all = [];
      }
    }
  } catch (error) {
    console.error('Error initializing groups:', error);
    // Ensure we have safe defaults even on error
    collectionGroups = [];
    all = [];
  }
};

const fetchAndStoreData = async collectionName => {
  try {
    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);
    const data = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      collectionName,
    }));

    if (collectionName !== 'saved') {
      await AsyncStorage.setItem(
        `${DATA_KEY_PREFIX}${collectionName}`,
        JSON.stringify(data),
      );
    }

    return data;
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    throw error;
  }
};

const getFromAsyncStorage = async collectionName => {
  try {
    if (collectionGroups.length === 0) {
      await initializeGroups();
    }

    if (collectionName === 'all') {
      const results = await Promise.all(
        all.map(name => getFromAsyncStorage(name).catch(() => [])),
      );
      return results.flat().filter(Boolean);
    }

    if (collectionGroups.includes(collectionName)) {
      const data = await AsyncStorage.getItem(
        `${DATA_KEY_PREFIX}${collectionName}`,
      );
      return data ? JSON.parse(data) : [];
    }

    const allData = await Promise.all(
      all.map(name => getFromAsyncStorage(name).catch(() => [])),
    );
    
    return allData.flat().filter(item => {
      if (!item) return false;
      const tags = Array.isArray(item.tags) ? item.tags : [];
      const artist = item.artist || '';
      return (
        tags.some(tag => tag?.toLowerCase() === collectionName.toLowerCase()) ||
        artist.toLowerCase().includes(collectionName.toLowerCase())
      );
    });
  } catch (error) {
    console.error(`Error retrieving ${collectionName}:`, error);
    // Return empty array instead of null when there's an error
    return [];
  }
};

const refreshAllData = async () => {
  try {
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected) {
      await initializeGroups();
      await Promise.all(collectionGroups.map(name => 
        fetchAndStoreData(name).catch(err => {
          console.error(`Error refreshing ${name}:`, err);
          return [];
        })
      ));
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error refreshing all data:', error);
    return false;
  }
};

export {
  fetchAndStoreData,
  getFromAsyncStorage,
  refreshAllData,
  initializeGroups,
};
