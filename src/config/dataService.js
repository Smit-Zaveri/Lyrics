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
  const storedGroups = await AsyncStorage.getItem('collectionGroups');
  const storedAll = await AsyncStorage.getItem('allGroups');
  if (storedGroups && storedAll) {
    collectionGroups = JSON.parse(storedGroups);
    all = JSON.parse(storedAll);
    return true;
  }
  return false;
};

const initializeGroups = async () => {
  const loadedFromStorage = await loadGroupsFromStorage();
  if (!loadedFromStorage) {
    await fetchCollectionGroups();
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
      const netInfo = await NetInfo.fetch();
      if (netInfo.isConnected) {
        await initializeGroups();
      } else {
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
    console.error(`Error retrieving ${collectionName}:`, error);
    throw error;
  }
};

const refreshAllData = async () => {
  const netInfo = await NetInfo.fetch();
  if (netInfo.isConnected) {
    await Promise.all(collectionGroups.map(fetchAndStoreData));
  }
};

export {
  fetchAndStoreData,
  getFromAsyncStorage,
  refreshAllData,
  initializeGroups,
};
