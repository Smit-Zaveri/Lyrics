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
          <View style={[styles.iconContainer, { backgroundColor: 'rgba(244, 67, 54, 0.15)' }]}>  
            <Icon name="delete-forever" size={48} color="#F44336" />
          </View>
          <Text style={[styles.alertTitle, {color: themeColors.text}]}>
            Delete Song
          </Text>
          <Text style={[styles.alertMessage, {color: themeColors.text}]}>
            Are you sure you want to delete this song? This action cannot be
            undone.
          </Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { borderColor: themeColors.border }]}
              onPress={() => closeWithAnimation()}>
              <Text style={[styles.buttonText, { color: themeColors.text }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.deleteButton]}
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertContainer: {
    width: '75%',
    maxWidth: 280,
    borderRadius: 16,
    padding: 18,
    elevation: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: 'rgba(244, 67, 54, 0.2)',
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 8,
    letterSpacing: 0.3,
  },
  alertMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 18,
    opacity: 0.85,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 100,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cancelButton: {
    borderWidth: 1.5,
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});

export default DeleteConfirmationModal;
