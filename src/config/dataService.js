import AsyncStorage from '@react-native-async-storage/async-storage';
import { collection, getDocs, doc, getDoc } from '@firebase/firestore';
import { db } from '../firebase/config';
import NetInfo from '@react-native-community/netinfo';
import { LANGUAGES } from '../context/LanguageContext';

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

const getFromAsyncStorage = async (collectionName, languageIndex = LANGUAGES.ENGLISH) => {
  try {
    if (collectionGroups.length === 0) {
      await initializeGroups();
    }

    if (collectionName === 'all') {
      const results = await Promise.all(
        all.map(name => getFromAsyncStorage(name, languageIndex).catch(() => [])),
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
      all.map(name => getFromAsyncStorage(name, languageIndex).catch(() => [])),
    );
    
    return allData.flat().filter(item => {
      if (!item) return false;
      
      // Handle tags for filtering
      const tags = Array.isArray(item.tags) ? item.tags : [];
      
      // Handle artist which could be a string or potentially an array in the future
      let artistMatches = false;
      if (typeof item.artist === 'string') {
        artistMatches = item.artist.toLowerCase().includes(collectionName.toLowerCase());
      }
      
      return (
        tags.some(tag => tag?.toLowerCase() === collectionName.toLowerCase()) ||
        artistMatches
      );
    });
  } catch (error) {
    console.error(`Error retrieving ${collectionName}:`, error);
    // Return empty array instead of null when there's an error
    return [];
  }
};

// Get content in the user's preferred language
const getContentInLanguage = (item, languageIndex = LANGUAGES.ENGLISH) => {
  if (!item) return null;
  
  // Create a copy of the item to avoid mutating the original
  const processedItem = {...item};
  
  // Process title - convert from array to string based on language
  if (Array.isArray(processedItem.title)) {
    if (languageIndex >= 0 && languageIndex < processedItem.title.length) {
      processedItem.titleDisplay = processedItem.title[languageIndex];
    } else {
      // Fallback to first non-empty title
      processedItem.titleDisplay = processedItem.title.find(t => t) || '';
    }
  } else if (typeof processedItem.title === 'string') {
    // Handle legacy data format
    processedItem.titleDisplay = processedItem.title;
  } else {
    processedItem.titleDisplay = '';
  }
  
  // Process content - convert from array to string based on language
  if (Array.isArray(processedItem.content)) {
    if (languageIndex >= 0 && languageIndex < processedItem.content.length) {
      processedItem.contentDisplay = processedItem.content[languageIndex];
    } else {
      // Fallback to first non-empty content
      processedItem.contentDisplay = processedItem.content.find(c => c) || '';
    }
  } else if (typeof processedItem.content === 'string') {
    // Handle legacy data format
    processedItem.contentDisplay = processedItem.content;
  } else {
    processedItem.contentDisplay = '';
  }
  
  return processedItem;
};

// Get data with content in the specified language
const getLocalizedData = async (collectionName, languageIndex = LANGUAGES.ENGLISH) => {
  const data = await getFromAsyncStorage(collectionName);
  return data.map(item => getContentInLanguage(item, languageIndex));
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
  getContentInLanguage,
  getLocalizedData,
  refreshAllData,
  initializeGroups,
};
