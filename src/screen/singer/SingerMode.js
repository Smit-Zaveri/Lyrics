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
	const [scaleAnim] = useState(new Animated.Value(1));
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
	}, [navigation, themeColors, getString]);

	const animatePress = pressed => {
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
					onPressIn={() => animatePress(true)}
					onPressOut={() => animatePress(false)}
					onPress={handleAddSong}>
					<Animated.View
						style={[
							styles.card,
							{
								backgroundColor: themeColors.surface,
								borderColor: themeColors.primary + '12',
								borderWidth: 1,
								shadowColor: themeColors.primary,
								transform: [{scale: scaleAnim}],
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
					onPressIn={() => animatePress(true)}
					onPressOut={() => animatePress(false)}
					onPress={handleViewSongs}>
					<Animated.View
						style={[
							styles.card,
							{
								backgroundColor: themeColors.surface,
								borderColor: themeColors.primary + '12',
								borderWidth: 1,
								shadowColor: themeColors.primary,
								transform: [{scale: scaleAnim}],
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
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	contentContainer: {
		paddingBottom: 20,
	},
	headerWrapper: {
		paddingVertical: 20,
		paddingHorizontal: 16,
		borderBottomLeftRadius: 20,
		borderBottomRightRadius: 20,
	},
	headerContainer: {
		alignItems: 'center',
		marginVertical: 10,
	},
	iconCircle: {
		width: 68,
		height: 68,
		borderRadius: 34,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 10,
		elevation: 4,
		shadowColor: '#000',
		shadowOffset: {width: 0, height: 2},
		shadowOpacity: 0.12,
		shadowRadius: 6,
	},
	headerText: {
		fontSize: 24,
		fontWeight: '700',
		marginTop: 4,
		textAlign: 'center',
		letterSpacing: 0.5,
	},
	subHeaderText: {
		fontSize: 13,
		marginTop: 5,
		textAlign: 'center',
		opacity: 0.72,
		fontWeight: '400',
	},
	cardsContainer: {
		marginVertical: 12,
		paddingHorizontal: 16,
	},
	card: {
		borderRadius: 12,
		marginBottom: 12,
		overflow: 'hidden',
		position: 'relative',
		elevation: 3,
		shadowColor: '#000',
		shadowOffset: {width: 0, height: 1},
		shadowOpacity: 0.1,
		shadowRadius: 6,
	},
	cardHighlight: {
		position: 'absolute',
		left: 0,
		top: 0,
		width: 3,
		height: '100%',
	},
	cardContent: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 13,
		paddingLeft: 15,
	},
	cardIconContainer: {
		width: 46,
		height: 46,
		borderRadius: 23,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 13,
	},
	cardTextContainer: {
		flex: 1,
	},
	cardTitle: {
		fontSize: 15,
		fontWeight: '700',
		marginBottom: 3,
		letterSpacing: 0.3,
	},
	cardDescription: {
		fontSize: 12,
		opacity: 0.68,
		lineHeight: 17,
		fontWeight: '400',
	},
	chevronContainer: {
		width: 28,
		height: 28,
		borderRadius: 14,
		justifyContent: 'center',
		alignItems: 'center',
		marginLeft: 6,
	},
	infoContainer: {
		marginVertical: 6,
		paddingHorizontal: 16,
	},
	infoBox: {
		flexDirection: 'row',
		alignItems: 'center',
		padding: 11,
		borderRadius: 10,
		borderWidth: 1,
		borderStyle: 'solid',
	},
	infoIconContainer: {
		width: 30,
		height: 30,
		borderRadius: 15,
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 11,
	},
	infoText: {
		flex: 1,
		fontSize: 12,
		lineHeight: 17,
		opacity: 0.78,
		fontWeight: '400',
	},
});

export default SingerMode;
