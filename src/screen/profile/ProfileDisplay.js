import React, {useState, useContext, useRef, useCallback, memo} from 'react';
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
import NetInfo from '@react-native-community/netinfo';
import {refreshAllData} from '../../config/DataService';
import {ThemeContext} from '../../../App';

const ProfileDisplay = ({navigation}) => {
  const [alertModal, setAlertModal] = useState({
    visible: false,
    type: null,
    message: '',
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {themeColors} = useContext(ThemeContext);
  const alertAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(0.3)).current;

  const closeAlertModal = useCallback(() => {
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
    ]).start(() => setAlertModal({visible: false, type: null, message: ''}));
  }, [alertAnimation, scaleAnimation]);

  const showAlert = useCallback(
    (type, message) => {
      setAlertModal({visible: true, type, message});
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
      ]).start(() => {
        if (type === 'success') {
          setTimeout(closeAlertModal, 2000);
        }
      });
    },
    [alertAnimation, scaleAnimation, closeAlertModal],
  );

  const checkInternet = useCallback(async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      showAlert('error', 'No internet connection. Please try again.');
      return false;
    }
    return true;
  }, [showAlert]);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      if (!(await checkInternet())) return;
      const success = await refreshAllData();
      showAlert(
        success ? 'success' : 'error',
        success
          ? 'Data refreshed successfully!'
          : 'Failed to refresh data. Try again later.',
      );
    } catch (error) {
      console.error('Error refreshing data:', error);
      showAlert('error', 'An unexpected error occurred.');
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing, checkInternet, showAlert]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({
        message:
          `🌟 Discover Your Next Favorite Lyrics App! 🎶\n\n` +
          `Hey there! If you love music and want to access a world of lyrics at your fingertips, check out this amazing app!\n\n` +
          `✨ Download it here: https://bit.ly/jain_dhun\n\n` +
          `Join the community of music lovers and elevate your listening experience today! 🎤💖`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, []);

  return (
    <View style={[styles.container, {backgroundColor: themeColors.background}]}>
      {/* Menu Items */}
      <MenuItem
        icon="settings"
        label="Settings"
        onPress={() => navigation.navigate('Settings')}
        themeColors={themeColors}
      />
      <MenuItem
        icon="collections-bookmark"
        label="My Collections"
        onPress={() => navigation.navigate('Collections')}
        themeColors={themeColors}
      />
      <MenuItem
        icon="info"
        label="Suggestion"
        onPress={() => navigation.navigate('Suggestion')}
        themeColors={themeColors}
      />
      <MenuItem
        icon={isRefreshing ? 'sync' : 'refresh'}
        label={isRefreshing ? 'Refreshing Data...' : 'Refresh Data'}
        onPress={handleRefresh}
        disabled={isRefreshing}
        themeColors={themeColors}
      />
      <MenuItem
        icon="share"
        label="Share App"
        onPress={handleShare}
        themeColors={themeColors}
      />

      {/* Alert Modal */}
      <AlertModal
        visible={alertModal.visible}
        type={alertModal.type}
        message={alertModal.message}
        themeColors={themeColors}
        closeAlert={closeAlertModal}
        alertAnimation={alertAnimation}
        scaleAnimation={scaleAnimation}
      />
    </View>
  );
};

const MenuItem = memo(
  ({icon, label, onPress, disabled = false, themeColors}) => (
    <TouchableOpacity onPress={onPress} disabled={disabled}>
      <View
        style={[
          styles.item,
          {borderBottomColor: themeColors.border || '#444'},
        ]}>
        <Icon style={{marginLeft: 5}} name={icon} color={themeColors.primary} size={25} />
        <Text style={[styles.text, {color: themeColors.text}]}>{label}</Text>
      </View>
    </TouchableOpacity>
  ),
);

const AlertModal = memo(
  ({
    visible,
    type,
    message,
    themeColors,
    closeAlert,
    alertAnimation,
    scaleAnimation,
  }) => (
    <Modal transparent visible={visible} onRequestClose={closeAlert}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={closeAlert}>
        <Animated.View
          style={[
            styles.alertContainer,
            {
              backgroundColor: themeColors.surface,
              transform: [
                {scale: scaleAnimation},
                {
                  translateY: alertAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
              opacity: alertAnimation,
            },
          ]}>
          <Icon
            name={type === 'success' ? 'check-circle' : 'error'}
            size={60}
            color={type === 'success' ? themeColors.primary : '#F44336'}
          />
          <Text style={[styles.alertTitle, {color: themeColors.text}]}>
            {type === 'success' ? 'Success!' : 'Error'}
          </Text>
          <Text style={[styles.alertMessage, {color: themeColors.text}]}>
            {message}
          </Text>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  ),
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 5,
  },
  item: {
    borderBottomWidth: 0.5,
    padding: 10,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    flex: 1,
    fontSize: 18,
    marginLeft: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: '80%',
    maxWidth: 300,
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  alertMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default ProfileDisplay;
