import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  Pressable,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {BlurView} from '@react-native-community/blur';

const {width, height} = Dimensions.get('window');

const EditCollectionModal = ({
  visible,
  themeColors,
  collectionName,
  editSlideAnim,
  onClose,
  onChangeText,
  onConfirm,
  value,
  errorMessage,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{flex: 1}}>
        <Pressable style={styles.modalOverlay} onPress={onClose}>
          {Platform.OS === 'ios' && (
            <BlurView
              style={StyleSheet.absoluteFill}
              blurType="dark"
              blurAmount={10}
              reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.5)"
            />
          )}
          <Animated.View
            style={[
              styles.modalContainer,
              {
                backgroundColor: themeColors.surface,
                transform: [
                  {
                    translateY: editSlideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [300, 0],
                    }),
                  },
                ],
              },
            ]}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons
                name="playlist-edit"
                size={36}
                color={themeColors.primary}
              />
            </View>
            <Text
              style={[styles.modalTitle, {color: themeColors.text}]}
              accessibilityLabel="Edit Collection"
              accessibilityRole="header">
              Edit Collection
            </Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  borderColor: errorMessage ? '#FF5252' : themeColors.border,
                  color: themeColors.text,
                  backgroundColor: themeColors.background,
                },
              ]}
              value={value}
              onChangeText={onChangeText}
              placeholder="Enter new name"
              placeholderTextColor={themeColors.placeholder}
              autoFocus={true}
              selectionColor={themeColors.primary}
              accessibilityLabel="Collection name input"
              accessibilityHint="Enter a new name for this collection"
              accessibilityRole="text"
            />
            {errorMessage ? (
              <View
                style={styles.errorContainer}
                accessibilityLabel="Error"
                accessibilityRole="alert">
                <MaterialCommunityIcons
                  name="alert-circle"
                  size={18}
                  color="#FF5252"
                  style={styles.errorIcon}
                />
                <Text
                  style={styles.errorText}
                  accessibilityLabel={errorMessage}>
                  {errorMessage}
                </Text>
              </View>
            ) : null}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.cancelButton,
                  {borderColor: themeColors.border},
                ]}
                onPress={onClose}
                accessibilityLabel="Cancel"
                accessibilityHint="Close this dialog without saving changes"
                accessibilityRole="button">
                <Text style={[styles.buttonText, {color: themeColors.text}]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modalButton,
                  styles.saveButton,
                  {backgroundColor: themeColors.primary},
                ]}
                onPress={onConfirm}
                testID="confirm-edit"
                accessibilityLabel="Save changes"
                accessibilityHint="Save the new name for this collection"
                accessibilityRole="button">
                <MaterialCommunityIcons
                  name="content-save"
                  size={18}
                  color="#FFFFFF"
                  style={styles.buttonIcon}
                />
                <Text style={[styles.buttonText, {color: '#FFFFFF'}]}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor:
      Platform.OS === 'ios' ? 'transparent' : 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: width * 0.85,
    maxWidth: 340,
    borderRadius: 24,
    paddingTop: 28,
    paddingHorizontal: 24,
    paddingBottom: 28,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(103, 58, 183, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#673AB7',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
    }),
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  textInput: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
    width: '100%',
  },
  errorIcon: {
    marginRight: 6,
  },
  errorText: {
    color: '#FF5252',
    fontSize: 14,
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  cancelButton: {
    marginRight: 10,
    borderWidth: 1,
  },
  saveButton: {
    marginLeft: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
});

export default EditCollectionModal;
