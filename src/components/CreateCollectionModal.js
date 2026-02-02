import React, {useState} from 'react';
import {
	View,
	Text,
	Modal,
	TouchableOpacity,
	TextInput,
	StyleSheet,
	Animated,
	Pressable,
	Dimensions,
	Platform,
	KeyboardAvoidingView,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {BlurView} from '@react-native-community/blur';

const {width, height} = Dimensions.get('window');

const CreateCollectionModal = ({
	visible,
	themeColors,
	createSlideAnim,
	onClose,
	onChangeText,
	onConfirm,
	value,
	errorMessage,
}) => {
	const [isFocused, setIsFocused] = useState(false);

	const handleFocus = () => setIsFocused(true);
	const handleBlur = () => setIsFocused(false);

	return (
		<Modal
			transparent
			visible={visible}
			animationType="none"
			onRequestClose={onClose}>
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				style={{flex: 1}}>
				<Pressable style={styles.modalOverlay} onPress={onClose}>
					{Platform.OS === 'ios' && (
						<BlurView
							style={StyleSheet.absoluteFill}
							blurType="dark"
							blurAmount={15}
							reducedTransparencyFallbackColor="rgba(0, 0, 0, 0.6)"
						/>
					)}
					<Animated.View
						style={[
							styles.modalContainer,
							{
								backgroundColor: themeColors.surface,
								transform: [
									{
										translateY: createSlideAnim.interpolate({
											inputRange: [0, 1],
											outputRange: [400, 0],
										}),
									},
								],
								opacity: createSlideAnim.interpolate({
									inputRange: [0, 0.3, 1],
									outputRange: [0, 0.7, 1],
								}),
							},
						]}>
						<View
							style={[
								styles.iconContainer,
								{backgroundColor: `${themeColors.primary}15`},
							]}>
							<MaterialCommunityIcons
								name="playlist-plus"
								size={36}
								color={themeColors.primary}
							/>
						</View>
						<Text
							style={[styles.modalTitle, {color: themeColors.text}]}
							accessibilityLabel="Create New Collection"
							accessibilityRole="header">
							Create New Collection
						</Text>
						<Text
							style={[styles.subtitle, {color: themeColors.textSecondary}]}
							accessibilityLabel="Organize your favorite songs">
							Organize your favorite songs
						</Text>

						<View style={styles.inputContainer}>
							<Text
								style={[
									styles.inputLabel,
									{
										color: isFocused
											? themeColors.primary
											: themeColors.textSecondary,
										top: isFocused || value ? -10 : 18,
										fontSize: isFocused || value ? 12 : 16,
										backgroundColor: themeColors.surface,
									},
								]}
								accessibilityLabel="Collection Name">
								Collection Name
							</Text>
							<TextInput
								style={[
									styles.textInput,
									{
										borderColor: errorMessage
											? '#FF5252'
											: isFocused
												? themeColors.primary
												: themeColors.border || '#E0E0E0',
										color: themeColors.text,
										backgroundColor: themeColors.background,
										shadowColor: isFocused
											? themeColors.primary
											: 'transparent',
									},
								]}
								value={value}
								onChangeText={onChangeText}
								placeholder=""
								placeholderTextColor={themeColors.placeholder}
								onFocus={handleFocus}
								onBlur={handleBlur}
								autoFocus={true}
								selectionColor={themeColors.primary}
								accessibilityLabel="Collection name input"
								accessibilityHint="Enter a name for your new collection"
								accessibilityRole="text"
							/>
						</View>

						{errorMessage ? (
							<View
								style={styles.errorContainer}
								accessibilityLabel="Error"
								accessibilityRole="alert">
								<MaterialCommunityIcons
									name="alert-circle-outline"
									size={18}
									color="#FF5252"
									style={styles.errorIcon}
								/>
								<Text
									style={styles.errorText}
									accessibilityLabel={errorMessage}>
									{errorMessage}
								</Text>
							</View>
						) : (
							<View
								style={styles.helperContainer}
								accessibilityLabel="Help information">
								<MaterialCommunityIcons
									name="information-outline"
									size={14}
									color={themeColors.textSecondary}
									style={styles.infoIcon}
								/>
								<Text
									style={[
										styles.helperText,
										{color: themeColors.textSecondary},
									]}
									accessibilityLabel="Name your collection to organize songs">
									Name your collection to organize songs
								</Text>
							</View>
						)}

						<View style={styles.modalButtons}>
							<TouchableOpacity
								style={[
									styles.modalButton,
									styles.cancelButton,
									{
										borderColor: themeColors.border || '#E0E0E0',
										backgroundColor: themeColors.surface,
									},
								]}
								onPress={onClose}
								activeOpacity={0.7}
								accessibilityLabel="Cancel"
								accessibilityHint="Close this dialog without creating a collection"
								accessibilityRole="button">
								<Text style={[styles.buttonText, {color: themeColors.text}]}>
									Cancel
								</Text>
							</TouchableOpacity>
							<TouchableOpacity
								style={[
									styles.modalButton,
									styles.createButton,
									{
										backgroundColor: themeColors.primary,
										shadowColor: themeColors.primary,
									},
								]}
								onPress={onConfirm}
								testID="confirm-create"
								activeOpacity={0.8}
								accessibilityLabel="Create collection"
								accessibilityHint="Create the new collection with the entered name"
								accessibilityRole="button">
								<MaterialCommunityIcons
									name="check"
									size={18}
									color="#FFFFFF"
									style={styles.buttonIcon}
								/>
								<Text style={[styles.buttonText, {color: '#FFFFFF'}]}>
									Create
								</Text>
							</TouchableOpacity>
						</View>
					</Animated.View>
				</Pressable>
			</KeyboardAvoidingView>
		</Modal>
	);
};

const styles = StyleSheet.create({
	modalOverlay: {
		flex: 1,
		backgroundColor:
			Platform.OS === 'ios' ? 'transparent' : 'rgba(0, 0, 0, 0.7)',
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
	},
	modalContainer: {
		width: width * 0.9,
		maxWidth: 360,
		borderRadius: 28,
		paddingTop: 36,
		paddingHorizontal: 28,
		paddingBottom: 32,
		alignItems: 'center'
	},
	iconContainer: {
		width: 76,
		height: 76,
		borderRadius: 38,
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 20,
		...Platform.select({
			ios: {
				shadowColor: '#000',
				shadowOffset: {width: 0, height: 6},
				shadowOpacity: 0.15,
				shadowRadius: 12,
			},
		}),
	},
	modalTitle: {
		fontSize: 22,
		fontWeight: '700',
		marginBottom: 6,
		textAlign: 'center',
		letterSpacing: -0.2,
	},
	subtitle: {
		fontSize: 14,
		fontWeight: '400',
		marginBottom: 24,
		textAlign: 'center',
		opacity: 0.8,
	},
	inputContainer: {
		width: '100%',
		marginBottom: 20,
	},
	inputLabel: {
		position: 'absolute',
		left: 14,
		zIndex: 1,
		paddingHorizontal: 4,
		fontWeight: '500',
		transitionDuration: '200ms',
	},
	textInput: {
		width: '100%',
		borderWidth: 2,
		borderRadius: 16,
		paddingHorizontal: 14,
		paddingVertical: 16,
		fontSize: 15,
		fontWeight: '500',
	},
	errorContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 20,
		paddingHorizontal: 4,
		width: '100%',
	},
	helperContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 24,
		paddingHorizontal: 4,
		width: '100%',
	},
	errorIcon: {
		marginRight: 8,
	},
	infoIcon: {
		marginRight: 8,
	},
	errorText: {
		color: '#FF5252',
		fontSize: 13,
		fontWeight: '500',
		flex: 1,
	},
	helperText: {
		fontSize: 13,
		fontWeight: '400',
		flex: 1,
	},
	modalButtons: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		width: '100%',
		marginTop: 8,
	},
	modalButton: {
		flex: 1,
		paddingVertical: 14,
		borderRadius: 16,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'row',
	},
	cancelButton: {
		marginRight: 12,
		borderWidth: 2,
	},
	createButton: {
		marginLeft: 12,
	},
	buttonText: {
		fontSize: 15,
		fontWeight: '600',
		letterSpacing: 0.2,
	},
	buttonIcon: {
		marginRight: 10,
	},
});

export default CreateCollectionModal;
