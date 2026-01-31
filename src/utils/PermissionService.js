import {
  Platform,
  PermissionsAndroid,
  Alert,
  Linking,
  ToastAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const PERMISSION_GRANTED_KEY = '@permissions_granted';
const PERMISSION_ASKED_RECENTLY = '@permissions_asked_recently';
const CAMERA_PERMISSION_GRANTED_KEY = '@camera_permissions_granted';

/**
 * Utility service for handling app permissions
 */
class PermissionService {
  /**
   * Request storage permissions with proper handling for different Android versions
   * @returns {Promise<boolean>} Whether all permissions are granted
   */
  static async requestStoragePermissions() {
	try {
	  if (Platform.OS !== 'android') {
		// iOS doesn't need explicit permission for document picker
		return true;
	  }

	  // Force check current permission status directly from the system
	  const currentPermissionStatus = await this.checkCurrentPermissionStatus();
	  if (currentPermissionStatus) {
		// If permissions are actually granted now, update our store and return true
		await AsyncStorage.setItem(PERMISSION_GRANTED_KEY, 'true');
		return true;
	  }

	  // Get required permissions based on Android version
	  const permissions = this.getRequiredPermissions();

	  // Request the permissions directly - no need to check "asked recently" if the user is trying to use a feature
	  const results = await PermissionsAndroid.requestMultiple(permissions);

	  // Debug output to help understand what's happening
	  console.log('Permission request results:', JSON.stringify(results));

	  // Now check if all permissions are granted
	  const hasAllPermissions = Object.values(results).every(
		status => status === PermissionsAndroid.RESULTS.GRANTED,
	  );

	  if (hasAllPermissions) {
		// Mark permissions as granted in storage
		await AsyncStorage.setItem(PERMISSION_GRANTED_KEY, 'true');
		return true;
	  }

	  // Check if any permission was denied with "Don't Ask Again"
	  const permanentlyDenied = Object.values(results).some(
		status => status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN,
	  );

	  if (permanentlyDenied) {
		return this.showSettingsPrompt();
	  }

	  return false;
	} catch (err) {
	  console.error('Error checking permissions:', err);
	  return false;
	}
  }

  /**
   * Request camera permissions
   * @returns {Promise<boolean>} Whether camera permission is granted
   */
  static async requestCameraPermissions() {
	try {
	  if (Platform.OS !== 'android') {
		// iOS camera permissions are handled by the image picker
		return true;
	  }

	  // First check if camera permission is already granted
	  const currentPermissionStatus = await this.checkCameraPermissionStatus();
	  if (currentPermissionStatus) {
		await AsyncStorage.setItem(CAMERA_PERMISSION_GRANTED_KEY, 'true');
		return true;
	  }

	  // Request camera permission
	  const result = await PermissionsAndroid.request(
		PermissionsAndroid.PERMISSIONS.CAMERA,
		{
		  title: 'Camera Permission',
		  message: 'This app needs access to your camera to take photos.',
		  buttonNeutral: 'Ask Me Later',
		  buttonNegative: 'Cancel',
		  buttonPositive: 'OK',
		},
	  );

	  console.log('Camera permission result:', result);

	  if (result === PermissionsAndroid.RESULTS.GRANTED) {
		await AsyncStorage.setItem(CAMERA_PERMISSION_GRANTED_KEY, 'true');
		return true;
	  }

	  // If permission was denied with "Don't Ask Again"
	  if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
		return this.showCameraSettingsPrompt();
	  }

	  return false;
	} catch (err) {
	  console.error('Error checking camera permissions:', err);
	  return false;
	}
  }

  /**
   * Check the current permission status directly from the system
   * @returns {Promise<boolean>} Whether all required permissions are currently granted
   */
  static async checkCurrentPermissionStatus() {
	try {
	  const permissions = this.getRequiredPermissions();

	  // For Android 13+ (API 33+), we only need the granular permissions
	  // For older Android versions, we need READ/WRITE_EXTERNAL_STORAGE
	  let relevantPermissions = permissions;
	  if (Platform.Version >= 33) {
		// For Android 13+, we only need to check the media permissions
		relevantPermissions = permissions.filter(
		  p => p.includes('READ_MEDIA_') || p.includes('READ_MEDIA_'),
		);

		// If no media permissions found, fall back to checking all permissions
		if (relevantPermissions.length === 0) {
		  relevantPermissions = permissions;
		}
	  }

	  const results = await Promise.all(
		relevantPermissions.map(permission =>
		  PermissionsAndroid.check(permission),
		),
	  );

	  return results.every(result => result === true);
	} catch (error) {
	  console.error('Error during direct permission check:', error);
	  return false;
	}
  }

  /**
   * Check if camera permission is granted
   * @returns {Promise<boolean>} Whether camera permission is granted
   */
  static async hasCameraPermissions() {
	try {
	  if (Platform.OS !== 'android') {
		return true;
	  }

	  // Check if we've already stored that camera permissions are granted
	  const permissionsGranted = await AsyncStorage.getItem(
		CAMERA_PERMISSION_GRANTED_KEY,
	  );
	  if (permissionsGranted === 'true') {
		// Double-check system permission status
		const actuallyGranted = await this.checkCameraPermissionStatus();
		if (!actuallyGranted) {
		  await AsyncStorage.setItem(CAMERA_PERMISSION_GRANTED_KEY, 'false');
		  return false;
		}
		return true;
	  }

	  // Direct system check if we haven't cached permission state
	  const actuallyGranted = await this.checkCameraPermissionStatus();

	  // Update our cache if permission is granted
	  if (actuallyGranted) {
		await AsyncStorage.setItem(CAMERA_PERMISSION_GRANTED_KEY, 'true');
	  }

	  return actuallyGranted;
	} catch (error) {
	  console.error('Error checking camera permissions:', error);
	  return false;
	}
  }

  /**
   * Check the current camera permission status directly from the system
   * @returns {Promise<boolean>} Whether camera permission is currently granted
   */
  static async checkCameraPermissionStatus() {
	try {
	  const result = await PermissionsAndroid.check(
		PermissionsAndroid.PERMISSIONS.CAMERA,
	  );
	  return result;
	} catch (error) {
	  console.error('Error during camera permission check:', error);
	  return false;
	}
  }

  /**
   * Show a prompt to open settings when permissions have been denied
   * @returns {Promise<boolean>}
   */
  static showSettingsPrompt() {
	return new Promise(resolve => {
	  Alert.alert(
		'Permission Required',
		'Storage permission is required for this feature. Please enable it in app settings.',
		[
		  {
			text: 'Cancel',
			style: 'cancel',
			onPress: () => resolve(false),
		  },
		  {
			text: 'Open Settings',
			onPress: async () => {
			  await Linking.openSettings();

			  // Show guidance to the user
			  if (Platform.OS === 'android') {
				ToastAndroid.show(
				  'Please enable storage permissions for the app',
				  ToastAndroid.LONG,
				);
			  }

			  resolve(false);
			},
		  },
		],
		{cancelable: false},
	  );
	});
  }

  /**
   * Show a prompt to open settings for camera permission
   * @returns {Promise<boolean>}
   */
  static showCameraSettingsPrompt() {
	return new Promise(resolve => {
	  Alert.alert(
		'Camera Permission Required',
		'Camera permission is required for taking photos. Please enable it in app settings.',
		[
		  {
			text: 'Cancel',
			style: 'cancel',
			onPress: () => resolve(false),
		  },
		  {
			text: 'Open Settings',
			onPress: async () => {
			  await Linking.openSettings();

			  if (Platform.OS === 'android') {
				ToastAndroid.show(
				  'Please enable camera permission for the app',
				  ToastAndroid.LONG,
				);
			  }

			  resolve(false);
			},
		  },
		],
		{cancelable: false},
	  );
	});
  }

  /**
   * Get the required permissions based on Android version
   * @returns {Array<string>} Array of required permissions
   */
  static getRequiredPermissions() {
	const permissions = [
	  PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
	  PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
	];

	// For Android 13+ (API 33+), we need different permissions
	if (Platform.Version >= 33) {
	  permissions.push(
		PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
		PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
		PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
	  );
	}

	return permissions;
  }

  /**
   * Check if storage permissions are granted
   * @returns {Promise<boolean>} Whether all required permissions are granted
   */
  static async hasStoragePermissions() {
	try {
	  if (Platform.OS !== 'android') {
		return true;
	  }

	  // First check if we've already stored that permissions are granted
	  const permissionsGranted = await AsyncStorage.getItem(
		PERMISSION_GRANTED_KEY,
	  );
	  if (permissionsGranted === 'true') {
		// Double-check system permission status to make sure our cache is correct
		const actuallyGranted = await this.checkCurrentPermissionStatus();
		if (!actuallyGranted) {
		  // If permissions are actually revoked, update our store
		  await AsyncStorage.setItem(PERMISSION_GRANTED_KEY, 'false');
		  return false;
		}
		return true;
	  }

	  // Direct system check if we haven't cached permission state
	  const actuallyGranted = await this.checkCurrentPermissionStatus();

	  // Update our cache if permissions are granted
	  if (actuallyGranted) {
		await AsyncStorage.setItem(PERMISSION_GRANTED_KEY, 'true');
	  }

	  return actuallyGranted;
	} catch (error) {
	  console.error('Error checking permissions:', error);
	  return false;
	}
  }

  /**
   * Reset the permission state - useful for testing or if permissions were revoked
   */
  static async resetPermissionState() {
	try {
	  await AsyncStorage.removeItem(PERMISSION_GRANTED_KEY);
	  await AsyncStorage.removeItem(PERMISSION_ASKED_RECENTLY);
	  await AsyncStorage.removeItem(CAMERA_PERMISSION_GRANTED_KEY);

	  if (Platform.OS === 'android') {
		ToastAndroid.show('Permission state reset', ToastAndroid.SHORT);
	  }
	} catch (error) {
	  console.error('Error resetting permission state:', error);
	}
  }
}

export default PermissionService;
