import AsyncStorage from '@react-native-async-storage/async-storage';
import {collection, getDocs, doc, getDoc} from '@firebase/firestore';
import {db} from '../firebase/config';
import NetInfo from '@react-native-community/netinfo';
import {LANGUAGES} from '../context/LanguageContext';

const DATA_KEY_PREFIX = 'cachedData_';
const LAST_OPEN_DATE_KEY = 'last_open_date';
let collectionGroups = [];
let all = [];

// Get today's date as a string in format YYYY-MM-DD
const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // Returns YYYY-MM-DD
};

// Check if the date has changed since last app open
const checkAndRefreshIfDateChanged = async () => {
  try {
    // Get the stored last open date
    const lastOpenDate = await AsyncStorage.getItem(LAST_OPEN_DATE_KEY);
    const todayDate = getTodayDateString();

    // If the date has changed or no date stored, refresh the data
    if (!lastOpenDate || lastOpenDate !== todayDate) {
      console.log('Date changed since last open, refreshing data...');

      // Store today's date
      await AsyncStorage.setItem(LAST_OPEN_DATE_KEY, todayDate);

      // Refresh all data
      return await refreshAllData();
    }

    console.log('Date unchanged since last open, skipping refresh');
    return false;
  } catch (error) {
    console.error('Error checking date change:', error);
    return false;
  }
};

// Update the last open date to today without refreshing
const updateLastOpenDate = async () => {
  try {
    const todayDate = getTodayDateString();
    await AsyncStorage.setItem(LAST_OPEN_DATE_KEY, todayDate);
    return true;
  } catch (error) {
    console.error('Error updating last open date:', error);
    return false;
  }
};

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
    // Skip refreshing the added-songs collection from remote
    if (collectionName === 'added-songs') {
      return await getFromAsyncStorage('added-songs');
    }

    const collectionRef = collection(db, collectionName);
    const querySnapshot = await getDocs(collectionRef);
    const data = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      collectionName,
    }));

    if (collectionName !== 'saved') {
      // For lyrics collection, merge with existing user-added songs
      if (collectionName === 'lyrics') {
        // Get existing data that might contain user-added songs
        const existingData = await getFromAsyncStorage('lyrics');
        const userAddedSongs = existingData.filter(
          song => song.addedByUser === true,
        );

        // Merge remote data with user-added songs
        const mergedData = [...data, ...userAddedSongs];
        await AsyncStorage.setItem(
          `${DATA_KEY_PREFIX}${collectionName}`,
          JSON.stringify(mergedData),
        );
        return mergedData;
      } else {
        // For other collections, just save the data as is
        await AsyncStorage.setItem(
          `${DATA_KEY_PREFIX}${collectionName}`,
          JSON.stringify(data),
        );
      }
    }

    return data;
  } catch (error) {
    console.error(`Error fetching ${collectionName}:`, error);
    throw error;
  }
};

const getFromAsyncStorage = async (
  collectionName,
  languageIndex = LANGUAGES.ENGLISH,
) => {
  try {
    if (collectionGroups.length === 0) {
      await initializeGroups();
    }

    if (collectionName === 'all') {
      const results = await Promise.all(
        all.map(name =>
          getFromAsyncStorage(name, languageIndex).catch(() => []),
        ),
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
        artistMatches = item.artist
          .toLowerCase()
          .includes(collectionName.toLowerCase());
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
const getLocalizedData = async (
  collectionName,
  languageIndex = LANGUAGES.ENGLISH,
) => {
  const data = await getFromAsyncStorage(collectionName);
  return data.map(item => getContentInLanguage(item, languageIndex));
};

const refreshAllData = async () => {
  try {
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected) {
      await initializeGroups();

      // First, preserve user-added songs
      const addedSongsData = await getFromAsyncStorage('added-songs');

      // Refresh all collections except added-songs
      await Promise.all(
        collectionGroups
          .filter(name => name !== 'added-songs')
          .map(name =>
            fetchAndStoreData(name).catch(err => {
              console.error(`Error refreshing ${name}:`, err);
              return [];
            }),
          ),
      );

      // Ensure added-songs collection is properly set up
      await verifyAddedSongsCollection();

      return true;
    }
    return false;
  } catch (error) {
    console.error('Error refreshing all data:', error);
    return false;
  }
};

// Dedicated function to save user-added songs to both collections
const saveUserSong = async songData => {
  try {
    if (!songData || !songData.title || !songData.content) {
      throw new Error('Invalid song data provided');
    }

    // Create a unique ID if not provided
    const songId = songData.id || `user_song_${Date.now()}`;
    const timestamp = new Date().toISOString();

    // Prepare base song object with proper metadata
    const newSong = {
      ...songData,
      id: songId,
      addedByUser: true,
      addedDate: timestamp,
      numbering: 0, // Will be updated for each collection
    };

    // 1. Add to lyrics collection
    const lyricsData = await AsyncStorage.getItem(`${DATA_KEY_PREFIX}lyrics`);
    const lyrics = lyricsData ? JSON.parse(lyricsData) : [];
    const lyricsWithSong = [
      ...lyrics,
      {
        ...newSong,
        collectionName: 'lyrics',
        numbering: lyrics.length + 1,
      },
    ];
    await AsyncStorage.setItem(
      `${DATA_KEY_PREFIX}lyrics`,
      JSON.stringify(lyricsWithSong),
    );

    // 2. Add to added-songs collection
    const addedSongsData = await AsyncStorage.getItem(
      `${DATA_KEY_PREFIX}added-songs`,
    );
    const addedSongs = addedSongsData ? JSON.parse(addedSongsData) : [];
    const addedSongsWithSong = [
      ...addedSongs,
      {
        ...newSong,
        collectionName: 'added-songs',
        numbering: addedSongs.length + 1,
      },
    ];
    await AsyncStorage.setItem(
      `${DATA_KEY_PREFIX}added-songs`,
      JSON.stringify(addedSongsWithSong),
    );

    // 3. Ensure added-songs is in collections list
    const collectionsData = await AsyncStorage.getItem(
      `${DATA_KEY_PREFIX}collections`,
    );
    let collections = collectionsData ? JSON.parse(collectionsData) : [];
    const addedSongsCollection = collections.find(
      col => col.name === 'added-songs',
    );

    if (!addedSongsCollection) {
      collections.push({
        id: 'added-songs',
        name: 'added-songs',
        displayName: 'Added Songs',
        numbering: collections.length + 1,
      });
      await AsyncStorage.setItem(
        `${DATA_KEY_PREFIX}collections`,
        JSON.stringify(collections),
      );
    }

    // 4. Update collectionGroups if needed
    if (collectionGroups.length === 0) {
      await loadGroupsFromStorage();
    }

    if (!collectionGroups.includes('added-songs')) {
      collectionGroups.push('added-songs');
      await AsyncStorage.setItem(
        'collectionGroups',
        JSON.stringify(collectionGroups),
      );
    }

    // 5. Update allGroups if needed
    if (!all.includes('added-songs')) {
      all.push('added-songs');
      await AsyncStorage.setItem('allGroups', JSON.stringify(all));
    }

    return {success: true, songId};
  } catch (error) {
    console.error('Error saving user song:', error);
    return {success: false, error: error.message};
  }
};

// Function to update an existing user song in both collections
const updateUserSong = async songData => {
  try {
    if (!songData || !songData.id) {
      throw new Error('Invalid song data or missing ID');
    }

    // Update timestamp for the edit
    const updateTimestamp = new Date().toISOString();
    const updatedSong = {
      ...songData,
      updatedDate: updateTimestamp,
      addedByUser: true, // Ensure this flag is set
    };

    // 1. Update in lyrics collection
    const lyricsData = await AsyncStorage.getItem(`${DATA_KEY_PREFIX}lyrics`);
    if (lyricsData) {
      const lyrics = JSON.parse(lyricsData);
      const lyricsWithUpdatedSong = lyrics.map(song =>
        song.id === updatedSong.id
          ? {...updatedSong, collectionName: 'lyrics'}
          : song,
      );
      await AsyncStorage.setItem(
        `${DATA_KEY_PREFIX}lyrics`,
        JSON.stringify(lyricsWithUpdatedSong),
      );
    }

    // 2. Update in added-songs collection
    const addedSongsData = await AsyncStorage.getItem(
      `${DATA_KEY_PREFIX}added-songs`,
    );
    if (addedSongsData) {
      const addedSongs = JSON.parse(addedSongsData);
      const updatedAddedSongs = addedSongs.map(song =>
        song.id === updatedSong.id
          ? {...updatedSong, collectionName: 'added-songs'}
          : song,
      );
      await AsyncStorage.setItem(
        `${DATA_KEY_PREFIX}added-songs`,
        JSON.stringify(updatedAddedSongs),
      );
    }

    return {success: true, songId: updatedSong.id};
  } catch (error) {
    console.error('Error updating user song:', error);
    return {success: false, error: error.message};
  }
};

// Function to verify if added-songs collection is properly set up
const verifyAddedSongsCollection = async () => {
  try {
    // 1. Check for collection in collectionGroups
    if (collectionGroups.length === 0) {
      await loadGroupsFromStorage();
    }

    let updated = false;
    if (!collectionGroups.includes('added-songs')) {
      collectionGroups.push('added-songs');
      await AsyncStorage.setItem(
        'collectionGroups',
        JSON.stringify(collectionGroups),
      );
      updated = true;
    }

    // 2. Check for collection in allGroups
    if (!all.includes('added-songs')) {
      all.push('added-songs');
      await AsyncStorage.setItem('allGroups', JSON.stringify(all));
      updated = true;
    }

    // 3. Ensure added-songs exists in collections list
    const collectionsData = await AsyncStorage.getItem(
      `${DATA_KEY_PREFIX}collections`,
    );
    let collections = collectionsData ? JSON.parse(collectionsData) : [];
    const addedSongsCollection = collections.find(
      col => col.name === 'added-songs',
    );

    if (!addedSongsCollection) {
      collections.push({
        id: 'added-songs',
        name: 'added-songs',
        displayName: 'Added Songs',
        numbering: collections.length + 1,
      });
      await AsyncStorage.setItem(
        `${DATA_KEY_PREFIX}collections`,
        JSON.stringify(collections),
      );
      updated = true;
    }

    // 4. Make sure added-songs collection exists in AsyncStorage
    const addedSongsData = await AsyncStorage.getItem(
      `${DATA_KEY_PREFIX}added-songs`,
    );
    if (!addedSongsData) {
      await AsyncStorage.setItem(
        `${DATA_KEY_PREFIX}added-songs`,
        JSON.stringify([]),
      );
      updated = true;
    }

    return {success: true, updated};
  } catch (error) {
    console.error('Error verifying added-songs collection:', error);
    return {success: false, error: error.message};
  }
};

export {
  fetchAndStoreData,
  getFromAsyncStorage,
  getContentInLanguage,
  getLocalizedData,
  refreshAllData,
  initializeGroups,
  checkAndRefreshIfDateChanged,
  updateLastOpenDate,
  saveUserSong,
  updateUserSong,
  verifyAddedSongsCollection,
};
