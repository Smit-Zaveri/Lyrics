import React from 'react';
import { 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  FlatList, 
  StyleSheet, 
  Animated 
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
  onToggleCollection
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <Animated.View
          style={[
            styles.collectionsModal,
            {
              backgroundColor: themeColors.surface,
              transform: [{
                translateY: slideUpAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [600, 0]
                })
              }]
            }
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>Save to Collection</Text>
          </View>

          <View style={styles.newCollectionInput}>
            <TextInput
              style={[
                styles.input, 
                { 
                  color: themeColors.text, 
                  borderColor: themeColors.border 
                }
              ]}
              placeholder="Create new collection..."
              placeholderTextColor={themeColors.placeholder}
              value={newCollectionName}
              onChangeText={onNewCollectionNameChange}
            />
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: themeColors.primary }]}
              onPress={onCreateCollection}
            >
              <Text style={{ color: '#fff' }}>Create</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={collections}
            keyExtractor={item => item.id}
            renderItem={({ item }) => {
              const isSavedInCollection = item.songs?.some(s => s.id === song?.id);
              return (
                <TouchableOpacity
                  style={[styles.collectionItem, { borderBottomColor: themeColors.border }]}
                  onPress={() => onToggleCollection(item.id)}
                >
                  <Text style={[styles.collectionName, { color: themeColors.text }]}>
                    {item.name}
                  </Text>
                  <MaterialCommunityIcons
                    name={isSavedInCollection ? 'check-circle' : 'circle-outline'}
                    size={24}
                    color={isSavedInCollection ? themeColors.primary : themeColors.text}
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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  newCollectionInput: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  createButton: {
    paddingHorizontal: 20,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  collectionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  collectionName: {
    fontSize: 16,
  },
});

export default CollectionsModal;