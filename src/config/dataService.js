import AsyncStorage from '@react-native-async-storage/async-storage';
import firebase from '@react-native-firebase/app';
import firestore from '@react-native-firebase/firestore';
import NetInfo from '@react-native-community/netinfo';

const DATA_KEY_PREFIX = 'cachedData_';
let collectionGroups = [];
let all = [];

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
  firebase.initializeApp(); // Initialize Firebase with default settings if necessary
}

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
    } else {
      console.error('Document not found in Firestore');
      return {collectionGroups: [], all: []};
    }
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

    await AsyncStorage.setItem(
      `${DATA_KEY_PREFIX}${collectionName}`,
      JSON.stringify(data),
    );

    return data;
  } catch (error) {
    console.error(
      `Error fetching data from Firestore for ${collectionName}:`,
      error,
    );
    throw error;
  }
};

// Get data from AsyncStorage
const getFromAsyncStorage = async collectionName => {
  try {
    // Handle the case when collectionName is 'all'
    if (collectionName === 'all') {
      const allData = await Promise.all(
        all.map(group => getFromAsyncStorage(group)),
      );
      return allData.flat();
    }

    // If collection is in collectionGroups, retrieve from AsyncStorage
    if (collectionGroups.includes(collectionName)) {
      const data = await AsyncStorage.getItem(
        `${DATA_KEY_PREFIX}${collectionName}`,
      );
      return data ? JSON.parse(data) : null;
    } else {
      // Otherwise, filter by tags or artist in all groups
      const allData = await Promise.all(
        all.map(group => getFromAsyncStorage(group)),
      );

      const filteredData = allData.flat().filter(item => {
        const tags = item.tags || []; // Ensure tags is an array or empty array
        const artist = item.artist || ""; // Ensure artist is a string or empty string
      
        // Case-insensitive matching
        const tagMatches = tags.some(tag => tag.toLowerCase() === collectionName.toLowerCase());
        const artistMatches = artist.toLowerCase().includes(collectionName.toLowerCase());
      
        return tagMatches || artistMatches;
      });
      

      return filteredData;
    }
  } catch (error) {
    console.error(
      `Error retrieving data from AsyncStorage for ${collectionName}:`,
      error,
    );
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

  await Promise.all(
    collectionGroups.map(async collectionName => {
      try {
        await fetchAndStoreData(collectionName);
      } catch (error) {
        console.error(`Error refreshing data for ${collectionName}:`, error);
      }
    }),
  );
};

// Initialize collectionGroups and all before using them
const initializeGroups = async () => {
  const {collectionGroups, all} = await fetchCollectionGroups();
  await refreshAllData(); // Ensure data is refreshed before continuing
};

export {
  fetchAndStoreData,
  getFromAsyncStorage,
  refreshAllData,
  initializeGroups,
};
