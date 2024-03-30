import React, { useState, useEffect, useRef } from 'react';
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
  route,
  navigation,
  item,
}) => {
  const [visible, setVisible] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportText, setReportText] = useState('');

  const hideMenu = () => setVisible(false);
  const showMenu = () => setVisible(true);

  const slideAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (showReportModal) {
      showSlideAnimation();
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
    // Validate if the report text is empty
    if (!reportText.trim()) {
      ToastAndroid.showWithGravity(
        'Please enter a report before submitting!',
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM
      );
      return;  // Exit the function if validation fails
    }
  
    // Logic to submit the report to Firestore with the post ID
    const { id, title } = item;
  
    // Perform the necessary code to send the report to Firestore using the 'reportText', 'id', and 'title'
    // For example, you can use the Firebase SDK to interact with Firestore
  
    ToastAndroid.showWithGravity(
      'Report submitted successfully!',
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM
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
        visible={visible}
        anchor={
          isIcon ? (
            <TouchableOpacity onPress={showMenu}>
              <MaterialCommunityIcons
                name="dots-vertical"
                color={'#fff'}
                size={26}
              />
            </TouchableOpacity>
          ) : (
            <Text onPress={showMenu} style={[textStyle, { color: '#333' }]}>
              {menuText}
            </Text>
          )
        }
        onRequestClose={hideMenu}>
        <MenuItem onPress={openReportPopup} style={{ color: '#333' }}>
          Report
        </MenuItem>
      </Menu>

      {/* Report Modal */}
      <Modal
        transparent
        visible={showReportModal}
        onRequestClose={hideSlideAnimation}>
        <TouchableOpacity
          activeOpacity={1}
          style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
          onPress={hideSlideAnimation}>
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
                backgroundColor: '#fff',
                borderRadius: 20,
                padding: 20,
                transform: [
                  { translateX: -150 },
                  { translateY: -100 },
                  { translateY: modalAnimation },
                ],
              },
            ]}>
            <Text
              style={{
                marginBottom: 13,
                fontSize: 20,
                color: '#333',
                fontWeight: 'bold',
              }}>
              Report Lyrics :-
            </Text>
            <ScrollView
              style={{ height: 90, marginBottom: 10 }}
              contentContainerStyle={{
                borderColor: '#ccc',
                backgroundColor: '#f5f5f5',
                borderRadius: 10,
                color: '#333',
                fontWeight: '800',
                paddingBottom: 30,
                paddingHorizontal: 10,
              }}>
              <TextInput
                value={reportText}
                onChangeText={(text) => setReportText(text)}
                placeholder="Enter your report"
                multiline={true}
                style={{
                  flex: 1,
                }}
              />
            </ScrollView>
            <Pressable
              style={({ pressed }) => [
                {
                  backgroundColor: pressed ? '#673ae2' : '#673ab7',
                  borderRadius: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingVertical: 10,
                  paddingHorizontal: 20,
                },
              ]}
              onPress={submitReport}>
              <Text style={{ color: '#fff', fontWeight: 'bold' }}>Submit</Text>
            </Pressable>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default CustomMaterialMenu;
