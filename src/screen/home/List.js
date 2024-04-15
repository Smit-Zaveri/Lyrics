import React, { useState, useCallback, useEffect } from 'react';
import { FlatList, SafeAreaView, Text, PixelRatio, StyleSheet, TouchableOpacity, Pressable, View, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { sampleLyrics } from '../../config/sampleLyrics';


const phoneFontScale = PixelRatio.getFontScale();


const sampleTags = [
  {id: '1', name: 'Mahavir'},
  {id: '2', name: 'Nem'},
  {id: '3', name: 'R&B'},
  {id: '4', name: 'Soul'},
];

const List = () => {
  const navigation = useNavigation();
  const [header, setHeader] = useState(true);
  const [lyrics, setLyrics] = useState(sampleLyrics);
  const [tags, setTags] = useState(sampleTags);
  const [selectedTags, setSelectedTags] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filteredLyrics, setFilteredLyrics] = useState([]);

  const filterAndSortLyrics = (tags, lyrics) => {
    const currentDate = new Date();
  
    const filteredItems = lyrics.filter(item => {
      return tags.every(selectedTag => item.tags.includes(selectedTag));
    });
  
    return filteredItems.sort((a, b) => {
      // Check if a is flagged as new and if it's within a week since publication
      const isNewA = a.newFlag && Math.ceil((currentDate - new Date(a.publishDate)) / (1000 * 60 * 60 * 24)) < 7;
      // Check if b is flagged as new and if it's within a week since publication
      const isNewB = b.newFlag && Math.ceil((currentDate - new Date(b.publishDate)) / (1000 * 60 * 60 * 24)) < 7;
  
      // If only one item is new and within a week, prioritize it
      if (isNewA !== isNewB) {
        return isNewA ? -1 : 1;
      } else {
        // Otherwise, sort based on numbering
        return a.numbering - b.numbering;
      }
    });
  };
  
  
  

  const handleTagPress = useCallback(
    tag => {
      const newSelectedTags = selectedTags.includes(tag)
        ? selectedTags.filter(selectedTag => selectedTag !== tag)
        : [...selectedTags, tag];
      setSelectedTags(newSelectedTags);

      const filteredItems = filterAndSortLyrics(newSelectedTags, lyrics);
      setFilteredLyrics(filteredItems);
    },
    [selectedTags, lyrics],
  );

  const renderTags = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: selectedTags.includes(item.name)
            ? '#FFC107'
            : '#fff',
          height: 40,
        },
      ]}
      onPress={() => handleTagPress(item.name)}>
      <Text style={styles.chipText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderListItem = ({ item }) => {
    const { id, numbering, title, content, publishDate, newFlag } = item;

    const currentDate = new Date();
    const publishDateTime = new Date(publishDate);
    const timeDiff = Math.ceil(
      (currentDate - publishDateTime) / (1000 * 60 * 60 * 24),
    );

    const numberingText =
      newFlag && timeDiff >= 0 && timeDiff < 7 ? 'NEW' : numbering.toString();

    return (
      <Pressable
      onPress={() => {
        navigation.navigate('Details', {
          itemNumberingparas: item.numbering.toString() // Convert Date to string
        });
        setHeader(true);
      }}
        style={{ marginHorizontal: 5 }}>
        <View
          key={id}
          style={{
            borderBottomColor: 'rgba(0,0,0,0.2)',
            borderBottomWidth: 1,
            padding: 10,
            height: 70,
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <View style={{ height: 40 }}>
            <Text
              style={{
                marginRight: 20,
                borderStyle: 'dashed',
                borderColor: '#673ab7',
                borderWidth: newFlag && timeDiff >= 0 && timeDiff < 7 ? 2 : 0,
                backgroundColor:
                  newFlag && timeDiff >= 0 && timeDiff < 7
                    ? '#FFC107'
                    : '#673AB7',
                color:
                  newFlag && timeDiff >= 0 && timeDiff < 7 ? '#673AB7' : '#fff',
                paddingLeft: newFlag && timeDiff >= 0 && timeDiff < 7 ? 20 : 16,
                paddingHorizontal: 16,
                paddingTop: 10,
                flex: 1,
                fontWeight: 'bold',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 20,
              }}>
              {numberingText}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 * phoneFontScale }}>
              {title}
            </Text>
            <Text style={{ fontSize: 14 * phoneFontScale }} numberOfLines={1}>
              {content.split('\n')[0]}
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyListContainer}>
      <Text style={styles.emptyListText}>
        {filteredLyrics.length === 0 ? 'No results found' : 'No data available'}
      </Text>
    </View>
  );

  const onRefresh = () => {
    setRefreshing(true);
    setLyrics(sampleLyrics);
    setTags(sampleTags);
    setRefreshing(false);
  };

  useEffect(() => {
    const sortedFilteredItems = filterAndSortLyrics(selectedTags, lyrics);
    setFilteredLyrics(sortedFilteredItems);
  }, [selectedTags, lyrics]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Icon
          name="search"
          color="#fff"
          onPress={() => {
            navigation.navigate('Search');
          }}
          size={26}
        />
      ),
      headerShown: header,
    });
  }, [navigation, header]);

  return (
    <SafeAreaView>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={tags}
        renderItem={renderTags}
        keyExtractor={item => item.id.toString()}
      />
      <FlatList
        scrollEnabled={true}
        data={filteredLyrics}
        renderItem={renderListItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={renderEmptyList}
        ListFooterComponent={<View style={{ height: 70 }}></View>} 
        refreshControl={
          <RefreshControl
            tintColor="#673AB7"
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 97,
    paddingLeft: 12,
    paddingRight: 12,
    marginVertical: 15,
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: '#673AB7',
  },
  chipText: {
    padding: 8,
    fontSize: 13,
    height: 36,
    textTransform: 'capitalize',
    fontWeight: 'bold',
    color: '#673AB7',
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyListText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default List;