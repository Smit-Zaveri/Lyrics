import React, { useContext, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Animated } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ThemeContext } from '../../../App';
import { LanguageContext, LANGUAGES, LANGUAGE_NAMES } from '../../../src/context/LanguageContext';
import { FontSizeContext } from '../../context/FontSizeContext';
import { useSingerMode } from '../../context/SingerModeContext';

const Settings = () => {
  const { fontSize, changeFontSize } = useContext(FontSizeContext);
  const { themePreference, setThemePreference, themeColors } = useContext(ThemeContext);
  const { language, setLanguage, languageName } = useContext(LanguageContext);
  const { isSingerMode, toggleSingerMode } = useSingerMode();

  const handleThemeChange = useCallback((newTheme) => {
    setThemePreference(newTheme);
  }, [setThemePreference]);

  const handleLanguageChange = useCallback((langValue) => {
    setLanguage(langValue);
  }, [setLanguage]);

  // Memoized option components to avoid unnecessary re-renders
  const ThemeOption = useCallback(({ theme, label, icon }) => (
    <TouchableOpacity
      onPress={() => handleThemeChange(theme)}
      style={[
        styles.option,
        {
          backgroundColor: themePreference === theme ? themeColors.primary : 'transparent',
          borderColor: themeColors.border || '#444',
        },
      ]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={20}
        color={themePreference === theme ? '#fff' : themeColors.text}
        style={styles.icon}
      />
      <Text style={[styles.optionText, { color: themePreference === theme ? '#fff' : themeColors.text }]}>
        {label}
      </Text>
    </TouchableOpacity>
  ), [handleThemeChange, themePreference, themeColors]);

  const LanguageOption = useCallback(({ langValue, label }) => (
    <TouchableOpacity
      onPress={() => handleLanguageChange(langValue)}
      style={[
        styles.option,
        {
          backgroundColor: language === langValue ? themeColors.primary : 'transparent',
          borderColor: themeColors.border || '#444',
        },
      ]}
    >
      <Text style={[styles.optionText, { color: language === langValue ? '#fff' : themeColors.text }]}>
        {label}
      </Text>
    </TouchableOpacity>
  ), [handleLanguageChange, language, themeColors]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView>
        {/* Font Size Settings */}
        <View style={[styles.listItem, { borderBottomColor: themeColors.border || '#444' }]}>
          <Text style={[styles.title, { color: themeColors.text }]}>Font Size</Text>
          <View style={styles.controls}>
            <TouchableOpacity
              onPress={() => changeFontSize(Math.max(12, fontSize - 2))}
              style={styles.button}
            >
              <MaterialCommunityIcons name="minus" size={20} color={themeColors.primary} />
            </TouchableOpacity>
            <Text style={[styles.fontValue, { color: themeColors.text }]}>{fontSize}</Text>
            <TouchableOpacity
              onPress={() => changeFontSize(Math.min(24, fontSize + 2))}
              style={styles.button}
            >
              <MaterialCommunityIcons name="plus" size={20} color={themeColors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Language Settings */}
        <View style={[styles.listItem, { borderBottomColor: themeColors.border || '#444' }]}>
          <Text style={[styles.title, { color: themeColors.text }]}>Language (ભાષા / भाषा)</Text>
          <Text style={[styles.subtitle, { color: themeColors.text }]}>
            Current: {languageName}
          </Text>
          <View style={styles.optionContainer}>
            <LanguageOption langValue={LANGUAGES.GUJARATI} label={LANGUAGE_NAMES[LANGUAGES.GUJARATI]} />
            <LanguageOption langValue={LANGUAGES.HINDI} label={LANGUAGE_NAMES[LANGUAGES.HINDI]} />
            <LanguageOption langValue={LANGUAGES.ENGLISH} label={LANGUAGE_NAMES[LANGUAGES.ENGLISH]} />
          </View>
        </View>

        {/* Theme Settings */}
        <View style={[styles.listItem, { borderBottomColor: themeColors.border || '#444' }]}>
          <Text style={[styles.title, { color: themeColors.text }]}>Theme</Text>
          <View style={styles.optionContainer}>
            <ThemeOption theme="light" label="Light" icon="white-balance-sunny" />
            <ThemeOption theme="dark" label="Dark" icon="moon-waning-crescent" />
            <ThemeOption theme="system" label="System" icon="theme-light-dark" />
          </View>
        </View>

        {/* Singer Mode Settings */}
        <View style={[styles.listItem, { borderBottomColor: themeColors.border || '#444' }]}>
          <Text style={[styles.title, { color: themeColors.text }]}>Singer Mode</Text>
          <View style={styles.optionContainer}>
            <TouchableOpacity
              onPress={toggleSingerMode}
              style={[
                styles.toggleButton,
                {
                  backgroundColor: isSingerMode ? themeColors.primary : 'transparent',
                  borderColor: isSingerMode ? themeColors.primary : '#444',
                },
              ]}>
              <Animated.View
                style={[
                  styles.toggleIndicator,
                  {
                    backgroundColor: isSingerMode ? '#fff' : '#fff',
                    transform: [{ translateX: isSingerMode ? 20 : 2 }],
                  },
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  button: {
    padding: 6,
  },
  fontValue: {
    marginHorizontal: 10,
    fontSize: 16,
  },
  optionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  icon: {
    marginRight: 6,
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleButton: {
    width: 46,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
  },
  toggleIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});

export default Settings;
