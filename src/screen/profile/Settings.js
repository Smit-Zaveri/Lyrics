import React, {useContext, useCallback, useRef, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Animated,
  Easing,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {ThemeContext} from '../../../App';
import {
  LanguageContext,
  LANGUAGES,
  LANGUAGE_NAMES,
} from '../../../src/context/LanguageContext';
import {FontSizeContext} from '../../context/FontSizeContext';
import {useSingerMode} from '../../context/SingerModeContext';

// Animated Option Component with press feedback and selection animation
const AnimatedOption = ({isSelected, onPress, children, themeColors, style}) => {
  const pressScale = useRef(new Animated.Value(1)).current;
  const selectionScale = useRef(new Animated.Value(1)).current;
  const prevSelected = useRef(isSelected);

  useEffect(() => {
    // Trigger selection pop animation when becoming selected
    if (isSelected && !prevSelected.current) {
      Animated.sequence([
        Animated.timing(selectionScale, {
          toValue: 1.08,
          duration: 100,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(selectionScale, {
          toValue: 1,
          bounciness: 10,
          speed: 14,
          useNativeDriver: true,
        }),
      ]).start();
    }
    prevSelected.current = isSelected;
  }, [isSelected, selectionScale]);

  const handlePressIn = () => {
    Animated.timing(pressScale, {
      toValue: 0.96,
      duration: 80,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      bounciness: 8,
      speed: 12,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}>
      <Animated.View
        style={[
          style,
          {
            transform: [{scale: Animated.multiply(pressScale, selectionScale)}],
          },
        ]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

// Animated Toggle Component with spring animation
const AnimatedToggle = ({isOn, onToggle, themeColors}) => {
  const translateX = useRef(new Animated.Value(isOn ? 20 : 2)).current;
  const bgOpacity = useRef(new Animated.Value(isOn ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: isOn ? 20 : 2,
        bounciness: 10,
        speed: 14,
        useNativeDriver: true,
      }),
      Animated.timing(bgOpacity, {
        toValue: isOn ? 1 : 0,
        duration: 150,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }),
    ]).start();
  }, [isOn, translateX, bgOpacity]);

  const backgroundColor = bgOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: ['transparent', themeColors.primary],
  });

  const borderColor = bgOpacity.interpolate({
    inputRange: [0, 1],
    outputRange: ['#444', themeColors.primary],
  });

  return (
    <TouchableOpacity onPress={onToggle} activeOpacity={0.8}>
      <Animated.View
        style={[
          styles.toggleButton,
          {
            backgroundColor,
            borderColor,
          },
        ]}>
        <Animated.View
          style={[
            styles.toggleIndicator,
            {
              backgroundColor: '#fff',
              transform: [{translateX}],
            },
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

const Settings = () => {
  const {fontSize, changeFontSize} = useContext(FontSizeContext);
  const {themePreference, setThemePreference, themeColors} =
    useContext(ThemeContext);
  const {language, setLanguage, languageName} = useContext(LanguageContext);
  const {isSingerMode, toggleSingerMode} = useSingerMode();

  const handleThemeChange = useCallback(
    newTheme => {
      setThemePreference(newTheme);
    },
    [setThemePreference],
  );

  const handleLanguageChange = useCallback(
    langValue => {
      setLanguage(langValue);
    },
    [setLanguage],
  );

  // Memoized option components to avoid unnecessary re-renders
  const ThemeOption = useCallback(
    ({theme, label, icon}) => (
      <AnimatedOption
        isSelected={themePreference === theme}
        onPress={() => handleThemeChange(theme)}
        themeColors={themeColors}
        style={[
          styles.option,
          {
            backgroundColor:
              themePreference === theme ? themeColors.primary : 'transparent',
            borderColor: themeColors.border || '#444',
          },
        ]}>
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color={themePreference === theme ? '#fff' : themeColors.text}
          style={styles.icon}
        />
        <Text
          style={[
            styles.optionText,
            {color: themePreference === theme ? '#fff' : themeColors.text},
          ]}>
          {label}
        </Text>
      </AnimatedOption>
    ),
    [handleThemeChange, themePreference, themeColors],
  );

  const LanguageOption = useCallback(
    ({langValue, label}) => (
      <AnimatedOption
        isSelected={language === langValue}
        onPress={() => handleLanguageChange(langValue)}
        themeColors={themeColors}
        style={[
          styles.option,
          {
            backgroundColor:
              language === langValue ? themeColors.primary : 'transparent',
            borderColor: themeColors.border || '#444',
          },
        ]}>
        <Text
          style={[
            styles.optionText,
            {color: language === langValue ? '#fff' : themeColors.text},
          ]}>
          {label}
        </Text>
      </AnimatedOption>
    ),
    [handleLanguageChange, language, themeColors],
  );

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: themeColors.background}]}>
      <ScrollView>
        {/* Font Size Settings */}
        <View
          style={[
            styles.listItem,
            {borderBottomColor: themeColors.border || '#444'},
          ]}>
          <Text style={[styles.title, {color: themeColors.text}]}>
            Font Size
          </Text>
          <View style={styles.controls}>
            <TouchableOpacity
              onPress={() => changeFontSize(Math.max(12, fontSize - 2))}
              style={styles.button}>
              <MaterialCommunityIcons
                name="minus"
                size={20}
                color={themeColors.primary}
              />
            </TouchableOpacity>
            <Text style={[styles.fontValue, {color: themeColors.text}]}>
              {fontSize}
            </Text>
            <TouchableOpacity
              onPress={() => changeFontSize(Math.min(24, fontSize + 2))}
              style={styles.button}>
              <MaterialCommunityIcons
                name="plus"
                size={20}
                color={themeColors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Language Settings */}
        <View
          style={[
            styles.listItem,
            {borderBottomColor: themeColors.border || '#444'},
          ]}>
          <Text style={[styles.title, {color: themeColors.text}]}>
            Language
          </Text>

          <View style={styles.optionContainer}>
            <LanguageOption
              langValue={LANGUAGES.GUJARATI}
              label={LANGUAGE_NAMES[LANGUAGES.GUJARATI]}
            />
            <LanguageOption
              langValue={LANGUAGES.HINDI}
              label={LANGUAGE_NAMES[LANGUAGES.HINDI]}
            />
          </View>
        </View>

        {/* Theme Settings */}
        <View
          style={[
            styles.listItem,
            {borderBottomColor: themeColors.border || '#444'},
          ]}>
          <Text style={[styles.title, {color: themeColors.text}]}>Theme</Text>
          <View style={styles.optionContainer}>
            <ThemeOption
              theme="light"
              label="Light"
              icon="white-balance-sunny"
            />
            <ThemeOption
              theme="dark"
              label="Dark"
              icon="moon-waning-crescent"
            />
            <ThemeOption
              theme="system"
              label="System"
              icon="theme-light-dark"
            />
          </View>
        </View>

        {/* Singer Mode Settings */}
        <View
          style={[
            styles.listItem,
            {borderBottomColor: themeColors.border || '#444'},
          ]}>
          <Text style={[styles.title, {color: themeColors.text}]}>
            Singer Mode
          </Text>
          <View style={styles.optionContainer}>
            <AnimatedToggle
              isOn={isSingerMode}
              onToggle={toggleSingerMode}
              themeColors={themeColors}
            />
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
