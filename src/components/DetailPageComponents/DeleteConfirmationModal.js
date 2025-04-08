import React, {useRef, useEffect} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const DeleteConfirmationModal = ({visible, themeColors, onClose, onDelete}) => {
  const alertAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
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
    } else {
      // Reset animations
      alertAnimation.setValue(0);
      scaleAnimation.setValue(0.3);
    }
  }, [visible, alertAnimation, scaleAnimation]);

  const closeWithAnimation = callback => {
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
    ]).start(() => {
      if (callback) callback();
      onClose();
    });
  };

  return (
    <Modal
      transparent
      visible={visible}
      onRequestClose={() => closeWithAnimation()}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => closeWithAnimation()}>
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
          <Icon name="delete-forever" size={60} color="#F44336" />
          <Text style={[styles.alertTitle, {color: themeColors.text}]}>
            Delete Song
          </Text>
          <Text style={[styles.alertMessage, {color: themeColors.text}]}>
            Are you sure you want to delete this song? This action cannot be
            undone.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, {backgroundColor: themeColors.border}]}
              onPress={() => closeWithAnimation()}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, {backgroundColor: '#F44336'}]}
              onPress={() => closeWithAnimation(onDelete)}>
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
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
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default DeleteConfirmationModal;
