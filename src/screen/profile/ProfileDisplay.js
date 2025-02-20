import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { refreshAllData } from '../../config/DataService';
import { ThemeContext } from '../../../App';

const ProfileDisplay = ({navigation}) => {
  const [refreshMessage, setRefreshMessage] = useState('');
  const { themeColors } = useContext(ThemeContext);

  const handleRefresh = async () => {
    await refreshAllData();
    setRefreshMessage('Data has been refreshed successfully!');

    // Clear the message after a few seconds
    setTimeout(() => {
      setRefreshMessage('');
    }, 3000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `🌟 Discover Your Next Favorite Lyrics App! 🎶

Hey there! If you love music and want to access a world of lyrics at your fingertips, check out this amazing app! It's designed to enhance your lyrical experience, making it easy to find, save, and enjoy your favorite songs.

✨ Download it here: https://bit.ly/jain_dhun

Join the community of music lovers and elevate your listening experience today! 🎤💖`,
      });
    } catch (error) {
      // console.log('Error sharing the app:', error.message);
    }
  };

  return (
    <View style={[styles.container, {backgroundColor: themeColors.background}]}>
      {/* Add Settings Button */}
      <TouchableOpacity onPress={() => navigation.navigate('Settings')}>
        <View style={styles.item}>
          <Icon name="settings" color={themeColors.primary} size={25} />
          <Text style={[styles.text, {color: themeColors.text}]}>Settings</Text>
        </View>
      </TouchableOpacity>

      {/* Collections Button */}
      <TouchableOpacity onPress={() => navigation.navigate('Collections')}>
        <View style={styles.item}>
          <Icon name="collections-bookmark" color={themeColors.primary} size={25} />
          <Text style={[styles.text, {color: themeColors.text}]}>My Collections</Text>
        </View>
      </TouchableOpacity>

      

      {/* Suggestion Button */}
      <TouchableOpacity onPress={() => navigation.navigate('Suggestion')}>
        <View style={styles.item}>
          <Icon name="info" color={themeColors.primary} size={25} />
          <Text style={[styles.text, {color: themeColors.text}]}>
            Suggestion
          </Text>
        </View>
      </TouchableOpacity>

      {/* Refresh Data Button */}
      <TouchableOpacity onPress={handleRefresh}>
        <View style={styles.item}>
          <Icon name="refresh" color={themeColors.primary} size={25} />
          <Text style={[styles.text, {color: themeColors.text}]}>
            Refresh Data
          </Text>
        </View>
      </TouchableOpacity>

      {/* Share App Button */}
      <TouchableOpacity onPress={handleShare}>
        <View style={styles.item}>
          <Icon name="share" color={themeColors.primary} size={25} />
          <Text style={[styles.text, {color: themeColors.text}]}>
            Share App
          </Text>
        </View>
      </TouchableOpacity>

      {/* Toast Message */}
      {refreshMessage ? (
        <View style={[styles.toast, {backgroundColor: themeColors.surface}]}>
          <Text style={[styles.toastText, {color: themeColors.text}]}>
            {refreshMessage}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  item: {
    borderBottomColor: 'rgba(0,0,0,0.2)',
    borderBottomWidth: 1,
    padding: 10,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  text: {
    flex: 1,
    fontSize: 18,
    marginLeft: 20,
  },
  toast: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 4,
  },
  toastText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ProfileDisplay;
