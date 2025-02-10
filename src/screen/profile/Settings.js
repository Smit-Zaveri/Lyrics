import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme/Theme';

const Settings = () => {
  const [fontSize, setFontSize] = useState(18);
  const systemTheme = useColorScheme();
  const themeColors = systemTheme === 'dark' ? colors.dark : colors.light;

  useEffect(() => {
    loadFontSize();
  }, []);

  const loadFontSize = async () => {
    try {
      const savedFontSize = await AsyncStorage.getItem('fontSize');
      if (savedFontSize) {
        setFontSize(parseInt(savedFontSize, 10));
      }
    } catch (error) {
      console.error('Error loading font size:', error);
    }
  };

  const handleFontSizeChange = async (newSize) => {
    try {
      await AsyncStorage.setItem('fontSize', newSize.toString());
      setFontSize(newSize);
    } catch (error) {
      console.error('Error saving font size:', error);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={[styles.listItem, { borderBottomColor: themeColors.border }]}>
        <Text style={[styles.title, { color: themeColors.text }]}>Font Size</Text>
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={() => handleFontSizeChange(Math.max(12, fontSize - 2))}
            style={styles.button}
          >
            <MaterialCommunityIcons name="minus" size={20} color={themeColors.primary} />
          </TouchableOpacity>
          <Text style={[styles.fontValue, { color: themeColors.text }]}>{fontSize}</Text>
          <TouchableOpacity
            onPress={() => handleFontSizeChange(Math.min(24, fontSize + 2))}
            style={styles.button}
          >
            <MaterialCommunityIcons name="plus" size={20} color={themeColors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 16,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  button: {
    padding: 6,
  },
  fontValue: {
    marginHorizontal: 10,
    fontSize: 16,
  },
});

export default Settings;
