import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../../App';

const Settings = () => {
  const [fontSize, setFontSize] = useState(18);
  const { themePreference, setThemePreference, themeColors } = useContext(ThemeContext);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedFontSize = await AsyncStorage.getItem('fontSize');
      if (savedFontSize) {
        setFontSize(parseInt(savedFontSize, 10));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
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

  const handleThemeChange = (newTheme) => {
    setThemePreference(newTheme);
  };

  const ThemeOption = ({ theme, label, icon }) => (
    <TouchableOpacity
      onPress={() => handleThemeChange(theme)}
      style={[
        styles.themeOption,
        {
          backgroundColor: themePreference === theme ? themeColors.primary : 'transparent',
          borderColor: themeColors.border,
        },
      ]}>
      <MaterialCommunityIcons 
        name={icon} 
        size={20} 
        color={themePreference === theme ? '#fff' : themeColors.text}
        style={styles.themeIcon} 
      />
      <Text
        style={[
          styles.themeText,
          {
            color: themePreference === theme ? '#fff' : themeColors.text,
          },
        ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Font Size Settings */}
      <View style={[styles.listItem, { borderBottomColor: themeColors.border }]}>
        <Text style={[styles.title, { color: themeColors.text }]}>Font Size</Text>
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={() => handleFontSizeChange(Math.max(12, fontSize - 2))}
            style={styles.button}>
            <MaterialCommunityIcons name="minus" size={20} color={themeColors.primary} />
          </TouchableOpacity>
          <Text style={[styles.fontValue, { color: themeColors.text }]}>{fontSize}</Text>
          <TouchableOpacity
            onPress={() => handleFontSizeChange(Math.min(24, fontSize + 2))}
            style={styles.button}>
            <MaterialCommunityIcons name="plus" size={20} color={themeColors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Theme Settings */}
      <View style={[styles.listItem, { borderBottomColor: themeColors.border }]}>
        <Text style={[styles.title, { color: themeColors.text }]}>Theme</Text>
        <View style={styles.themeControls}>
          <ThemeOption theme="light" label="Light" icon="white-balance-sunny" />
          <ThemeOption theme="dark" label="Dark" icon="moon-waning-crescent" />
          <ThemeOption theme="system" label="System" icon="theme-light-dark" />
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
    flexDirection: 'column',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
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
  themeControls: {
    flexDirection: 'row',
    gap: 10,
  },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  themeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  themeIcon: {
    marginRight: 6,
  },
});

export default Settings;
