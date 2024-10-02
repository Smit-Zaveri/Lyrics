import React, {useState, useEffect, useCallback} from 'react';
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  useColorScheme,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import {Controller, useForm} from 'react-hook-form';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import {colors} from '../../theme/theme';
import firestore from '@react-native-firebase/firestore';
import DropDownPicker from 'react-native-dropdown-picker';
import { Button } from 'react-native-paper'; // Importing Material UI Button from react-native-paper

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
  const systemTheme = useColorScheme();
  const isDarkMode = systemTheme === 'dark';
  const themeColors = isDarkMode ? colors.dark : colors.light;

  const {
    control,
    handleSubmit,
    setValue,
    reset, // Add reset to clear form fields
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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [collections, setCollections] = useState([]);
  const [collectionDropdownOpen, setCollectionDropdownOpen] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false); // Track submission status

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const snapshot = await firestore()
          .collection('collections')
          .orderBy('numbering')
          .get();

        const collectionList = snapshot.docs.map(doc => {
          const name = doc.data().name;
          return {
            label: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize first letter
            value: name,
          };
        });

        collectionList.unshift({
          label: 'Lyrics', // Label for the manually added collection
          value: 'lyrics', // Value for the manually added collection
        });

        setCollections(collectionList);
      } catch (error) {
        console.error('Error fetching collections: ', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);
  console.log(collections);

  const onSubmit = useCallback(
    async data => {
      if (isSubmitting) return; // Prevent multiple submissions

      setIsSubmitting(true); // Set submitting status
      try {
        await firestore()
          .collection('suggestions_new')
          .add({
            ...data,
            publishDate: date.format('YYYY-MM-DD'),
            collection: selectedCollection,
          });

        reset(); // Clear form fields after submission
        setSelectedCollection(null); // Reset selected collection
        setDate(dayjs()); // Reset date to current
      } catch (error) {
        console.error('Error adding document: ', error);
      } finally {
        setIsSubmitting(false); // Reset submitting status
      }
    },
    [date, selectedCollection, isSubmitting, reset],
  );

  return (
    <FlatList
      contentContainerStyle={[
        styles.scrollContainer,
        {backgroundColor: themeColors.background},
      ]}
      data={[0]} // Just to render a single item, can be replaced with a more meaningful array if needed
      renderItem={() => (
        <View
          style={[
            styles.container,
            {backgroundColor: themeColors.cardBackground},
          ]}>
          <Text style={[styles.label, {color: themeColors.text}]}>
            Select Collection:
          </Text>
          {loading ? (
            <ActivityIndicator size="large" color={themeColors.primary} />
          ) : (
            <DropDownPicker
              open={collectionDropdownOpen}
              value={selectedCollection}
              items={collections}
              setOpen={setCollectionDropdownOpen}
              setValue={setSelectedCollection}
              placeholder="Select a collection"
              containerStyle={{marginBottom: 20}}
              style={{
                backgroundColor: themeColors.surface, // Dropdown background
                borderColor: themeColors.text, // Border color
              }}
              arrowIconStyle={{
                tintColor: themeColors.text, // Set the color of the dropdown arrow
              }}
              tickIconStyle={{
                tintColor: themeColors.text, // Set the color of the dropdown arrow
              }}
              dropDownContainerStyle={{
                backgroundColor: themeColors.surface, // Dropdown items container background
                borderColor: themeColors.text, // Border color
                maxHeight: 200, // Height of the dropdown
              }}
              labelStyle={{
                color: themeColors.text, // Text color for selected item
              }}
              textStyle={{
                color: themeColors.text, // Text color for dropdown items
              }}
              placeholderStyle={{
                color: themeColors.placeholder, // Placeholder text color
              }}
              listMode="SCROLLVIEW" // Ensures the list is scrollable
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
            rules={{required: true}}
            themeColors={themeColors}
          />
          {errors.artistName && (
            <Text style={styles.error}>Artist name is required.</Text>
          )}

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

          <Text style={[styles.label, {color: themeColors.text}]}>
            Publish Date:
          </Text>
          <TouchableOpacity
            style={[styles.dateButton, {backgroundColor: themeColors.primary}]}
            onPress={() => setShowDatePicker(true)}
            accessibilityLabel="Select Publish Date">
            <Text style={styles.dateButtonText}>
              {date.format('MMMM D, YYYY')}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                if (event.type === 'set') {
                  setDate(dayjs(selectedDate));
                }
                setShowDatePicker(false);
              }}
            />
          )}

          <Button
            mode="contained"
            disabled={isSubmitting} // Disable button while submitting
            onPress={handleSubmit(onSubmit)}
            style={styles.submitButton}
            accessibilityLabel="Submit Suggestion">
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </View>
      )}
      keyExtractor={(item, index) => index.toString()} // Use index as key since we are only rendering one item
    />
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  container: {
    flex: 1,
    padding: 20,
    borderRadius: 10,
    elevation: 3,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  error: {
    color: 'red',
    marginBottom: 20,
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
