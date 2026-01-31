import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext,
} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
  ScrollView,
  Animated,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import {collection, addDoc} from 'firebase/firestore';
import {Menu, MenuItem} from 'react-native-material-menu';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {ThemeContext} from '../../App';
import {db} from '../firebase/config';

const CustomMaterialMenu = ({isIcon, menuText, textStyle, item}) => {
  const {themeColors} = useContext(ThemeContext);
  const [visible, setVisible] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Combined alert modal state for both success and error
  const [alertModal, setAlertModal] = useState({
    visible: false,
    type: null,
    message: '',
  });

  // Shared animations for alert modal
  const alertAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(0.3)).current;

  const textInputRef = useRef(null);
  const slideAnimation = useRef(new Animated.Value(0)).current;

  const hideMenu = useCallback(() => setVisible(false), []);
  const showMenu = useCallback(() => setVisible(true), []);

  const animateModal = useCallback(
    toValue => {
      Animated.timing(slideAnimation, {
        toValue,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        if (toValue === 0) {
          Keyboard.dismiss();
          setShowReportModal(false);
        } else if (toValue === 1) {
          // Focus the input and show keyboard after animation completes
          setTimeout(() => {
            if (textInputRef.current) {
              textInputRef.current.focus();
            }
          }, 100);
        }
      });
    },
    [slideAnimation],
  );

  // Unified alert function for both success and error cases
  const showAlert = (type, message) => {
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
    ]).start();

    // Auto-close success alerts after 2 seconds
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
    ]).start(() => setAlertModal({visible: false, type: null, message: ''}));
  };

  const checkInternet = async () => {
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      showAlert(
        'error',
        'Please check your internet connection and try again.',
      );
      return false;
    }
    return true;
  };

  const openReportPopup = useCallback(() => {
    setReportText('');
    setShowReportModal(true);
    hideMenu();
  }, [hideMenu]);

  useEffect(() => {
    if (showReportModal) {
      animateModal(1);

      // Force keyboard to appear with a slight delay to ensure modal is fully visible
      const timer = setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus();
          // Force keyboard to show
          textInputRef.current.blur();
          textInputRef.current.focus();
        }
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [showReportModal, animateModal]);

  const submitReport = useCallback(async () => {
    if (!reportText.trim()) {
      showAlert('error', 'Please enter a report before submitting!');
      return;
    }

    if (!(await checkInternet())) return;

    setIsSubmitting(true);
    try {
      const {id, title} = item;
      const reportsRef = collection(db, 'reports');
      await addDoc(reportsRef, {
        lyricsId: id,
        lyricsTitle: title,
        reportText,
        timestamp: new Date(),
      });
      showAlert('success', 'Your report has been submitted successfully!');
      setReportText('');
    } catch (error) {
      console.error('Error submitting report:', error);
      showAlert('error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [reportText, item]);

  const modalAnimation = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });

  const modalOpacityAnimation = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <View>
      {isIcon ? (
        <TouchableOpacity onPress={showMenu} testID="menu-button"
          accessibilityLabel="More options"
          accessibilityHint="Open menu for additional actions"
          accessibilityRole="button"
          style={{padding: 8, minWidth: 44, minHeight: 44, justifyContent: 'center', alignItems: 'center'}}>
          <MaterialCommunityIcons name="dots-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      ) : (
        <Text onPress={showMenu} style={textStyle}>
          {menuText}
        </Text>
      )}
      <Menu visible={visible} onRequestClose={hideMenu}>
        <MenuItem
          onPress={openReportPopup}
          textStyle={{color: '#333333', fontWeight: 'bold'}}
          accessibilityLabel="Report lyrics"
          accessibilityHint="Report this song for issues or inappropriate content"
          accessibilityRole="menuitem">
          Report
        </MenuItem>
      </Menu>

      <Modal
        transparent
        visible={showReportModal}
        onRequestClose={() => animateModal(0)}
        onShow={() => {
          // Try to focus immediately on show as well
          setTimeout(() => {
            if (textInputRef.current) {
              textInputRef.current.focus();
            }
          }, 300);
        }}>
        <TouchableOpacity
          activeOpacity={1}
          style={{flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)'}}
          onPress={() => animateModal(0)}>
          <Animated.View
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '80%',
              maxWidth: 300,
              backgroundColor: themeColors.surface,
              borderRadius: 20,
              padding: 20,
              transform: [
                {translateX: -150},
                {translateY: -100},
                {translateY: modalAnimation},
              ],
              opacity: modalOpacityAnimation,
            }}>
            <Text
              style={{
                marginBottom: 13,
                fontSize: 20,
                color: themeColors.text,
                fontWeight: 'bold',
              }}>
              Report Lyrics:
            </Text>
            <ScrollView
              style={{marginBottom: 10}}
              contentContainerStyle={{
                borderColor: '#ccc',
                backgroundColor: themeColors.background,
                borderRadius: 10,
              }}>
              <TextInput
                ref={textInputRef}
                value={reportText}
                onChangeText={setReportText}
                placeholder="Enter your report"
                placeholderTextColor={themeColors.placeholder}
                multiline
                autoFocus={true}
                keyboardType="default"
                autoCapitalize="sentences"
                blurOnSubmit={false}
                style={{
                  flex: 1,
                  backgroundColor: themeColors.inputBackground || '#f0f0f0',
                  color: themeColors.inputText || '#000',
                  padding: 10,
                  borderRadius: 8,
                }}
              />
            </ScrollView>
            <Pressable
              testID="submit-report"
              disabled={isSubmitting}
              style={({pressed}) => ({
                backgroundColor: isSubmitting
                  ? '#999'
                  : pressed
                    ? '#673ae2'
                    : themeColors.primary,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 10,
                paddingHorizontal: 20,
                flexDirection: 'row',
                minHeight: 44,
              })}
              onPress={submitReport}
              accessibilityLabel="Submit report"
              accessibilityHint="Send the report to the developers"
              accessibilityRole="button">
              {isSubmitting ? (
                <ActivityIndicator
                  size="small"
                  color="#fff"
                  style={{marginRight: 10}}
                />
              ) : null}
              <Text style={{color: '#fff', fontWeight: 'bold'}}>
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </Text>
            </Pressable>
          </Animated.View>
        </TouchableOpacity>
      </Modal>

      {/* Combined Alert Modal for both Success and Error */}
      <Modal
        transparent
        visible={alertModal.visible}
        onRequestClose={closeAlertModal}>
        <TouchableOpacity
          activeOpacity={1}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onPress={closeAlertModal}>
          <Animated.View
            style={{
              width: '80%',
              maxWidth: 300,
              backgroundColor: themeColors.surface,
              borderRadius: 20,
              padding: 20,
              elevation: 5,
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
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
            }}>
            <View style={{alignItems: 'center'}}>
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
                }}>
                {alertModal.type === 'success' ? (
                  <Icon
                    name="check-circle"
                    size={60}
                    color={themeColors.primary}
                  />
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
                }}>
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
                }}>
                {alertModal.message}
              </Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default CustomMaterialMenu;
