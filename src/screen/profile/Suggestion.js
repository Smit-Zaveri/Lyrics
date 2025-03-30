import React, {useState, useEffect, useContext, useRef} from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
  Modal,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import {Controller, useForm} from 'react-hook-form';
import {collection, getDocs, addDoc, serverTimestamp} from 'firebase/firestore';
import {db} from '../../firebase/config';
import DropDownPicker from 'react-native-dropdown-picker';
import {Button} from 'react-native-paper';
import {ThemeContext} from '../../../App';
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
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              multiline && styles.textArea,
              {
                backgroundColor: themeColors.surface,
                color: themeColors.text,
                borderColor: themeColors.border,
              },
            ]}
            placeholder={placeholder}
            placeholderTextColor={themeColors.placeholder}
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            multiline={multiline}
            numberOfLines={numberOfLines}
          />
        </View>
      )}
      name={name}
    />
  );
};

const ErrorMessage = ({message, show}) => {
  if (!show) return null;
  return (
    <View style={styles.errorContainer}>
      <Icon
        name="error-outline"
        size={14}
        color="#ff4d4d"
        style={styles.errorIcon}
      />
      <Text style={styles.error}>{message}</Text>
    </View>
  );
};

const Suggestion = () => {
  const {themeColors} = useContext(ThemeContext);
  const [alertModal, setAlertModal] = useState({
    visible: false,
    type: null,
    message: '',
  });
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
      collection: 'general',
    },
    mode: 'onBlur',
  });

  const [collections, setCollections] = useState([]);
  const [collectionDropdownOpen, setCollectionDropdownOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const collectionsRef = collection(db, 'collections');
        const snapshot = await getDocs(collectionsRef);
        const collectionData = snapshot.docs.map(doc => ({
          label:
            doc.data().displayName + ' (' + doc.data().name + ')' ||
            doc.data().name,
          value: doc.data().name,
        }));

        const collectionsWithGeneral = [
          {label: 'General Suggestions', value: 'general'},
          ...collectionData,
        ];

        setCollections(collectionsWithGeneral);
      } catch (error) {
        console.error('Error fetching collections:', error);
        setCollections([{label: 'General Suggestions', value: 'general'}]);
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
      });
      reset();
      setSelectedCollection('general');
      showAlert('success', 'Your suggestion has been submitted successfully!');
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      showAlert('error', 'Failed to submit suggestion. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={[styles.container, {backgroundColor: themeColors.background}]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}>
      <View style={styles.form}>
        <View style={styles.fieldWrapper}>
          <Text style={[styles.fieldLabel, {color: themeColors.text}]}>
            Collection
          </Text>
          <DropDownPicker
            open={collectionDropdownOpen}
            value={selectedCollection}
            items={collections}
            setOpen={setCollectionDropdownOpen}
            setValue={setSelectedCollection}
            onChangeValue={value => {
              setValue('collection', value);
            }}
            placeholder="Select a collection"
            style={{
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
              borderWidth: 1,
              borderRadius: 8,
            }}
            textStyle={{
              color: themeColors.text,
              fontSize: 16,
            }}
            placeholderStyle={{
              color: themeColors.placeholder,
              fontSize: 16,
            }}
            dropDownContainerStyle={{
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
              borderWidth: 1,
              borderRadius: 8,
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
              fontWeight: 'bold',
            }}
            listItemLabelStyle={{
              color: themeColors.text,
            }}
            zIndex={3000}
            zIndexInverse={1000}
            listMode="SCROLLVIEW"
          />
          <ErrorMessage
            message="Please select a collection"
            show={
              errors.collection || (!selectedCollection && errors.collection)
            }
          />
        </View>

        <View style={styles.fieldWrapper}>
          <Text style={[styles.fieldLabel, {color: themeColors.text}]}>
            Title
          </Text>
          <InputField
            control={control}
            name="title"
            placeholder="Enter a title for your suggestion"
            rules={{required: 'Title is required'}}
            themeColors={themeColors}
          />
          <ErrorMessage
            message={errors.title?.message || 'Title is required'}
            show={errors.title}
          />
        </View>

        <View style={styles.fieldWrapper}>
          <Text style={[styles.fieldLabel, {color: themeColors.text}]}>
            Content
          </Text>
          <InputField
            control={control}
            name="content"
            placeholder="Describe your suggestion in detail"
            rules={{required: 'Content is required'}}
            multiline
            numberOfLines={6}
            themeColors={themeColors}
          />
          <ErrorMessage
            message={errors.content?.message || 'Content is required'}
            show={errors.content}
          />
        </View>

        <Button
          mode="contained"
          disabled={isSubmitting}
          onPress={handleSubmit(data => {
            if (!data.collection) {
              setValue('collection', '', {shouldValidate: true});
              return showAlert('error', 'Please fill in all required fields');
            }
            onSubmit(data);
          })}
          style={[styles.submitButton, {backgroundColor: themeColors.primary}]}
          labelStyle={styles.buttonLabel}
          loading={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
        </Button>
      </View>

      <Modal
        transparent
        visible={alertModal.visible}
        onRequestClose={closeAlertModal}>
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={closeAlertModal}>
          <Animated.View
            style={[
              styles.modalContent,
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
            <View style={styles.modalInner}>
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
              <Text style={[styles.alertTitle, {color: themeColors.text}]}>
                {alertModal.type === 'success' ? 'Success!' : 'Error'}
              </Text>
              <Text style={[styles.alertMessage, {color: themeColors.text}]}>
                {alertModal.message}
              </Text>
            </View>
          </Animated.View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  form: {
    gap: 15,
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  fieldWrapper: {
    marginBottom: 15,
  },
  inputContainer: {
    marginTop: 3,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  textArea: {
    height: 150,
    textAlignVertical: 'top',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 4,
  },
  errorIcon: {
    marginRight: 5,
  },
  error: {
    color: '#ff4d4d',
    fontSize: 13,
  },
  submitButton: {
    marginTop: 10,
    borderRadius: 8,
    paddingVertical: 5,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingVertical: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxWidth: 300,
    borderRadius: 16,
    padding: 20,
    elevation: 4,
  },
  modalInner: {
    alignItems: 'center',
  },
  alertTitle: {
    marginTop: 15,
    marginBottom: 10,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  alertMessage: {
    textAlign: 'center',
    marginBottom: 15,
    fontSize: 16,
    opacity: 0.9,
    lineHeight: 22,
  },
});

export default Suggestion;
