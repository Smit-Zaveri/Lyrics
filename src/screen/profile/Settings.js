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
	if (isSelected && !prevSelected.current) {
	  Animated.sequence([
		Animated.timing(selectionScale, {
		  toValue: 1.05,
		  duration: 100,
		  easing: Easing.out(Easing.quad),
		  useNativeDriver: true,
		}),
		Animated.spring(selectionScale, {
		  toValue: 1,
		  bounciness: 12,
		  speed: 14,
		  useNativeDriver: true,
		}),
	  ]).start();
	}
	prevSelected.current = isSelected;
  }, [isSelected, selectionScale]);

  const handlePressIn = () => {
	Animated.timing(pressScale, {
	  toValue: 0.95,
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

// Modern Section Component
const Section = ({title, children, themeColors}) => (
  <View style={styles.section}>
	<Text style={[styles.sectionTitle, {color: themeColors.primary}]}>
	  {title}
	</Text>
	<View
	  style={[
		styles.sectionCard,
		{
		  backgroundColor: themeColors.surface,
		  borderColor: themeColors.border || 'rgba(0,0,0,0.05)',
		},
	  ]}>
	  {children}
	</View>
  </View>
);

// Modern Setting Row Component
const SettingRow = ({label, description, children, themeColors, isLast, horizontal}) => (
  <View>
	<View style={[styles.settingRow, horizontal && styles.settingRowHorizontal]}>
	  <View style={styles.settingInfo}>
		<Text style={[styles.settingLabel, {color: themeColors.text}]}>
		  {label}
		</Text>
		{description && (
		  <Text
			style={[
			  styles.settingDescription,
			  {color: themeColors.textSecondary},
			]}>
			{description}
		  </Text>
		)}
	  </View>
	  <View style={[styles.settingControl, horizontal && styles.settingControlHorizontal]}>
		{children}
	  </View>
	</View>
	{!isLast && (
	  <View
		style={[
		  styles.divider,
		  {backgroundColor: themeColors.border || 'rgba(0,0,0,0.1)'},
		]}
	  />
	)}
  </View>
);

// Animated Toggle Component with spring animation
const AnimatedToggle = ({isOn, onToggle, themeColors}) => {
  const translateX = useRef(new Animated.Value(isOn ? 18 : 2)).current;
  const bgOpacity = useRef(new Animated.Value(isOn ? 1 : 0)).current;

  useEffect(() => {
	Animated.parallel([
	  Animated.spring(translateX, {
		toValue: isOn ? 18 : 2,
		bounciness: 12,
		speed: 16,
		useNativeDriver: true,
	  }),
	  Animated.timing(bgOpacity, {
		toValue: isOn ? 1 : 0,
		duration: 200,
		easing: Easing.out(Easing.quad),
		useNativeDriver: false,
	  }),
	]).start();
  }, [isOn, translateX, bgOpacity]);

  const backgroundColor = bgOpacity.interpolate({
	inputRange: [0, 1],
	outputRange: [themeColors.cardBackground, themeColors.primary],
  });

  const borderColor = bgOpacity.interpolate({
	inputRange: [0, 1],
	outputRange: [themeColors.textSecondary, themeColors.primary],
  });

  return (
	<TouchableOpacity onPress={onToggle} activeOpacity={0.9}>
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
			  shadowColor: '#000',
			  shadowOffset: {width: 0, height: 1},
			  shadowOpacity: 0.2,
			  shadowRadius: 1.5,
			  elevation: 2,
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
  const {language, setLanguage} = useContext(LanguageContext);
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

  // Memoized option components
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
			borderColor:
			  themePreference === theme
				? themeColors.primary
				: themeColors.border || 'rgba(0,0,0,0.1)',
		  },
		]}>
		<MaterialCommunityIcons
		  name={icon}
		  size={18}
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
			borderColor:
			  language === langValue
				? themeColors.primary
				: themeColors.border || 'rgba(0,0,0,0.1)',
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
	

	  <ScrollView
		showsVerticalScrollIndicator={false}
		contentContainerStyle={styles.scrollContent}>
		{/* Appearance Section */}
		<Section title="Appearance" themeColors={themeColors}>
		  <SettingRow
			label="Theme"
			description="Customize how the app looks"
			themeColors={themeColors}>
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
				theme="highContrast"
				label="High Contrast"
				icon="contrast-circle"
			  />
			  <ThemeOption
				theme="system"
				label="System"
				icon="theme-light-dark"
			  />
			</View>
		  </SettingRow>

		  <SettingRow
			label="Font Size"
			description="Adjust the lyrics reading size"
			themeColors={themeColors}
			isLast={true}>
			<View style={styles.controls}>
			  <TouchableOpacity
				onPress={() => changeFontSize(Math.max(12, fontSize - 2))}
				style={[
				  styles.button,
				  {backgroundColor: themeColors.cardBackground},
				]}>
				<MaterialCommunityIcons
				  name="minus"
				  size={18}
				  color={themeColors.primary}
				/>
			  </TouchableOpacity>
			  <Text style={[styles.fontValue, {color: themeColors.text}]}>
				{fontSize}
			  </Text>
			  <TouchableOpacity
				onPress={() => changeFontSize(Math.min(24, fontSize + 2))}
				style={[
				  styles.button,
				  {backgroundColor: themeColors.cardBackground},
				]}>
				<MaterialCommunityIcons
				  name="plus"
				  size={18}
				  color={themeColors.primary}
				/>
			  </TouchableOpacity>
			</View>
		  </SettingRow>
		</Section>

		{/* Localization Section */}
		<Section title="Localization" themeColors={themeColors}>
		  <SettingRow
			label="Language"
			description="Choose your preferred language"
			themeColors={themeColors}
			isLast={true}>
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
		  </SettingRow>
		</Section>

		{/* Advanced Section */}
		<Section title="Advanced" themeColors={themeColors}>
		  <SettingRow
			label="Singer Mode"
			description="Optimized layout for singers"
			themeColors={themeColors}
			isLast={true}
			horizontal={true}>
			<AnimatedToggle
			  isOn={isSingerMode}
			  onToggle={toggleSingerMode}
			  themeColors={themeColors}
			/>
		  </SettingRow>
		</Section>
	  </ScrollView>
	</SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
	flex: 1,
  },
  header: {
	paddingHorizontal: 20,
	paddingTop: 20,
	paddingBottom: 10,
  },
  headerTitle: {
	fontSize: 32,
	fontWeight: '800',
	letterSpacing: -0.5,
  },
  scrollContent: {
	paddingBottom: 40,
  },
  section: {
	marginTop: 24,
	paddingHorizontal: 16,
  },
  sectionTitle: {
	fontSize: 13,
	fontWeight: '700',
	marginBottom: 10,
	marginLeft: 4,
	textTransform: 'uppercase',
	letterSpacing: 1.2,
	opacity: 0.8,
  },
  sectionCard: {
	borderRadius: 16,
	borderWidth: 1,
	overflow: 'hidden',
  },
  settingRow: {
	paddingVertical: 16,
	paddingHorizontal: 16,
  },
  settingRowHorizontal: {
	flexDirection: 'row',
	alignItems: 'center',
	justifyContent: 'space-between',
  },
  settingInfo: {
	flex: 1,
  },
  settingLabel: {
	fontSize: 17,
	fontWeight: '600',
	letterSpacing: -0.2,
  },
  settingDescription: {
	fontSize: 14,
	marginTop: 4,
	opacity: 0.7,
	lineHeight: 18,
	paddingRight: 10,
  },
  settingControl: {
	marginTop: 12,
  },
  settingControlHorizontal: {
	marginTop: 0,
	marginLeft: 10,
  },
  divider: {
	height: 1,
	marginHorizontal: 16,
  },
  controls: {
	flexDirection: 'row',
	alignItems: 'center',
	gap: 15,
  },
  button: {
	width: 36,
	height: 36,
	borderRadius: 10,
	justifyContent: 'center',
	alignItems: 'center',
  },
  fontValue: {
	fontSize: 18,
	fontWeight: '700',
	minWidth: 24,
	textAlign: 'center',
  },
  optionContainer: {
	flexDirection: 'row',
	flexWrap: 'wrap',
	gap: 10,
  },
  option: {
	flexDirection: 'row',
	alignItems: 'center',
	paddingVertical: 8,
	paddingHorizontal: 14,
	borderRadius: 12,
	borderWidth: 1.5,
  },
  optionText: {
	fontSize: 14,
	fontWeight: '600',
  },
  icon: {
	marginRight: 6,
  },
  toggleButton: {
	width: 44,
	height: 26,
	borderRadius: 13,
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
