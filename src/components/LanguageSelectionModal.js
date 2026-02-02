import React, {useContext} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Image,
} from 'react-native';
import {
  LanguageContext,
  LANGUAGES,
  LANGUAGE_NAMES,
} from '../context/LanguageContext';
import {ThemeContext} from '../../App';

const LanguageSelectionModal = ({visible}) => {
  const {setLanguage} = useContext(LanguageContext);
  const {themeColors} = useContext(ThemeContext);
  const {currentTheme} = useContext(ThemeContext);
  const handleLanguageSelect = language => {
    setLanguage(language);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      statusBarTranslucent={true}>
      <View style={styles.centeredView}>
        <View
          style={[styles.modalView, {backgroundColor: themeColors.surface}]}>
          {currentTheme === 'dark' ? (
            <Image
              source={require('../assets/logo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          ) : (
            <Image
              source={require('../assets/logo_black.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          )}
          <Text style={[styles.title, {color: themeColors.text}]}>
            Choose Your Language
          </Text>
          <Text style={[styles.subtitle, {color: themeColors.text}]}>
            ભાષા પસંદ કરો | भाषा चुनें | Select Language
          </Text>
          <View style={styles.languageButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                {backgroundColor: themeColors.primary},
              ]}
              onPress={() => handleLanguageSelect(LANGUAGES.GUJARATI)}>
              <Text
                style={[
                  styles.languageButtonText,
                  {color: themeColors.onPrimary},
                ]}>
                {LANGUAGE_NAMES[LANGUAGES.GUJARATI]}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.languageButton,
                {backgroundColor: themeColors.primary},
              ]}
              onPress={() => handleLanguageSelect(LANGUAGES.HINDI)}>
              <Text
                style={[
                  styles.languageButtonText,
                  {color: themeColors.onPrimary},
                ]}>
                {LANGUAGE_NAMES[LANGUAGES.HINDI]}
              </Text>
            </TouchableOpacity>
            {/* English option removed from UI, still available for search/fallback */}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '80%',
    margin: 20,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  languageButtonsContainer: {
    width: '100%',
  },
  languageButton: {
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
    width: '100%',
    alignItems: 'center',
  },
  languageButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
});

export default LanguageSelectionModal;
