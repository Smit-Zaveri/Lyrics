import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Modal, ActivityIndicator, FlatList, BackHandler } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Linking } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const MediaContent = ({ mediaUrl, themeColors, images }) => {
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [imageSize, setImageSize] = useState({ width: screenWidth - 40, height: 200 });
  const [isFullScreen, setFullScreen] = useState(false);
  const [fullscreenIndex, setFullscreenIndex] = useState(0);
  const flatListRef = useRef(null);

  const hasMultipleImages = Array.isArray(images) && images.length > 0;

  const isImageDataUrl = (url) => url?.startsWith('data:image/');
  const isExternalUrl = (url) => url?.startsWith('http://') || url?.startsWith('https://');

  const getMediaFormat = (url) => {
    try {
      return url?.split(',')[0].split(':')[1].split(';')[0];
    } catch {
      return 'Unknown format';
    }
  };

  const getMediaTypeIcon = (url) => {
    if (!url) return 'insert-drive-file';
    if (url.includes('youtube.com') || url.includes('youtu.be')) return 'smart-display';
    if (url.startsWith('data:image/')) return 'image';
    if (url.startsWith('data:audio/')) return 'audiotrack';
    if (url.startsWith('data:video/')) return 'videocam';
    if (url.startsWith('data:text/')) return 'description';
    if (url.startsWith('data:application/pdf')) return 'picture-as-pdf';
    return 'insert-drive-file';
  };

  const handleMediaPress = (url) => {
    if (isExternalUrl(url)) {
      Linking.openURL(url).catch(err => console.error('Error opening URL:', err));
    }
  };

  useEffect(() => {
    if (isImageDataUrl(mediaUrl) && !hasMultipleImages) {
      Image.getSize(
        mediaUrl,
        (width, height) => {
          const ratio = (screenWidth - 40) / width;
          setImageSize({ width: screenWidth - 40, height: height * ratio });
        },
        () => {
          setImageSize({ width: screenWidth - 40, height: 200 });
        }
      );
    }
  }, [mediaUrl, hasMultipleImages]);

  useEffect(() => {
    const backAction = () => {
      if (isFullScreen) {
        setFullScreen(false);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [isFullScreen]);

  if (!mediaUrl && !hasMultipleImages) return null;

  const renderImageItem = ({ item, index }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          setFullscreenIndex(index);
          setFullScreen(true);
        }}
        activeOpacity={0.8}
        style={styles.imageItemContainer}
      >
        <Image
          source={{ uri: item.uri }}
          style={styles.galleryImage}
          resizeMode="cover"
          onError={() => console.log(`Error loading image at index ${index}`)}
        />
      </TouchableOpacity>
    );
  };

  // Full screen modal for gallery images
  const renderFullScreenGallery = () => {
    // When the modal opens, scroll to the correct image
    useEffect(() => {
      if (isFullScreen && flatListRef.current && images && images.length > fullscreenIndex) {
        // Small delay to ensure FlatList is rendered
        const timer = setTimeout(() => {
          try {
            flatListRef.current.scrollToIndex({
              index: fullscreenIndex,
              animated: false,
              viewPosition: 0
            });
          } catch (err) {
            console.log('Error scrolling to index:', err);
          }
        }, 50);
        
        return () => clearTimeout(timer);
      }
    }, [isFullScreen]);

    return (
      <Modal visible={isFullScreen} transparent={true} animationType="fade" onRequestClose={() => setFullScreen(false)}>
        <View style={styles.fullScreenWrapper}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setFullScreen(false)}
          >
            <Icon name="close" size={30} color="#FFFFFF" />
          </TouchableOpacity>
          
          <FlatList
            ref={flatListRef}
            data={images}
            initialScrollIndex={fullscreenIndex}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            decelerationRate="normal" // Smoother deceleration
            onMomentumScrollEnd={(event) => {
              // Update index when scrolling stops
              const newIndex = Math.round(event.nativeEvent.contentOffset.x / screenWidth);
              if (newIndex >= 0 && newIndex < images.length) {
                setFullscreenIndex(newIndex);
              }
            }}
            renderItem={({ item }) => (
              <TouchableOpacity 
                activeOpacity={0.9}
                style={styles.fullscreenImageContainer}
                onPress={() => setFullScreen(false)}
              >
                <Image
                  source={{ uri: item.uri }}
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

  return (
    <View style={styles.wrapper}>
     

      {hasMultipleImages && (
        <View style={styles.galleryContainer}>
          <FlatList
            data={images}
            renderItem={renderImageItem}
            keyExtractor={(item, index) => `image-${index}`}
            horizontal={false}
            showsVerticalScrollIndicator={false}
            scrollEnabled={false}
            contentContainerStyle={styles.galleryContentContainer}
          />
          
          {renderFullScreenGallery()}
        </View>
      )}

      {isImageDataUrl(mediaUrl) && !hasMultipleImages ? (
        <>
          <TouchableOpacity
            onPress={() => setFullScreen(true)}
            activeOpacity={0.8}
          >
            <View style={[styles.imageContainer, { borderColor: themeColors.border, height: imageSize.height }]}>
              {isImageLoading && (
                <View style={styles.loaderWrapper}>
                  <ActivityIndicator color={themeColors.primary} size="large" />
                </View>
              )}

              <Image
                source={{ uri: mediaUrl }}
                style={[styles.image, { height: imageSize.height }]}
                onLoadStart={() => setIsImageLoading(true)}
                onLoad={() => setIsImageLoading(false)}
                onError={() => {
                  setIsImageLoading(false);
                  setHasError(true);
                }}
                resizeMode="cover"
              />

              {hasError && (
                <View style={styles.errorContainer}>
                  <Icon name="broken-image" size={40} color={themeColors.error} />
                  <Text style={[styles.errorText, { color: themeColors.error }]}>Failed to load image</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>

          <Modal visible={isFullScreen} transparent={true}>
            <TouchableOpacity
              style={styles.fullScreenWrapper}
              activeOpacity={1}
              onPress={() => setFullScreen(false)}
            >
              <Image
                source={{ uri: mediaUrl }}
                style={styles.fullScreenImage}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </Modal>
        </>
      ) : !hasMultipleImages && (
        <TouchableOpacity
          style={[
            styles.mediaCard,
            {
              backgroundColor: themeColors.surface,
              borderColor: themeColors.border,
            },
          ]}
          activeOpacity={0.8}
          onPress={() => handleMediaPress(mediaUrl)}
        >
          <Icon name={getMediaTypeIcon(mediaUrl)} size={40} color={themeColors.primary} style={styles.mediaIcon} />
          <View style={styles.mediaInfo}>
            <Text style={[styles.mediaTitle, { color: themeColors.text }]}>{getMediaFormat(mediaUrl)}</Text>
            <Text style={[styles.mediaSubtitle, { color: themeColors.textSecondary }]}>Tap to open</Text>
          </View>
          <Icon name="chevron-right" size={24} color={themeColors.placeholder} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    padding: 10,
    paddingTop: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  imageContainer: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    borderRadius: 10,
  },
  loaderWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  errorContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,0,0,0.1)',
  },
  errorText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: '500',
  },
  mediaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
  },
  mediaIcon: {
    marginRight: 14,
  },
  mediaInfo: {
    flex: 1,
  },
  mediaTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  mediaSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  fullScreenWrapper: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: screenWidth,
    height: '100%',
  },
  galleryContainer: {
    marginBottom: 15,
  },
  galleryContentContainer: {
    paddingBottom: 10,
  },
  imageItemContainer: {
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  galleryImage: {
    width: '100%',
    height: 250,
    borderRadius: 10,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 5,
  },
  imageCounter: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    color: 'white',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    fontSize: 14,
    fontWeight: 'bold',
  },
  fullscreenImageContainer: {
    width: screenWidth,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navigationControls: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    marginTop: -20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  navButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
    padding: 5,
  },
  navButtonLeft: {
    left: 20,
  },
  navButtonRight: {
    right: 20,
  },
});

export default MediaContent;
