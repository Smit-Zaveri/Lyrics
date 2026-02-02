import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  TextInput,
  FlatList,
  StyleSheet,
  Animated,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const CollectionsModal = ({
  visible,
  themeColors,
  collections,
  newCollectionName,
  slideUpAnim,
  song,
  onClose,
  onNewCollectionNameChange,
  onCreateCollection,
  onToggleCollection,
  hasError,
  errorMessage,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}>
        <Animated.View
          style={[
            styles.collectionsModal,
            {
              backgroundColor: themeColors.surface,
              transform: [
                {
                  translateY: slideUpAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [600, 0],
                  }),
                },
              ],
            },
          ]}>
          <View
            style={[
              styles.dragHandle,
              {backgroundColor: themeColors.textSecondary + '40'},
            ]}
          />
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, {color: themeColors.text}]}>
              Save to Collection
            </Text>
          </View>

          <View style={styles.newCollectionInput}>
            <TextInput
              style={[
                styles.input,
                {
                  color: themeColors.text,
                  backgroundColor: themeColors.background,
                  borderWidth: 1,
                  borderColor: hasError ? 'red' : 'transparent',
                },
              ]}
              placeholder="New collection name"
              placeholderTextColor={themeColors.placeholder}
              value={newCollectionName}
              onChangeText={onNewCollectionNameChange}
            />
            <TouchableOpacity
              style={[
                styles.createButton,
                {backgroundColor: themeColors.primary},
              ]}
              onPress={onCreateCollection}>
              <MaterialCommunityIcons name="plus" size={24} color="#fff" />
            </TouchableOpacity>
          </View>

          {hasError && <Text style={styles.errorText}>{errorMessage}</Text>}

          <FlatList
            data={collections}
            keyExtractor={item => item.id}
            renderItem={({item}) => {
              const isSavedInCollection = item.songs?.some(
                s => s.id === song?.id,
              );
              return (
                <TouchableOpacity
                  style={styles.collectionItem}
                  onPress={() => onToggleCollection(item.id)}>
                  <View style={styles.collectionItemLeft}>
                    <MaterialCommunityIcons
                      name="playlist-music"
                      size={20}
                      color={themeColors.textSecondary}
                      style={{marginRight: 12}}
                    />
                    <Text
                      style={[styles.collectionName, {color: themeColors.text}]}>
                      {item.name}
                    </Text>
                  </View>
                  <MaterialCommunityIcons
                    name={
                      isSavedInCollection ? 'check-circle' : 'circle-outline'
                    }
                    size={22}
                    color={
                      isSavedInCollection
                        ? themeColors.primary
                        : themeColors.textSecondary
                    }
                  />
                </TouchableOpacity>
              );
            }}
          />
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  collectionsModal: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    maxHeight: '70%',
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    marginBottom: 16,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  newCollectionInput: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginRight: 10,
    fontSize: 14,
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  collectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  collectionItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collectionName: {
    fontSize: 15,
    fontWeight: '500',
  },
  errorText: {
    color: 'red',
    marginBottom: 15,
    marginTop: -10,
    fontSize: 12,
  },
});

export default CollectionsModal;
