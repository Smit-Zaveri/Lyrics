import React, { useState } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Controller, useForm } from 'react-hook-form';
import { Button, TextInput } from 'react-native';
import DateTimePicker from 'react-native-ui-datepicker';
import dayjs from 'dayjs';

const Suggestion = () => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      artistName: '',
      content: '',
      publishDate: '',
    },
  });

  const onSubmit = (data) => {
    console.log("Form Data:", data);
    console.log("Selected Date:", date.format('YYYY-MM-DD'));
  };

  const [date, setDate] = useState(dayjs());
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Title"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="title"
        />
        {errors.title && <Text style={styles.error}>Title is required.</Text>}

        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              placeholder="Artist name"
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="artistName"
        />
        {errors.artistName && <Text style={styles.error}>Artist name is required.</Text>}

        <Controller
          control={control}
          rules={{
            required: true,
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.textArea}
              placeholder="Content"
              multiline
              numberOfLines={4}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
            />
          )}
          name="content"
        />
        {errors.content && <Text style={styles.error}>Content is required.</Text>}

        <Text style={styles.label}>Publish Date:</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => {
            setShowDatePicker(true);
          }}
        >
          <Text style={styles.dateButtonText}>{date.format('MMMM D, YYYY')}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            mode="single"
            date={date.toDate()}
            onChange={(params) => {
              setDate(dayjs(params.date));
              setShowDatePicker(false);
            }}
          />
        )}

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit(onSubmit)}>
          <Text style={styles.submitButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  container: {
    flex: 1,
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
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
    color: '#333',
  },
  error: {
    color: 'red',
    marginBottom: 20,
  },
  dateButton: {
    backgroundColor: '#007bff',
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
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 5,
  },
  submitButtonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
  },
});

export default Suggestion;
