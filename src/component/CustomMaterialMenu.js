import React, {useState, useEffect, useRef, useCallback} from 'react';
import firestore from '@react-native-firebase/firestore';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Pressable,
  ToastAndroid,
  ScrollView,
  Animated,
} from 'react-native';
import {Menu, MenuItem} from 'react-native-material-menu';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomMaterialMenu = ({isIcon, menuText, textStyle, item, theme}) => {
  const [visible, setVisible] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState('');

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
        if (toValue === 0) setShowReportModal(false);
      });
    },
    [slideAnimation],
  );

  useEffect(() => {
    if (showReportModal) {
      animateModal(1);
      const timer = setTimeout(() => textInputRef.current?.focus(), 300);
      return () => clearTimeout(timer);
    }
  }, [showReportModal, animateModal]);

  const openReportPopup = useCallback(() => {
    setReportText('');
    setShowReportModal(true);
    hideMenu();
  }, [hideMenu]);

  const submitReport = useCallback(() => {
    if (!reportText.trim()) {
      ToastAndroid.show(
        'Please enter a report before submitting!',
        ToastAndroid.SHORT,
      );
      return;
    }

    const {id, title} = item;
    firestore()
      .collection('reports')
      .add({lyricsId: id, lyricsTitle: title, reportText})
      .then(() => {
        ToastAndroid.show('Report submitted successfully!', ToastAndroid.SHORT);
        animateModal(0);
      })
      .catch(error => console.warn('Error submitting report:', error));
  }, [reportText, item, animateModal]);

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
      <Menu
        visible={visible}
        style={{backgroundColor: theme.background}}
        anchor={
          isIcon ? (
            <TouchableOpacity onPress={showMenu}>
              <MaterialCommunityIcons
                name="dots-vertical"
                color={theme.iconColor || '#fff'}
                size={26}
              />
            </TouchableOpacity>
          ) : (
            <Text
              onPress={showMenu}
              style={[textStyle, {color: theme.background}]}>
              {menuText}
            </Text>
          )
        }
        onRequestClose={hideMenu}>
        <MenuItem
          onPress={openReportPopup}
          textStyle={{color: theme.menuItemText}}>
          Report
        </MenuItem>
      </Menu>

      <Modal
        transparent
        visible={showReportModal}
        onRequestClose={() => animateModal(0)}>
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
              backgroundColor: theme.surface,
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
                color: theme.text,
                fontWeight: 'bold',
              }}>
              Report Lyrics:
            </Text>
            <ScrollView
              style={{marginBottom: 10}}
              contentContainerStyle={{
                borderColor: '#ccc',
                backgroundColor: theme.background,
                borderRadius: 10,
              }}>
              <TextInput
                ref={textInputRef}
                value={reportText}
                onChangeText={setReportText}
                placeholder="Enter your report"
                placeholderTextColor={theme.placeholder || '#888'}
                multiline
                autoFocus
                style={{
                  flex: 1,
                  backgroundColor: theme.inputBackground || '#f0f0f0',
                  color: theme.inputText || '#000',
                  padding: 10,
                  borderRadius: 8,
                }}
              />
            </ScrollView>
            <Pressable
              style={({pressed}) => ({
                backgroundColor: pressed ? '#673ae2' : theme.primary,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 10,
                paddingHorizontal: 20,
              })}
              onPress={submitReport}>
              <Text style={{color: '#fff', fontWeight: 'bold'}}>Submit</Text>
            </Pressable>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default CustomMaterialMenu;
