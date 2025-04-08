import React, {useContext, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {ThemeContext} from '../../../App';
import {LanguageContext} from '../../context/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {verifyAddedSongsCollection} from '../../config/DataService';

const SingerMode = () => {
  const navigation = useNavigation();
  const {themeColors} = useContext(ThemeContext);
  const {getString} = useContext(LanguageContext);

  useEffect(() => {
    navigation.setOptions({
      title: 'Singer Mode',
    });
  }, [navigation]);

  const handleAddSong = () => {
    navigation.navigate('AddSong');
  };

  const handleViewSongs = async () => {
    try {
      // Verify that the added-songs collection is properly set up
      const result = await verifyAddedSongsCollection();
      
      if (result.updated) {
        console.log('Added-songs collection was updated or created');
      }
      
      // Navigate to the List component with added-songs as the collection
      navigation.navigate('List', {
        collectionName: 'added-songs',
        Tags: 'tags',
        title: 'Added Songs',
      });
    } catch (error) {
      console.error('Error preparing added-songs view:', error);
      // If anything fails, still try to navigate
      navigation.navigate('List', {
        collectionName: 'added-songs',
        Tags: 'tags',
        title: 'Added Songs',
      });
    }
  };

  return (
    <ScrollView 
      style={[styles.container, {backgroundColor: themeColors.background}]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.headerContainer}>
        <Icon name="music-note" size={60} color={themeColors.primary} />
        <Text style={[styles.headerText, {color: themeColors.text}]}>
          Singer Mode
        </Text>
        <Text style={[styles.subHeaderText, {color: themeColors.textSecondary}]}>
          Add and manage your own songs
        </Text>
      </View>
      
      <View style={styles.cardsContainer}>
        <TouchableOpacity
          style={[styles.card, {backgroundColor: themeColors.surface, borderColor: themeColors.border}]}
          onPress={handleAddSong}>
          <View style={styles.cardIconContainer}>
            <Icon name="add-circle" size={36} color={themeColors.primary} />
          </View>
          <Text style={[styles.cardTitle, {color: themeColors.text}]}>
            Add New Song
          </Text>
          <Text style={[styles.cardDescription, {color: themeColors.textSecondary}]}>
            Create a new song with lyrics, tags, and media
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.card, {backgroundColor: themeColors.surface, borderColor: themeColors.border}]}
          onPress={handleViewSongs}>
          <View style={styles.cardIconContainer}>
            <Icon name="library-music" size={36} color={themeColors.primary} />
          </View>
          <Text style={[styles.cardTitle, {color: themeColors.text}]}>
            My Added Songs
          </Text>
          <Text style={[styles.cardDescription, {color: themeColors.textSecondary}]}>
            View and edit your custom songs collection
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <View style={[styles.infoBox, {backgroundColor: themeColors.surface + '20', borderColor: themeColors.border}]}>
          <Icon name="info" size={24} color={themeColors.primary} style={styles.infoIcon} />
          <Text style={[styles.infoText, {color: themeColors.textSecondary}]}>
            Songs you add will appear in both the "lyrics" collection and a special "Added Songs" collection.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  headerContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  headerText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 12,
  },
  subHeaderText: {
    fontSize: 16,
    marginTop: 8,
  },
  cardsContainer: {
    marginVertical: 16,
  },
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    elevation: 2,
  },
  cardIconContainer: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
  },
  infoContainer: {
    marginVertical: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
  },
});

export default SingerMode;