import React, {useContext, useEffect, useState} from 'react';
import {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ScrollView,
	Image,
	Animated,
	Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {ThemeContext} from '../../../App';
import {LanguageContext} from '../../context/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {verifyAddedSongsCollection} from '../../config/dataService';

const SingerMode = () => {
	const navigation = useNavigation();
	const {themeColors} = useContext(ThemeContext);
	const {getString} = useContext(LanguageContext);
	const [scaleAnim1] = useState(new Animated.Value(1));
	const [scaleAnim2] = useState(new Animated.Value(1));
	const [fadeAnim] = useState(new Animated.Value(0));
	const windowWidth = Dimensions.get('window').width;

	useEffect(() => {
		navigation.setOptions({
			// headerShown: false,
			title: getString('singerMode'),
			headerStyle: {
				backgroundColor: themeColors.primary,
			},
			headerTintColor: "#fff",
			headerTitleStyle: {
				fontWeight: 'bold',
			},
		});

		// Fade in animation
		Animated.timing(fadeAnim, {
			toValue: 1,
			duration: 600,
			useNativeDriver: true,
		}).start();
	}, [navigation, themeColors, getString, fadeAnim]);

	const animatePress = (scaleAnim, pressed) => {
		Animated.spring(scaleAnim, {
			toValue: pressed ? 0.95 : 1,
			friction: 5,
			tension: 40,
			useNativeDriver: true,
		}).start();
	};

	const handleAddSong = () => {
		navigation.navigate('AddSong');
	};

	const handleViewSongs = async () => {
		try {
			const result = await verifyAddedSongsCollection();

			if (result.updated) {
				console.log('Added-songs collection was updated or created');
			}

			navigation.navigate('List', {
				collectionName: 'added-songs',
				Tags: 'tags',
				title: 'Added Songs',
			});
		} catch (error) {
			console.error('Error preparing added-songs view:', error);
			navigation.navigate('List', {
				collectionName: 'added-songs',
				Tags: 'tags',
				title: 'Added Songs',
			});
		}
	};

	return (
		<Animated.View style={{flex: 1, opacity: fadeAnim}}>
			<ScrollView
				style={[styles.container, {backgroundColor: themeColors.background}]}
				contentContainerStyle={styles.contentContainer}
				showsVerticalScrollIndicator={false}>
			<View
				style={[
					styles.headerWrapper,
					{backgroundColor: themeColors.primary + '10'},
				]}>
				<View style={styles.headerContainer}>
					<View
						style={[
							styles.iconCircle,
							{
								backgroundColor: themeColors.primary + '18',
								borderWidth: 2,
								borderColor: themeColors.primary + '30',
							},
						]}>
						<Icon name="music-note" size={42} color={themeColors.primary} />
					</View>
					<Text style={[styles.headerText, {color: themeColors.text}]}>
						{getString('singerMode') || 'Singer Mode'}
					</Text>
					<Text
						style={[styles.subHeaderText, {color: themeColors.textSecondary}]}>
						{getString('singerModeDesc') || 'Add and manage your own songs'}
					</Text>
				</View>
			</View>

			<View style={styles.cardsContainer}>
				<TouchableOpacity
					activeOpacity={0.9}
					onPressIn={() => animatePress(scaleAnim1, true)}
					onPressOut={() => animatePress(scaleAnim1, false)}
					onPress={handleAddSong}>
					<Animated.View
						style={[
							styles.card,
							{
								backgroundColor: themeColors.surface,
								borderColor: themeColors.primary + '12',
								borderWidth: 1,
								shadowColor: themeColors.primary,
								transform: [{scale: scaleAnim1}],
							},
						]}>
						<View
							style={[
								styles.cardHighlight,
								{backgroundColor: themeColors.primary},
							]}
						/>
						<View style={styles.cardContent}>
							<View
								style={[
									styles.cardIconContainer,
									{
										backgroundColor: themeColors.primary + '15',
										borderWidth: 1.5,
										borderColor: themeColors.primary + '25',
									},
								]}>
								<Icon name="add-circle" size={30} color={themeColors.primary} />
							</View>
							<View style={styles.cardTextContainer}>
								<Text style={[styles.cardTitle, {color: themeColors.text}]}>
									{getString('addNewSong') || 'Add New Song'}
								</Text>
								<Text
									style={[
										styles.cardDescription,
										{color: themeColors.textSecondary},
									]}>
									{getString('addNewSongDesc') ||
										'Create a new song with lyrics, tags, and media'}
								</Text>
							</View>
							<View style={styles.chevronContainer}>
								<Icon
									name="chevron-right"
									size={20}
									color={themeColors.primary}
								/>
							</View>
						</View>
					</Animated.View>
				</TouchableOpacity>

				<TouchableOpacity
					activeOpacity={0.9}
					onPressIn={() => animatePress(scaleAnim2, true)}
					onPressOut={() => animatePress(scaleAnim2, false)}
					onPress={handleViewSongs}>
					<Animated.View
						style={[
							styles.card,
							{
								backgroundColor: themeColors.surface,
								borderColor: themeColors.primary + '12',
								borderWidth: 1,
								shadowColor: themeColors.primary,
								transform: [{scale: scaleAnim2}],
							},
						]}>
						<View
							style={[
								styles.cardHighlight,
								{backgroundColor: themeColors.primary},
							]}
						/>
						<View style={styles.cardContent}>
							<View
								style={[
									styles.cardIconContainer,
									{
										backgroundColor: themeColors.primary + '15',
										borderWidth: 1.5,
										borderColor: themeColors.primary + '25',
									},
								]}>
								<Icon
									name="library-music"
									size={30}
									color={themeColors.primary}
								/>
							</View>
							<View style={styles.cardTextContainer}>
								<Text style={[styles.cardTitle, {color: themeColors.text}]}>
									{getString('myAddedSongs') || 'My Added Songs'}
								</Text>
								<Text
									style={[
										styles.cardDescription,
										{color: themeColors.textSecondary},
									]}>
									{getString('myAddedSongsDesc') ||
										'View and edit your custom songs collection'}
								</Text>
							</View>
							<View style={styles.chevronContainer}>
								<Icon
									name="chevron-right"
									size={20}
									color={themeColors.primary}
								/>
							</View>
						</View>
					</Animated.View>
				</TouchableOpacity>
			</View>

			<View style={styles.infoContainer}>
				<View
					style={[
						styles.infoBox,
						{
							backgroundColor: themeColors.primary + '06',
							borderColor: themeColors.primary + '18',
						},
					]}>
					<View
						style={[
							styles.infoIconContainer,
							{
								backgroundColor: themeColors.primary + '12',
								borderWidth: 1,
								borderColor: themeColors.primary + '20',
							},
						]}>
						<Icon name="info-outline" size={18} color={themeColors.primary} />
					</View>
					<Text style={[styles.infoText, {color: themeColors.textSecondary}]}>
						{getString('singerModeInfoText') ||
							'Songs you add will appear in both the "lyrics" collection and a special "Added Songs" collection.'}
					</Text>
				</View>
			</View>
			</ScrollView>
		</Animated.View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	contentContainer: {
		paddingBottom: 30,
	},
	headerWrapper: {
		paddingVertical: 30,
		paddingHorizontal: 20,
		borderBottomLeftRadius: 25,
		borderBottomRightRadius: 25,
		marginBottom: 10,
	},
	headerContainer: {
		alignItems: 'center',
		marginVertical: 15,
	},
	iconCircle: {
		width: 80,
		height: 80,
		borderRadius: 40,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 15,
		shadowColor: '#000',
		shadowOffset: {width: 0, height: 3},
		shadowOpacity: 0.15,
		shadowRadius: 8,
	},
	headerText: {
		fontSize: 28,
		fontWeight: '800',
		marginTop: 8,
		textAlign: 'center',
		letterSpacing: 0.5,
	},
	subHeaderText: {
		fontSize: 15,
		marginTop: 8,
		textAlign: 'center',
		opacity: 0.75,
		fontWeight: '500',
		lineHeight: 20,
	},
	cardsContainer: {
		marginVertical: 20,
		paddingHorizontal: 20,
	},
	card: {
		borderRadius: 16,
		marginBottom: 16,
		overflow: 'hidden',
		position: 'relative',
		shadowColor: '#000',
		shadowOffset: {width: 0, height: 2},
		shadowOpacity: 0.12,
		shadowRadius: 8,
	},
	cardHighlight: {
		position: 'absolute',
		left: 0,
		top: 0,
		width: 4,
		height: '100%',
		borderTopRightRadius: 4,
		borderBottomRightRadius: 4,
	},
	cardContent: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 16,
		paddingLeft: 20,
	},
	cardIconContainer: {
		width: 50,
		height: 50,
		borderRadius: 25,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 16,
	},
	cardTextContainer: {
		flex: 1,
	},
	cardTitle: {
		fontSize: 17,
		fontWeight: '700',
		marginBottom: 4,
		letterSpacing: 0.3,
	},
	cardDescription: {
		fontSize: 13,
		opacity: 0.7,
		lineHeight: 18,
		fontWeight: '400',
	},
	chevronContainer: {
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: 8,
		backgroundColor: 'rgba(0,0,0,0.05)',
	},
	infoContainer: {
		marginVertical: 10,
		paddingHorizontal: 20,
	},
	infoBox: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 14,
		borderRadius: 12,
		borderWidth: 1,
		borderStyle: 'solid',
		shadowColor: '#000',
		shadowOffset: {width: 0, height: 1},
		shadowOpacity: 0.08,
		shadowRadius: 4,
	},
	infoIconContainer: {
		width: 32,
		height: 32,
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 12,
	},
	infoText: {
		flex: 1,
		fontSize: 13,
		lineHeight: 18,
		opacity: 0.8,
		fontWeight: '400',
	},
});

export default SingerMode;
