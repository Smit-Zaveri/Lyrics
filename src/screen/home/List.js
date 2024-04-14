import React, { useState, useCallback, useEffect } from 'react';
import { FlatList, SafeAreaView, Text, PixelRatio, StyleSheet, TouchableOpacity, Pressable, View, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const phoneFontScale = PixelRatio.getFontScale();

const sampleLyrics = [
  {
    id: '1',
    numbering: 1,
    title: 'Sample Title 1',
    artist: 'Sample Artist 1',
    content: 'Sample content for song 1...',
    publishDate: new Date(),
    newFlag: true,
    tags: ['Pop', 'Rock'],
    youtube: 'https://youtu.be/PhSQnIrQIOg?si=xNmhPEWjcSVvdVzF',
  },
  {
    id: '2',
    numbering: 2,
    title: 'Sample Title 2',
    artist: 'Sample Artist 2',
    content: 'Sample content for song 2...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['R&B', 'Soul'],
  },
  {
    id: '3',
    numbering: 3,
    title: 'Sample Title 3',
    artist: 'Sample Artist 3',
    content: 'Sample content for song 3...',
    publishDate: new Date('2024-04-09'),
    newFlag: false,
    tags: ['Country', 'Folk'],
  },
  {
    id: '4',
    numbering: 4,
    title: 'Sample Title 4',
    artist: 'Sample Artist 4',
    content: 'Sample content for song 4...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Hip-hop', 'Rap'],
  },
  {
    id: '5',
    numbering: 5,
    title: 'Sample Title 5',
    artist: 'Sample Artist 5',
    content: 'Sample content for song 5...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Electronic', 'Dance'],
  },
  {
    id: '6',
    numbering: 6,
    title: 'Sample Title 6',
    artist: 'Sample Artist 6',
    content: 'Sample content for song 6...',
    publishDate: new Date('2024-04-07'),
    newFlag: false,
    tags: ['Blues', 'Jazz'],
  },
  {
    id: '7',
    numbering: 7,
    title: 'Sample Title 7',
    artist: 'Sample Artist 7',
    content: 'Sample content for song 7...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Classical', 'Opera'],
  },
  {
    id: '8',
    numbering: 8,
    title: 'Sample Title 8',
    artist: 'Sample Artist 8',
    content: 'Sample content for song 8...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Reggae', 'Ska'],
  },
  {
    id: '9',
    numbering: 9,
    title: 'Sample Title 9',
    artist: 'Sample Artist 9',
    content: 'Sample content for song 9...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Gospel', 'Spiritual'],
  },
  {
    id: '10',
    numbering: 10,
    title: 'Sample Title 10',
    artist: 'Sample Artist 10',
    content: 'Sample content for song 10...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Metal', 'Punk'],
  },
  {
    id: '11',
    numbering: 11,
    title: 'Sample Title 11',
    artist: 'Sample Artist 11',
    content: 'Sample content for song 11...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Indie', 'Alternative', 'Rock'],
  },
  {
    id: '12',
    numbering: 12,
    title: 'Sample Title 12',
    artist: 'Sample Artist 12',
    content: 'Sample content for song 12...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Funk', 'Disco'],
  },
  {
    id: '13',
    numbering: 13,
    title: 'Nem\'s Melody',
    artist: 'Nem',
    content: 'Sample content for Nem\'s song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Nem'],
  },
  {
    id: '14',
    numbering: 14,
    title: 'Mahavir\'s Chant',
    artist: 'Mahavir',
    content: 'Sample content for Mahavir\'s song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Mahavir', 'Nem'],
  },
  {
    id: '15',
    numbering: 15,
    title: 'Dhaja\'s Anthem',
    artist: 'Dhaja',
    content: 'Sample content for Dhaja\'s song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Dhaja'],
  },
  {
    id: '16',
    numbering: 16,
    title: 'Paras Gada\'s Groove',
    artist: 'Paras Gada',
    content: 'Sample content for Paras Gada\'s song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Paras Gada'],
  },
  {
    id: '17',
    numbering: 17,
    title: 'Managupta\'s Harmony',
    artist: 'Managupta',
    content: 'Sample content for Managupta\'s song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Managupta'],
  },
  {
    id: '18',
    numbering: 18,
    title: 'Nem\'s Dream',
    artist: 'Nem',
    content: 'Sample content for Nem\'s second song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Nem'],
  },
  {
    id: '19',
    numbering: 19,
    title: 'Mahavir\'s Reflection',
    artist: 'Mahavir',
    content: 'Sample content for Mahavir\'s second song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Mahavir'],
  },
  {
    id: '20',
    numbering: 20,
    title: 'Dhaja\'s Resonance',
    artist: 'Dhaja',
    content: 'Sample content for Dhaja\'s second song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Dhaja'],
  },
  {
    id: '21',
    numbering: 21,
    title: 'Paras Gada\'s Rhythm',
    artist: 'Paras Gada',
    content: 'Sample content for Paras Gada\'s second song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Paras Gada'],
  },
  {
    id: '22',
    numbering: 22,
    title: 'Managupta\'s Melody',
    artist: 'Managupta',
    content: 'Sample content for Managupta\'s second song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Managupta'],
  },
  {
    id: '23',
    numbering: 23,
    title: 'Nem\'s Harmony',
    artist: 'Nem',
    content: 'Sample content for Nem\'s third song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Nem'],
  },
  {
    id: '24',
    numbering: 24,
    title: 'Mahavir\'s Tune',
    artist: 'Mahavir',
    content: 'Sample content for Mahavir\'s third song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Mahavir'],
  },
  {
    id: '25',
    numbering: 25,
    title: 'Dhaja\'s Symphony',
    artist: 'Dhaja',
    content: 'Sample content for Dhaja\'s third song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Dhaja'],
  },
  {
    id: '26',
    numbering: 26,
    title: 'Paras Gada\'s Pulse',
    artist: 'Paras Gada',
    content: 'Sample content for Paras Gada\'s third song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Paras Gada'],
  },
  {
    id: '27',
    numbering: 27,
    title: 'Managupta\'s Ballad',
    artist: 'Managupta',
    content: 'Sample content for Managupta\'s third song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Managupta'],
  },
  {
    id: '28',
    numbering: 28,
    title: 'Nem\'s Lullaby',
    artist: 'Nem',
    content: 'Sample content for Nem\'s fourth song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Nem'],
  },
  {
    id: '29',
    numbering: 29,
    title: 'Mahavir\'s Verse',
    artist: 'Mahavir',
    content: 'Sample content for Mahavir\'s fourth song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Mahavir'],
  },
  {
    id: '30',
    numbering: 30,
    title: 'Dhaja\'s Overture',
    artist: 'Dhaja',
    content: 'Sample content for Dhaja\'s fourth song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Dhaja'],
  },
  {
    id: '301',
    numbering: 301,
    title: 'Paras Gada\'s Waltz',
    artist: 'Paras Gada',
    content: 'Sample content for Paras Gada\'s fourth song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Paras Gada'],
  },
  {
    id: '32',
    numbering: 32,
    title: 'Managupta\'s Aria',
    artist: 'Managupta',
    content: 'Sample content for Managupta\'s fourth song...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Managupta'],
  },
];

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
          itemNumbering: item.numbering.toString(),
          publishDate: publishDate.toISOString(), // Convert Date to string
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