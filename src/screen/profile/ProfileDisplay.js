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
import {refreshAllData} from '../../config/dataService';
import {ThemeContext} from '../../../App';

// Import from package.json (for version)
const appVersion = require('../../../package.json').version;

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
          `🌟 Hello bhakti lovers, we recently launched our new Jain lyrics app! 🥳\n\n` +
          `✨🌈 Jain Dhun 🎧💫\n\n` +
          `✅ Advanced Search Facility\n` +
          `✅ All New & Upcoming Songs\n` +
          `✅ Quick-Glance Categories\n` +
          `✅ Bookmark Your Favourites\n` +
          `✅ Light & Dark Mode\n` +
          `✅ Adjustable Text Size\n` +
          `And Much More!\n\n` +
          `✨ Download it here: https://bit.ly/jain_dhun_apk\n\n` +
          `Sing, read, and feel the peace of Jain bhakti...! 💖 Be a part of our family 🎧🕉`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  }, []);

  return (
    <View style={[styles.container, {backgroundColor: themeColors.background}]}>
      {/* Menu Items Container */}
      <View style={styles.menuSection}>
        <View style={[styles.menuCard, {backgroundColor: themeColors.surface}]}>
          <MenuItem
            icon="settings"
            label="Settings"
            subtitle="Preferences and configuration"
            onPress={() => navigation.navigate('Settings')}
            themeColors={themeColors}
            isFirst
          />
          <MenuItem
            icon="collections-bookmark"
            label="My Collections"
            subtitle="Manage your saved items"
            onPress={() => navigation.navigate('Collections')}
            themeColors={themeColors}
          />
          <MenuItem
            icon="info"
            label="Suggestion"
            subtitle="Share your feedback"
            onPress={() => navigation.navigate('Suggestion')}
            themeColors={themeColors}
          />
          <MenuItem
            icon={isRefreshing ? 'sync' : 'refresh'}
            label={isRefreshing ? 'Refreshing Data...' : 'Refresh Data'}
            subtitle="Update latest content"
            onPress={handleRefresh}
            disabled={isRefreshing}
            themeColors={themeColors}
          />
          <MenuItem
            icon="share"
            label="Share App"
            subtitle="Tell your friends about us"
            onPress={handleShare}
            themeColors={themeColors}
            isLast
          />
        </View>
      </View>

      {/* Version Display */}
      <View style={[styles.versionContainer, {backgroundColor: themeColors.surface}]}>
        <Text style={[styles.versionText, {color: themeColors.textSecondary}]}>
          Version {appVersion}
        </Text>
      </View>

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
  ({icon, label, subtitle, onPress, disabled = false, themeColors, isFirst = false, isLast = false}) => (
    <TouchableOpacity 
      onPress={onPress} 
      disabled={disabled}
      activeOpacity={0.7}
      style={[
        styles.menuItemTouchable,
        isFirst && styles.firstItem,
        isLast && styles.lastItem,
      ]}>
      <View
        style={[
          styles.item,
          !isLast && {borderBottomColor: themeColors.border || 'rgba(0,0,0,0.05)', borderBottomWidth: 0.5},
          disabled && styles.itemDisabled,
        ]}>
        <View style={[styles.iconContainer, {backgroundColor: themeColors.primary + '15'}]}>
          <Icon
            name={icon}
            color={disabled ? themeColors.placeholder : themeColors.primary}
            size={24}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.text, {color: disabled ? themeColors.placeholder : themeColors.text}]}>{label}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, {color: themeColors.textSecondary}]}>{subtitle}</Text>
          )}
        </View>
        <Icon
          name="chevron-right"
          color={themeColors.placeholder}
          size={24}
          style={styles.chevronIcon}
        />
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
    paddingTop: 16,
  },
  menuSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  menuCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  menuItemTouchable: {
    overflow: 'hidden',
  },
  firstItem: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  lastItem: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  item: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 72,
  },
  itemDisabled: {
    opacity: 0.6,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  chevronIcon: {
    marginLeft: 8,
    opacity: 0.5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: '85%',
    maxWidth: 320,
    borderRadius: 24,
    padding: 32,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 16,
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  alertMessage: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 4,
  },
  versionContainer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 24,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  versionText: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
});

export default ProfileDisplay;
