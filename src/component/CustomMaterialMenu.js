import React, { useState, useEffect, useRef } from 'react';
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
import { Menu, MenuItem } from 'react-native-material-menu';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomMaterialMenu = ({
  isIcon,
  menuText,
  textStyle,
  item,
  theme, // Accept theme as a prop
}) => {
  const [visible, setVisible] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState('');

  const textInputRef = useRef(null);  // Create a ref for the TextInput

  const hideMenu = () => setVisible(false);
  const showMenu = () => setVisible(true);

  const slideAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showReportModal) {
      showSlideAnimation();
    }
  }, [showReportModal]);

  useEffect(() => {
    if (showReportModal) {
      // Delay focusing to ensure modal is fully rendered
      const timer = setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus();  // Focus the TextInput when modal is shown
        }
      }, 300);  // Adjust delay as needed

      return () => clearTimeout(timer);  // Clean up the timer on unmount
    }
  }, [showReportModal]);

  const showSlideAnimation = () => {
    Animated.timing(slideAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideSlideAnimation = () => {
    Animated.timing(slideAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowReportModal(false);
    });
  };

  const openReportPopup = () => {
    setReportText('');
    setShowReportModal(true);
    hideMenu();
  };

  const submitReport = () => {
    if (!reportText.trim()) {
      ToastAndroid.showWithGravity(
        'Please enter a report before submitting!',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM,
      );
      return;
    }

    const { id, title } = item;
    // Firestore submission logic here...
    const db = firestore();

    db.collection('reports')
      .add({
        lyricsId: id,
        lyricsTitle: title,
        reportText: reportText,
      })
      .then(() => {
        hideSlideAnimation();
      })
      .catch(error => {
        console.warn('Error submitting report:', error);
        // Handle any error that occurs during report submission
      });

    ToastAndroid.showWithGravity(
      'Report submitted successfully!',
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM,
    );

    hideSlideAnimation();
  };

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
      style={{backgroundColor: theme.background}}
        visible={visible}
        anchor={
          isIcon ? (
            <TouchableOpacity onPress={showMenu}>
              <MaterialCommunityIcons
                name="dots-vertical"
                color={theme.iconColor || '#fff'} // Apply theme color for icon
                size={26}
              />
            </TouchableOpacity>
          ) : (
            <Text onPress={showMenu} style={[textStyle, { color: theme.background}]}>
              {menuText}
            </Text>
          )
        }
        onRequestClose={hideMenu}
      >
        <MenuItem onPress={openReportPopup} textStyle={{ color: theme.menuItemText}}>
          Report
        </MenuItem>
      </Menu>

      {/* Report Modal */}
      <Modal
        transparent
        visible={showReportModal}
        onRequestClose={hideSlideAnimation}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onPress={hideSlideAnimation}
        >
          <Animated.View
            style={[
              {
                transform: [{ translateY: modalAnimation }],
                opacity: modalOpacityAnimation,
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: '80%',
                maxWidth: 300,
                backgroundColor: theme.surface, // Apply surface color from theme
                borderRadius: 20,
                padding: 20,
                transform: [
                  { translateX: -150 },
                  { translateY: -100 },
                  { translateY: modalAnimation },
                ],
              },
            ]}
          >
            <Text
              style={{
                marginBottom: 13,
                fontSize: 20,
                color: theme.text, // Apply text color from theme
                fontWeight: 'bold',
              }}
            >
              Report Lyrics:
            </Text>
            <ScrollView
              style={{ marginBottom: 10 }}
              contentContainerStyle={{
                borderColor: '#ccc',
                backgroundColor: theme.background, // Apply background color from theme
                borderRadius: 10,
              }}
            >
              <TextInput
                ref={textInputRef} // Attach ref to the TextInput
                onLayout={() => textInputRef.current.focus()}
                value={reportText}
                onChangeText={setReportText}
                placeholder="Enter your report"
                placeholderTextColor={theme.placeholder || '#888'} // Apply placeholder color from theme or a default value
                multiline
                autoFocus  // Ensure the keyboard is shown when the modal appears
                style={{
                  flex: 1,
                  backgroundColor: theme.inputBackground || '#f0f0f0', // Apply light background color from theme or a default value
                  color: theme.inputText || '#000', // Apply text color from theme
                  padding: 10, // Add padding for better readability
                  borderRadius: 8, // Optional: Add rounded corners
                }}
              />
            </ScrollView>
            <Pressable
              style={({ pressed }) => [
                {
                  backgroundColor: pressed ? '#673ae2' : theme.primary, // Apply primary color from theme
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                },
              ]}
              onPress={submitReport}
            >
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Submit</Text>
            </Pressable>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default CustomMaterialMenu;
