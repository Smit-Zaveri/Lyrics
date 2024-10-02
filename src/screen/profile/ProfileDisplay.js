import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../../theme/theme';
import { refreshAllData } from '../../config/dataService';

const ProfileDisplay = ({ navigation }) => {
  const [refreshMessage, setRefreshMessage] = useState('');
  const systemTheme = useColorScheme();
  const isDarkMode = systemTheme === 'dark';
  const themeColors = isDarkMode ? colors.dark : colors.light;

  const handleRefresh = async () => {
    await refreshAllData();
    setRefreshMessage('Data has been refreshed successfully!');

    // Clear the message after a few seconds
    setTimeout(() => {
      setRefreshMessage('');
    }, 3000);
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Saved Lyrics Button */}
      <TouchableOpacity onPress={() => navigation.navigate('SavedLyrics')}>
        <View style={styles.item}>
          <Icon name="favorite" color={themeColors.primary} size={25} />
          <Text style={[styles.text, { color: themeColors.text }]}>Saved</Text>
        </View>
      </TouchableOpacity>

      {/* Suggestion Button */}
      <TouchableOpacity onPress={() => navigation.navigate('Suggestion')}>
        <View style={styles.item}>
          <Icon name="info" color={themeColors.primary} size={25} />
          <Text style={[styles.text, { color: themeColors.text }]}>Suggestion</Text>
        </View>
      </TouchableOpacity>

      {/* Refresh Data Button */}
      <TouchableOpacity onPress={handleRefresh}>
        <View style={styles.item}>
          <Icon name="refresh" color={themeColors.primary} size={25} />
          <Text style={[styles.text, { color: themeColors.text }]}>Refresh Data</Text>
        </View>
      </TouchableOpacity>

      {/* Toast Message */}
      {refreshMessage ? (
        <View style={[styles.toast, { backgroundColor: themeColors.surface }]}>
          <Text style={[styles.toastText, { color: themeColors.text }]}>
            {refreshMessage}
          </Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  item: {
    borderBottomColor: 'rgba(0,0,0,0.2)',
    borderBottomWidth: 1,
    padding: 10,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  text: {
    flex: 1,
    fontSize: 18,
    marginLeft: 20,
  },
  toast: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 4,
  },
  toastText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ProfileDisplay;
