import React, {useState, useContext, useEffect, useRef} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActionSheetIOS,
  Modal,
  FlatList,
  Dimensions,
  BackHandler,
} from 'react-native';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {useNavigation, useRoute} from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {pick, PickOptions} from '@react-native-documents/picker';
import RNFS from 'react-native-fs';
import {saveUserSong, updateUserSong} from '../../config/dataService';
import {ThemeContext} from '../../../App';
import {LanguageContext} from '../../context/LanguageContext';
import PermissionService from '../../utils/PermissionService';

const {width: screenWidth} = Dimensions.get('window');

const AddSong = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {themeColors} = useContext(ThemeContext);
  const {getString} = useContext(LanguageContext);

  const songToEdit = route.params?.songToEdit;
  const isEditing = route.params?.isEditing || false;
  const returnToDetailPage = route.params?.returnToDetailPage || false;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableTags, setAvailableTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [sortedAvailableTags, setSortedAvailableTags] = useState([]);
  const [images, setImages] = useState([]);
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [showMediaOptions, setShowMediaOptions] = useState(false);
  const [isFullScreen, setFullScreen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const flatListRef = useRef(null);
  const tagsScrollViewRef = useRef(null);

  useEffect(() => {
    if (isEditing && songToEdit) {
      setTitle(
        Array.isArray(songToEdit.title)
          ? getString(songToEdit.title)
          : songToEdit.title,
      );
      setContent(
        Array.isArray(songToEdit.content)
          ? getString(songToEdit.content)
          : songToEdit.content,
      );

      if (songToEdit.tags && Array.isArray(songToEdit.tags)) {
        const tagValues = songToEdit.tags.map(tag =>
          Array.isArray(tag) ? getString(tag) : tag,
        );
        setSelectedTags(tagValues);
        setTags(tagValues.join(', ')); // Display tags in the text box as comma-separated values
      }

      if (songToEdit.images && Array.isArray(songToEdit.images)) {
        setImages(songToEdit.images);
      }
    }
  }, [isEditing, songToEdit, getString]);

  // Effect to sort tags when selectedTags or availableTags change
  useEffect(() => {
    if (availableTags.length > 0) {
      // Sort tags by putting selected ones first, then the rest in their original order
      const sorted = [...availableTags].sort((a, b) => {
        const aSelected = selectedTags.includes(a.name);
        const bSelected = selectedTags.includes(b.name);

        if (aSelected && !bSelected) return -1;
        if (!aSelected && bSelected) return 1;

        // If both are selected or both are not selected, keep original order
        const numA = a.numbering !== undefined ? a.numbering : 0;
        const numB = b.numbering !== undefined ? b.numbering : 0;
        return numA - numB;
      });

      setSortedAvailableTags(sorted);
    } else {
      setSortedAvailableTags([]);
    }
  }, [selectedTags, availableTags]);

  useEffect(() => {
    navigation.setOptions({
      title: isEditing ? 'Edit Song' : 'Add New Song',
    });

    loadTags();
    checkPermissions();
  }, [navigation, title, content, loading, isEditing, images]);

  useEffect(() => {
    const backAction = () => {
      if (isFullScreen) {
        setFullScreen(false);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction,
    );
    return () => backHandler.remove();
  }, [isFullScreen]);

  const checkPermissions = async () => {
    try {
      const hasAllPermissions = await PermissionService.hasStoragePermissions();
      setHasPermission(hasAllPermissions);
      setPermissionChecked(true);

      if (!hasAllPermissions) {
        const permissionsGranted =
          await PermissionService.requestStoragePermissions();
        setHasPermission(permissionsGranted);
      }
    } catch (err) {
      console.error('Error checking permissions:', err);
      setPermissionChecked(true);
    }
  };

  const loadTags = async () => {
    try {
      const tagsData = await AsyncStorage.getItem('cachedData_tags');
      if (tagsData) {
        const parsedTags = JSON.parse(tagsData);
        setAvailableTags(parsedTags);
      }
    } catch (error) {
      console.error('Error loading tags:', error);
    }
  };

  // Format tags array into a clean comma-separated string
  const formatTagsString = tagsArray => {
    if (!tagsArray || tagsArray.length === 0) return '';
    return tagsArray.join(', ');
  };

  // Parse and deduplicate tags from a string
  const parseTagsFromString = text => {
    if (!text) return [];

    return [
      ...new Set(
        text
          .split(',')
          .map(tag => tag.trim())
          .filter(tag => tag.length > 0),
      ),
    ];
  };

  const handleTagToggle = tag => {
    let updatedSelectedTags;

    if (selectedTags.includes(tag.name)) {
      // Remove tag if already selected
      updatedSelectedTags = selectedTags.filter(t => t !== tag.name);
    } else {
      // Add tag if not selected
      updatedSelectedTags = [...selectedTags, tag.name];
    }

    // Deduplicate tags (shouldn't be needed but ensures consistency)
    updatedSelectedTags = [...new Set(updatedSelectedTags)];

    // Update selected tags state
    setSelectedTags(updatedSelectedTags);

    // Update text input with clean formatted string
    setTags(formatTagsString(updatedSelectedTags));
  };

  const handleTagTextChange = text => {
    setTags(text);

    // If text ends with comma, process the tags
    if (text.endsWith(',')) {
      // Parse all tags from the text input
      let inputTags = parseTagsFromString(text);

      // Set the unique tags
      setSelectedTags(inputTags);

      // Format the text nicely with proper spacing
      setTags(formatTagsString(inputTags) + (inputTags.length > 0 ? ', ' : ''));
    }
    // User deleted everything - clear tags
    else if (!text.trim()) {
      setSelectedTags([]);
    }
    // Regular editing - sync the tags when commas exist
    else if (text.includes(',')) {
      // Get current tags from text input
      const currentTags = parseTagsFromString(text);
      setSelectedTags(currentTags);
    }
    // Single tag, no comma yet - don't add to selectedTags until they add a comma
  };

  const handleMediaPicker = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Gallery'],
          cancelButtonIndex: 0,
        },
        buttonIndex => {
          if (buttonIndex === 1) {
            handleCameraCapture();
          } else if (buttonIndex === 2) {
            handleImagePicker();
          }
        },
      );
    } else {
      setShowMediaOptions(true);
    }
  };

  const handleCameraCapture = async () => {
    try {
      let cameraPermission = await PermissionService.hasCameraPermissions();

      if (!cameraPermission) {
        cameraPermission = await PermissionService.requestCameraPermissions();
      }

      if (!cameraPermission) {
        return;
      }

      const options = {
        mediaType: 'photo',
        quality: 1,
        saveToPhotos: true,
      };

      const result = await launchCamera(options);

      if (result.didCancel) {
        return;
      }

      if (result.errorCode) {
        console.error('Camera Error:', result.errorMessage);
        return;
      }

      if (result.assets && result.assets.length > 0) {
        const photo = result.assets[0];

        const fileName = `image_${Date.now()}_camera_${photo.fileName || 'img.jpg'}`;
        const localPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

        await RNFS.copyFile(photo.uri, localPath);

        const newImage = {
          uri: Platform.OS === 'android' ? `file://${localPath}` : localPath,
          name: photo.fileName || 'camera_image.jpg',
          type: photo.type || 'image/jpeg',
          size: photo.fileSize || 0,
        };

        setImages([...images, newImage]);
      }
    } catch (error) {
      console.error('Camera error:', error);
    }
  };

  const handleImagePicker = async () => {
    try {
      let hasPermission = await PermissionService.hasStoragePermissions();

      if (!hasPermission) {
        hasPermission = await PermissionService.requestStoragePermissions();
      }

      if (!hasPermission) {
        return;
      }

      let results;
      try {
        results = await pick({
          type: ['public.image', 'image/*'],
          allowMultiSelection: true,
        });
      } catch (pickError) {
        if (
          pickError.code === 'DOCUMENT_PICKER_CANCELED' ||
          pickError.message?.includes('canceled') ||
          pickError.message?.includes('cancelled')
        ) {
          return;
        }
        throw pickError;
      }

      if (!results || !results.length) {
        return;
      }

      const newImages = await Promise.all(
        results.map(async (result, index) => {
          try {
            const fileName = `image_${Date.now()}_${index}_${result.name || 'img.jpg'}`;
            const localPath = `${RNFS.DocumentDirectoryPath}/${fileName}`;

            await RNFS.copyFile(result.uri, localPath);

            return {
              uri:
                Platform.OS === 'android' ? `file://${localPath}` : localPath,
              name: result.name || `image_${index}.jpg`,
              type: result.type || 'image/jpeg',
              size: result.size || 0,
            };
          } catch (error) {
            return null;
          }
        }),
      );

      const validImages = newImages.filter(img => img !== null);

      if (validImages.length > 0) {
        setImages([...images, ...validImages]);
      }
    } catch (error) {}
  };

  const removeImage = indexToRemove => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const openFullScreenGallery = index => {
    setFullscreenIndex(index);
    setFullScreen(true);
  };

  const renderFullScreenGallery = () => {
    useEffect(() => {
      if (
        isFullScreen &&
        flatListRef.current &&
        images.length > fullscreenIndex
      ) {
        const timer = setTimeout(() => {
          try {
            flatListRef.current.scrollToIndex({
              index: fullscreenIndex,
              animated: false,
              viewPosition: 0,
            });
          } catch (err) {
            console.log('Error scrolling to index:', err);
          }
        }, 50);

        return () => clearTimeout(timer);
      }
    }, [isFullScreen]);

    return (
      <Modal
        visible={isFullScreen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullScreen(false)}>
        <View style={styles.fullScreenWrapper}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setFullScreen(false)}>
            <Icon name="close" size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <FlatList
            ref={flatListRef}
            data={images}
            initialScrollIndex={fullscreenIndex}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="normal"
            onMomentumScrollEnd={event => {
              const newIndex = Math.round(
                event.nativeEvent.contentOffset.x / screenWidth,
              );
              if (newIndex >= 0 && newIndex < images.length) {
                setFullscreenIndex(newIndex);
              }
            }}
            renderItem={({item}) => (
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.fullscreenImageContainer}
                onPress={() => setFullScreen(false)}>
                <Image
                  source={{uri: item.uri}}
                  style={styles.fullScreenImage}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => `fullscreen-${index}`}
            getItemLayout={(_, index) => ({
              length: screenWidth,
              offset: screenWidth * index,
              index,
            })}
            removeClippedSubviews={false}
          />

          <Text style={styles.imageCounter}>
            {fullscreenIndex + 1} / {images.length}
          </Text>
        </View>
      </Modal>
    );
  };

  const handleSave = async () => {
    if (!title.trim()) {
      return;
    }

    if (!content.trim() && images.length === 0) {
      return;
    }

    setLoading(true);

    try {
      // Make sure we have a deduplicated tags list
      const processedTags = parseTagsFromString(tags);

      // Create image URLs array
      const imageUrls = images.map(img => ({
        uri: img.uri,
        name: img.name,
        type: img.type,
      }));

      // Create a complete song data object with all updated fields
      const songData = {
        title: title.trim(),
        content: content.trim(),
        tags: tags.trim() ? processedTags : [], // Ensure empty string results in empty array
        images: imageUrls,
        hasLocalImages: imageUrls.length > 0,
        fromAddedSongs: true, // Add this flag to identify songs that come from the singer mode
      };

      let result;
      // Force update for both editing and creating scenarios to ensure consistent behavior
      if (isEditing && songToEdit) {
        // Create a new object with song data that explicitly includes the original ID
        // This ensures updateUserSong can find the correct song to update
        const updatedSongData = {
          ...songToEdit,
          ...songData,
          id: songToEdit.id, // Ensure ID is preserved
        };

        // Log the update for debugging
        console.log('Updating song with tags:', updatedSongData.tags);

        // Perform the update
        result = await updateUserSong(updatedSongData);

        if (result.success) {
          console.log('Song updated successfully');

          // Create common params for navigation to indicate updates
          const updateParams = {
            songUpdated: true,
            updatedSongId: songToEdit.id,
          };

          if (returnToDetailPage) {
            // Navigate back to DetailPage with update indicator
            navigation.navigate({
              name: 'Details', // Make sure this matches the actual route name
              params: updateParams,
              merge: true,
            });
          } else {
            // Go back to previous screen (likely List) with update indicator
            navigation.navigate({
              name: route.params?.returnScreen || 'List',
              params: {
                ...updateParams,
                listNeedsRefresh: true, // Additional flag for List screen
              },
              merge: true,
            });
          }
        } else {
          console.error('Error updating song:', result.error);
          navigation.goBack();
        }
      } else {
        // For new songs, save and go back with refresh indicator
        result = await saveUserSong(songData);

        // Go back to previous screen with update indicator
        navigation.navigate({
          name: route.params?.returnScreen || 'List',
          params: {
            songUpdated: true,
            listNeedsRefresh: true,
            newSongAdded: true,
          },
          merge: true,
        });
      }
    } catch (error) {
      console.error('Error saving song:', error);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, {backgroundColor: themeColors.background}]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.formGroup}>
          <View style={styles.labelContainer}>
            <Icon name="title" size={16} color={themeColors.primary} style={styles.labelIcon} />
            <Text style={[styles.label, {color: themeColors.text}]}>
              Song Title*
            </Text>
          </View>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: themeColors.surface,
                color: themeColors.text,
                borderColor: themeColors.primary + '20',
              },
            ]}
            value={title}
            onChangeText={setTitle}
            placeholder="Enter song title"
            placeholderTextColor={themeColors.textSecondary}
          />
        </View>

        <View style={styles.formGroup}>
          <View style={styles.labelContainer}>
            <Icon name="local-offer" size={16} color={themeColors.primary} style={styles.labelIcon} />
            <Text style={[styles.label, {color: themeColors.text}]}>
              Tags (Optional)
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.tagsContainer}
            contentContainerStyle={styles.tagsScrollContent}>
            {sortedAvailableTags.map(tag => (
              <TouchableOpacity
                key={tag.id || tag.name}
                onPress={() => handleTagToggle(tag)}
                style={[
                  styles.tagChip,
                  {
                    backgroundColor: selectedTags.includes(tag.name)
                      ? themeColors.primary + '15'
                      : themeColors.surface,
                    borderColor: selectedTags.includes(tag.name)
                      ? themeColors.primary
                      : themeColors.primary + '25',
                  },
                ]}>
                <Text
                  style={[
                    styles.tagChipText,
                    {
                      color: selectedTags.includes(tag.name)
                        ? themeColors.primary
                        : themeColors.text,
                    },
                  ]}>
                  {tag.displayName || tag.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: themeColors.surface,
                color: themeColors.text,
                borderColor: themeColors.primary + '20',
                marginTop: 8,
              },
            ]}
            value={tags}
            onChangeText={handleTagTextChange}
            placeholder="Or enter comma-separated tags"
            placeholderTextColor={themeColors.textSecondary}
          />
        </View>

        <View style={styles.formGroup}>
          <View style={styles.labelContainer}>
            <Icon name="lyrics" size={16} color={themeColors.primary} style={styles.labelIcon} />
            <Text style={[styles.label, {color: themeColors.text}]}>
              Lyrics/Content
            </Text>
          </View>
          <TextInput
            style={[
              styles.textArea,
              {
                backgroundColor: themeColors.surface,
                color: themeColors.text,
                borderColor: themeColors.primary + '20',
              },
            ]}
            value={content}
            onChangeText={setContent}
            placeholder="Enter lyrics or content here"
            placeholderTextColor={themeColors.textSecondary}
            multiline={true}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.formGroup}>
          <View style={styles.labelContainer}>
            <Icon name="image" size={16} color={themeColors.primary} style={styles.labelIcon} />
            <Text style={[styles.label, {color: themeColors.text}]}>Images</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.imageContainer}
            contentContainerStyle={styles.imageScrollContent}>
            {images.map((image, index) => (
              <View key={index} style={styles.imageWrapper}>
                <TouchableOpacity
                  onPress={() => openFullScreenGallery(index)}
                  activeOpacity={0.8}>
                  <Image source={{uri: image.uri}} style={styles.image} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => removeImage(index)}>
                  <Icon name="close" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View style={styles.mediaButtonsContainer}>
            <TouchableOpacity
              style={[
                styles.mediaButton,
                {backgroundColor: themeColors.primary},
              ]}
              activeOpacity={0.7}
              onPress={handleMediaPicker}>
              <Icon
                name="add-photo-alternate"
                size={18}
                color="#fff"
                style={styles.buttonIcon}
              />
              <Text style={styles.buttonText}>Add Media</Text>
            </TouchableOpacity>
          </View>
        </View>

        {renderFullScreenGallery()}

        <Modal
          visible={showMediaOptions}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowMediaOptions(false)}>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowMediaOptions(false)}>
            <View
              style={[
                styles.modalContent,
                {backgroundColor: themeColors.surface},
              ]}
              // Prevent touch events from propagating to parent
              onStartShouldSetResponder={() => true}
              onTouchEnd={e => e.stopPropagation()}>
              <Text style={[styles.modalTitle, {color: themeColors.text}]}>
                Choose Media Option
              </Text>

              <TouchableOpacity
                style={[
                  styles.modalOption,
                  {borderBottomColor: themeColors.border},
                ]}
                onPress={() => {
                  setShowMediaOptions(false);
                  handleCameraCapture();
                }}>
                <Icon name="camera-alt" size={22} color={themeColors.primary} />
                <Text
                  style={[styles.modalOptionText, {color: themeColors.text}]}>
                  Take Photo
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.modalOption,
                  {borderBottomColor: themeColors.border},
                ]}
                onPress={() => {
                  setShowMediaOptions(false);
                  handleImagePicker();
                }}>
                <Icon
                  name="photo-library"
                  size={22}
                  color={themeColors.primary}
                />
                <Text
                  style={[styles.modalOptionText, {color: themeColors.text}]}>
                  Choose from Gallery
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  {backgroundColor: themeColors.error},
                ]}
                onPress={() => setShowMediaOptions(false)}>
                <Text
                  style={[{color: themeColors.text}, styles.cancelButtonText]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              {
                backgroundColor:
                  loading ||
                  !title.trim() ||
                  (!content.trim() && images.length === 0)
                    ? themeColors.primaryDisabled
                    : themeColors.primary,
              },
            ]}
            activeOpacity={0.7}
            onPress={handleSave}
            disabled={loading || !title.trim()}>
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Icon
                  name="save"
                  size={18}
                  color="#fff"
                  style={styles.buttonIcon}
                />
                <Text style={styles.buttonText}>
                  {isEditing ? 'Update Song' : 'Save Song'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
  },
  formGroup: {
    marginBottom: 18,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  labelIcon: {
    marginRight: 6,
  },
  label: {
    fontWeight: '700',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  input: {
    height: 44,
    borderRadius: 10,
    paddingHorizontal: 13,
    fontSize: 15,
    borderWidth: 1,
    borderStyle: 'solid',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  textArea: {
    height: 180,
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingTop: 13,
    fontSize: 15,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderStyle: 'solid',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  saveButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  buttonContainer: {
    marginVertical: 8,
    marginTop: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  buttonIcon: {
    marginRight: 8,
  },
  tagsContainer: {
    maxHeight: 40,
    marginBottom: 8,
  },
  tagsScrollContent: {
    alignItems: 'center',
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    marginRight: 6,
    borderWidth: 1.5,
    borderStyle: 'solid',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  tagChipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  imageContainer: {
    maxHeight: 100,
    marginBottom: 8,
  },
  imageScrollContent: {
    alignItems: 'center',
    paddingVertical: 3,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: 10,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 90,
    height: 90,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 14,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  mediaButtonsContainer: {
    flexDirection: 'row',
    marginTop: 10,
    justifyContent: 'center',
  },
  mediaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    borderRadius: 10,
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 18,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
  },
  modalOptionText: {
    fontSize: 15,
    marginLeft: 16,
    fontWeight: '600',
  },
  cancelButton: {
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  fullScreenWrapper: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  fullscreenImageContainer: {
    width: screenWidth,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: screenWidth,
    height: '100%',
  },
  imageCounter: {
    position: 'absolute',
    bottom: 30,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
});

export default AddSong;
