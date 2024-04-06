import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';

export const fetchAPIData = async () => {
  try {
    const querySnapshot = await firestore().collection('lyrics').get();
    const jsonData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    const jsonString = JSON.stringify(jsonData);
    await AsyncStorage.setItem('data', jsonString);

    // Fetch tags separately
    const tagsQuerySnapshot = await firestore().collection('tags').get();
    const tagsData = tagsQuerySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    const tagsJsonString = JSON.stringify(tagsData);
    await AsyncStorage.setItem('tags', tagsJsonString);

    return jsonData;
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchStoredData = async () => {
  try {
    const storedData = await AsyncStorage.getItem('data');
    return storedData !== null ? JSON.parse(storedData) : [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

export const fetchStoredTags = async () => {
  try {
    const storedTags = await AsyncStorage.getItem('tags');
    return storedTags !== null ? JSON.parse(storedTags) : [];
  } catch (error) {
    console.error(error);
    return [];
  }
};
