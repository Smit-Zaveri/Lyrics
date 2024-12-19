import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import NetInfo from '@react-native-community/netinfo';

const DATA_KEY_PREFIX = 'cachedData_';
let collectionGroups = [];
let all = [];

// Fetch collection groups and all groups from Firestore
const fetchCollectionGroups = async () => {
  try {
    const doc = await firestore()
      .collection('collectionGroups')
      .doc('groups')
      .get();
    if (doc.exists) {
      const data = doc.data();
      collectionGroups = data.groupNames || [];
      all = data.allNames || [];
      return {collectionGroups, all};
    }
    console.error('Document not found in Firestore');
    return {collectionGroups: [], all: []};
  } catch (error) {
    console.error('Error fetching collection groups from Firestore:', error);
    throw error;
  }
};

// Fetch data from Firestore and store it in AsyncStorage
const fetchAndStoreData = async collectionName => {
  try {
    const snapshot = await firestore().collection(collectionName).get();
    const data = snapshot.docs.map(doc => ({
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
    console.error(
      `Error fetching data from Firestore for ${collectionName}:`,
      error,
    );
    throw error;
  }
};

// Get data from AsyncStorage or fetch if not available
const getFromAsyncStorage = async collectionName => {
  try {
    if (collectionGroups.length === 0) {
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        // console.log('No data found. Fetching new data...');
        await initializeGroups();
      } else {
        console.log('No internet connection and no cached data available.');
        return null;
      }
    }

    if (collectionName === 'all') {
      return Promise.all(all.map(getFromAsyncStorage)).then(data =>
        data.flat(),
      );
    }

    if (collectionGroups.includes(collectionName)) {
      const data = await AsyncStorage.getItem(
        `${DATA_KEY_PREFIX}${collectionName}`,
      );
      return data ? JSON.parse(data) : null;
    }

    // Filter by tags or artist in all groups if collectionName not found
    const allData = await Promise.all(all.map(getFromAsyncStorage));
    return allData.flat().filter(item => {
      const tags = item.tags || [];
      const artist = item.artist || '';
      return (
        tags.some(tag => tag.toLowerCase() === collectionName.toLowerCase()) ||
        artist.toLowerCase().includes(collectionName.toLowerCase())
      );
    });
  } catch (error) {
    console.error(`Error retrieving data for ${collectionName}:`, error);
    throw error;
  }
};

// Refresh data for all collections
const refreshAllData = async () => {
  const netInfo = await NetInfo.fetch();
  if (!netInfo.isConnected) {
    console.log('No internet connection, skipping data refresh.');
    return;
  }
  await Promise.all(collectionGroups.map(fetchAndStoreData));
};

// Initialize collectionGroups and all before using them
const initializeGroups = async () => {
  const {collectionGroups: groups, all: allGroups} =
    await fetchCollectionGroups();
  collectionGroups = groups;
  all = allGroups;
  await refreshAllData();
};

export {
  fetchAndStoreData,
  getFromAsyncStorage,
  refreshAllData,
  initializeGroups,
};
