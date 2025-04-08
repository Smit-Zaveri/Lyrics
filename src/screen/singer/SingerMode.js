import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Animated,
  Dimensions,
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
  const [scaleAnim] = useState(new Animated.Value(1));
  const windowWidth = Dimensions.get('window').width;

  useEffect(() => {
    navigation.setOptions({
      // headerShown: false,
      title: getString('singerMode'),
      headerStyle: {
        backgroundColor: themeColors.primary,
      },
      headerTintColor: themeColors.background,
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    });
  }, [navigation, themeColors, getString]);

  const animatePress = pressed => {
    Animated.spring(scaleAnim, {
      toValue: pressed ? 0.95 : 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const handleAddSong = () => {
    navigation.navigate('AddSong');
  };

  const handleViewSongs = async () => {
    try {
      const result = await verifyAddedSongsCollection();

      if (result.updated) {
        console.log('Added-songs collection was updated or created');
      }

      navigation.navigate('List', {
        collectionName: 'added-songs',
        Tags: 'tags',
        title: 'Added Songs',
      });
    } catch (error) {
      console.error('Error preparing added-songs view:', error);
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
      showsVerticalScrollIndicator={false}>
      <View
        style={[
          styles.headerWrapper,
          {backgroundColor: themeColors.primary + '15'},
        ]}>
        <View style={styles.headerContainer}>
          <View
            style={[
              styles.iconCircle,
              {backgroundColor: themeColors.primary + '20'},
            ]}>
            <Icon name="music-note" size={60} color={themeColors.primary} />
          </View>
          <Text style={[styles.headerText, {color: themeColors.text}]}>
            {getString('singerMode') || 'Singer Mode'}
          </Text>
          <Text
            style={[styles.subHeaderText, {color: themeColors.textSecondary}]}>
            {getString('singerModeDesc') || 'Add and manage your own songs'}
          </Text>
        </View>
      </View>

      <View style={styles.cardsContainer}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={() => animatePress(true)}
          onPressOut={() => animatePress(false)}
          onPress={handleAddSong}>
          <Animated.View
            style={[
              styles.card,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
                shadowColor: themeColors.primary,
                transform: [{scale: scaleAnim}],
              },
            ]}>
            <View
              style={[
                styles.cardHighlight,
                {backgroundColor: themeColors.primary},
              ]}
            />
            <View style={styles.cardContent}>
              <View
                style={[
                  styles.cardIconContainer,
                  {backgroundColor: themeColors.primary + '20'},
                ]}>
                <Icon name="add-circle" size={40} color={themeColors.primary} />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={[styles.cardTitle, {color: themeColors.text}]}>
                  {getString('addNewSong') || 'Add New Song'}
                </Text>
                <Text
                  style={[
                    styles.cardDescription,
                    {color: themeColors.textSecondary},
                  ]}>
                  {getString('addNewSongDesc') ||
                    'Create a new song with lyrics, tags, and media'}
                </Text>
              </View>
              <Icon
                name="chevron-right"
                size={24}
                color={themeColors.primary}
              />
            </View>
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          onPressIn={() => animatePress(true)}
          onPressOut={() => animatePress(false)}
          onPress={handleViewSongs}>
          <Animated.View
            style={[
              styles.card,
              {
                backgroundColor: themeColors.surface,
                borderColor: themeColors.border,
                shadowColor: themeColors.primary,
                transform: [{scale: scaleAnim}],
              },
            ]}>
            <View
              style={[
                styles.cardHighlight,
                {backgroundColor: themeColors.primary},
              ]}
            />
            <View style={styles.cardContent}>
              <View
                style={[
                  styles.cardIconContainer,
                  {backgroundColor: themeColors.primary + '20'},
                ]}>
                <Icon
                  name="library-music"
                  size={40}
                  color={themeColors.primary}
                />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={[styles.cardTitle, {color: themeColors.text}]}>
                  {getString('myAddedSongs') || 'My Added Songs'}
                </Text>
                <Text
                  style={[
                    styles.cardDescription,
                    {color: themeColors.textSecondary},
                  ]}>
                  {getString('myAddedSongsDesc') ||
                    'View and edit your custom songs collection'}
                </Text>
              </View>
              <Icon
                name="chevron-right"
                size={24}
                color={themeColors.primary}
              />
            </View>
          </Animated.View>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <View
          style={[
            styles.infoBox,
            {
              backgroundColor: themeColors.primary + '08',
              borderColor: themeColors.border,
            },
          ]}>
          <View
            style={[
              styles.infoIconContainer,
              {backgroundColor: themeColors.primary + '15'},
            ]}>
            <Icon name="info" size={24} color={themeColors.primary} />
          </View>
          <Text style={[styles.infoText, {color: themeColors.textSecondary}]}>
            {getString('singerModeInfoText') ||
              'Songs you add will appear in both the "lyrics" collection and a special "Added Songs" collection.'}
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
    paddingBottom: 24,
  },
  headerWrapper: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContainer: {
    alignItems: 'center',
    marginVertical: 16,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  subHeaderText: {
    fontSize: 18,
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.8,
  },
  cardsContainer: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  card: {
    borderRadius: 16,
    marginBottom: 20,
    // borderWidth: 0.5,
    overflow: 'hidden',
    position: 'relative',
  },
  cardHighlight: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 6,
    height: '100%',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
  },
  cardIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  cardDescription: {
    fontSize: 14,
    opacity: 0.8,
  },
  infoContainer: {
    marginVertical: 8,
    paddingHorizontal: 16,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 0.5,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default SingerMode;
