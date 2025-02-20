import React, { useState, useEffect, useContext, useRef } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  Modal,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import DropDownPicker from 'react-native-dropdown-picker';
import { Button } from 'react-native-paper';
import { ThemeContext } from '../../../App';
import NetInfo from '@react-native-community/netinfo';
import Icon from 'react-native-vector-icons/MaterialIcons';

const InputField = ({
  control,
  name,
  placeholder,
  rules,
  multiline,
  numberOfLines,
  themeColors,
}) => {
  return (
    <Controller
      control={control}
      rules={rules}
      render={({field: {onChange, onBlur, value}}) => (
        <TextInput
          style={[
            styles.input,
            multiline && styles.textArea,
            {backgroundColor: themeColors.surface, color: themeColors.text},
          ]}
          placeholder={placeholder}
          placeholderTextColor={themeColors.placeholder}
          onBlur={onBlur}
          onChangeText={onChange}
          value={value}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />
      )}
      name={name}
    />
  );
};

const Suggestion = () => {
  const { themeColors } = useContext(ThemeContext);
  const [alertModal, setAlertModal] = useState({ visible: false, type: null, message: '' });
  const alertAnimation = useRef(new Animated.Value(0)).current;
  const scaleAnimation = useRef(new Animated.Value(0.3)).current;

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: {errors},
  } = useForm({
    defaultValues: {
      title: '',
      content: '',
      publishDate: '',
      collection: '',
    },
  });

  const [date, setDate] = useState(dayjs());
  const [collections, setCollections] = useState([]);
  const [collectionDropdownOpen, setCollectionDropdownOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const collectionsRef = collection(db, 'collections');
        const snapshot = await getDocs(collectionsRef);
        const collectionData = snapshot.docs.map(doc => ({
          label: doc.data().displayName || doc.data().name,
          value: doc.data().name,
        }));
        setCollections(collectionData);
      } catch (error) {
        console.error('Error fetching collections:', error);
      }
    };

    fetchCollections();
  }, []);

  const onSubmit = async data => {
    if (!(await checkInternet())) return;
    
    setIsSubmitting(true);
    try {
      const suggestionsRef = collection(db, 'suggestions_new');
      await addDoc(suggestionsRef, {
        ...data,
        publishDate: date.toDate(),
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      reset();
      setSelectedCollection(null);
      showAlert('success', 'Your suggestion has been submitted successfully!');
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      showAlert('error', 'Failed to submit suggestion. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.form}>
        {collections.length > 0 && (
          <DropDownPicker
            open={collectionDropdownOpen}
            value={selectedCollection}
            items={collections}
            setOpen={setCollectionDropdownOpen}
            setValue={setSelectedCollection}
            onChangeValue={(value) => {
              setValue('collection', value);
            }}
            style={{
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            }}
            textStyle={{
              color: themeColors.text,
            }}
            placeholderStyle={{
              color: themeColors.placeholder,
            }}
            dropDownContainerStyle={{
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            }}
            theme={themeColors.background === '#1E1E2F' ? 'DARK' : 'LIGHT'}
            listItemContainerStyle={{
              backgroundColor: themeColors.surface,
            }}
            selectedItemContainerStyle={{
              backgroundColor: themeColors.cardBackground,
            }}
            selectedItemLabelStyle={{
              color: themeColors.text,
            }}
            listItemLabelStyle={{
              color: themeColors.text,
            }}
            listMode="SCROLLVIEW"
          />
        )}

        <InputField
          control={control}
          name="title"
          placeholder="Title"
          rules={{required: true}}
          themeColors={themeColors}
        />
        {errors.title && <Text style={styles.error}>Title is required.</Text>}

        <InputField
          control={control}
          name="content"
          placeholder="Content"
          rules={{required: true}}
          multiline
          numberOfLines={4}
          themeColors={themeColors}
        />
        {errors.content && (
          <Text style={styles.error}>Content is required.</Text>
        )}

        <Button
          mode="contained"
          disabled={isSubmitting}
          onPress={handleSubmit(onSubmit)}
          style={[styles.submitButton, { backgroundColor: themeColors.primary }]}
          loading={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
        </Button>
      </View>

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  form: {
    gap: 15,
  },
  input: {
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  dateButton: {
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
  },
  dateButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  submitButton: {
    marginTop: 20,
    borderRadius: 5,
  },
});

export default Suggestion;
