import React, { useState, useContext, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Share,
  Modal,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { refreshAllData } from '../../config/DataService';
import { ThemeContext } from '../../../App';
import NetInfo from '@react-native-community/netinfo';

const ProfileDisplay = ({navigation}) => {
  const [refreshMessage, setRefreshMessage] = useState('');
  const { themeColors } = useContext(ThemeContext);
  const [alertModal, setAlertModal] = useState({ visible: false, type: null, message: '' });
  const alertAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(0.3)).current;
  const [isRefreshing, setIsRefreshing] = useState(false);

  const showAlert = (type, message) => {
    setAlertModal({ visible: true, type, message });
    Animated.parallel([
      Animated.spring(alertAnimation, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 10,
      }),
      Animated.spring(scaleAnimation, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 12,
      }),
    ]).start();

    if (type === 'success') {
      setTimeout(() => closeAlertModal(), 2000);
    }
  };

  const closeAlertModal = () => {
    Animated.parallel([
      Animated.timing(alertAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnimation, {
        toValue: 0.3,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setAlertModal({ visible: false, type: null, message: '' }));
  };

  const checkInternet = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      showAlert('error', 'Please check your internet connection and try again.');
      return false;
    }
    return true;
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      // Check for internet connection
      const hasInternet = await checkInternet();
      if (!hasInternet) {
        setIsRefreshing(false);
        return;
      }

      const success = await refreshAllData();
      if (success) {
        showAlert('success', 'Data has been refreshed successfully!');
      } else {
        showAlert('error', 'Failed to refresh data. Please try again later.');
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      showAlert('error', 'An unexpected error occurred. Please try again later.');
    } finally {
      setIsRefreshing(false);
    }
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
      <TouchableOpacity onPress={handleRefresh} disabled={isRefreshing}>
        <View style={styles.item}>
          <Icon name={isRefreshing ? "sync" : "refresh"} color={themeColors.primary} size={25} />
          <Text style={[styles.text, {color: themeColors.text}]}>
            {isRefreshing ? 'Refreshing Data...' : 'Refresh Data'}
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

      {/* Alert Modal */}
      <Modal transparent visible={alertModal.visible} onRequestClose={closeAlertModal}>
        <TouchableOpacity
          activeOpacity={1}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={closeAlertModal}
        >
          <Animated.View
            style={{
              width: '80%',
              maxWidth: 300,
              backgroundColor: themeColors.surface,
              borderRadius: 20,
              padding: 20,
              elevation: 5,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              transform: [
                { scale: scaleAnimation },
                {
                  translateY: alertAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
              opacity: alertAnimation,
            }}
          >
            <View style={{ alignItems: 'center' }}>
              <Animated.View
                style={{
                  transform: [
                    {
                      scale: alertAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1],
                      }),
                    },
                  ],
                }}
              >
                {alertModal.type === 'success' ? (
                  <Icon name="check-circle" size={60} color={themeColors.primary} />
                ) : (
                  <Icon name="error" size={60} color="#F44336" />
                )}
              </Animated.View>
              <Text
                style={{
                  marginTop: 15,
                  marginBottom: 10,
                  fontSize: 22,
                  color: themeColors.text,
                  fontWeight: 'bold',
                  textAlign: 'center',
                  letterSpacing: 0.5,
                }}
              >
                {alertModal.type === 'success' ? 'Success!' : 'Error'}
              </Text>
              <Text
                style={{
                  color: themeColors.text,
                  textAlign: 'center',
                  marginBottom: 15,
                  fontSize: 16,
                  opacity: 0.9,
                  lineHeight: 22,
                }}
              >
                {alertModal.message}
              </Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Legacy Toast Message - keeping for backwards compatibility */}
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
