import React, { useState, useEffect, useContext } from 'react';
import {
  Text,
  View,
  StyleSheet,
  TextInput,
} from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import DropDownPicker from 'react-native-dropdown-picker';
import { Button } from 'react-native-paper';
import { ThemeContext } from '../../../App';

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

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: {errors},
  } = useForm({
    defaultValues: {
      title: '',
      artistName: '',
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
    setIsSubmitting(true);
    try {
      const suggestionsRef = collection(db, 'suggestions');
      await addDoc(suggestionsRef, {
        ...data,
        publishDate: date.toDate(),
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      reset();
      setSelectedCollection(null);
    } catch (error) {
      console.error('Error submitting suggestion:', error);
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
          name="artistName"
          placeholder="Artist name"
          themeColors={themeColors}
        />

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
          Submit Suggestion
        </Button>
      </View>
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
