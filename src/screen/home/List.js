import React, {
  useState,
  useCallback,
  useLayoutEffect,
  useRef,
  useMemo,
  useEffect,
} from 'react';
import {SearchBar} from '@rneui/themed';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  FlatList,
  SafeAreaView,
  Text,
  PixelRatio,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  View,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const phoneFontScale = PixelRatio.getFontScale();

const sampleLyrics = [
  {
    id: '1',
    numbering: 1,
    title: 'Sample Title 1',
    artist: 'Sample Artist 1',
    content: 'Sample content for song 1...',
    publishDate: new Date(),
    newFlag: false,
    tags: ['Pop', 'Rock'],
    youtube: 'hey',
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
    publishDate: new Date(),
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
    publishDate: new Date(),
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
];

const sampleTags = [
  {id: '1', name: 'Pop'},
  {id: '2', name: 'Rock'},
  {id: '3', name: 'R&B'},
  {id: '4', name: 'Soul'},
  {id: '5', name: 'Country'},
  {id: '6', name: 'Folk'},
  {id: '7', name: 'Hip-hop'},
  {id: '8', name: 'Rap'},
  {id: '9', name: 'Electronic'},
  {id: '10', name: 'Dance'},
  {id: '11', name: 'Blues'},
  {id: '12', name: 'Jazz'},
  {id: '13', name: 'Classical'},
  {id: '14', name: 'Opera'},
  {id: '15', name: 'Reggae'},
  {id: '16', name: 'Ska'},
  {id: '17', name: 'Gospel'},
  {id: '18', name: 'Spiritual'},
  {id: '19', name: 'Metal'},
  {id: '20', name: 'Punk'},
  {id: '21', name: 'Indie'},
  {id: '22', name: 'Alternative'},
  {id: '23', name: 'Funk'},
  {id: '24', name: 'Disco'},
];

const List = () => {
  const [searchText, setSearchText] = useState('');
  const searchRef = useRef(null);
  const navigation = useNavigation();
  const [header, setHeader] = useState(true);
  const [lyrics, setLyrics] = useState(sampleLyrics);
  const [tags, setTags] = useState(sampleTags);
  const [selectedTags, setSelectedTags] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Added setFilteredLyrics state
  const [filteredLyrics, setFilteredLyrics] = useState([]);

  const filterData = useCallback(
    text => {
      if (text) {
        return lyrics.filter(
          item =>
            item.title.toLowerCase().includes(text.toLowerCase()) ||
            item.artist.toLowerCase().includes(text.toLowerCase()) ||
            item.numbering.toString().includes(text.toString()) ||
            item.tags.some(tag =>
              tag.toLowerCase().includes(text.toLowerCase()),
            ) ||
            item.content.toLowerCase().includes(text.toLowerCase()),
        );
      }
      return lyrics;
    },
    [lyrics],
  );

  const handleSearch = useCallback(
    text => {
      setSearchText(text);
      const filteredItems = filterData(text);
      setFilteredLyrics(filteredItems);
    },
    [filterData],
  );

  const handleTagPress = useCallback(
    tag => {
      const newSelectedTags = selectedTags.includes(tag)
        ? selectedTags.filter(selectedTag => selectedTag !== tag)
        : [...selectedTags, tag];
      setSelectedTags(newSelectedTags);

      const filteredItems = lyrics.filter(item => {
        return (
          newSelectedTags.every(selectedTag =>
            item.tags.includes(selectedTag),
          ) && item.title.toLowerCase().includes(searchText.toLowerCase())
        );
      });

      setFilteredLyrics(filteredItems);
    },
    [selectedTags, lyrics, searchText],
  );

  const renderTags = ({item}) => (
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

  const renderListItem = ({item}) => {
    const {id, numbering, title, content, publishDate, newFlag} = item;

    const currentDate = new Date();
    const publishDateTime = publishDate;
    const timeDiff = Math.ceil(
      (currentDate - publishDateTime) / (1000 * 60 * 60 * 24),
    );

    const numberingText =
      newFlag && timeDiff >= 0 && timeDiff < 7 ? 'NEW' : numbering.toString();

    return (
      <Pressable
        onPress={() => {
          navigation.navigate('Details', {
            item: {
              ...item,
              publishDate: publishDate.toISOString(), // Convert Date to string
            },
          });
          setSearchText('');
          setHeader(true);
        }}
        style={{marginHorizontal: 5}}>
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
          <View style={{height: 40}}>
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
          <View style={{flex: 1}}>
            <Text style={{fontWeight: 'bold', fontSize: 16 * phoneFontScale}}>
              {title}
            </Text>
            <Text style={{fontSize: 14 * phoneFontScale}} numberOfLines={1}>
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
    if (selectedTags.length > 0) {
      const initialFilteredItems = lyrics.filter(item => {
        return (
          selectedTags.every(selectedTag => item.tags.includes(selectedTag)) &&
          item.title.toLowerCase().includes(searchText.toLowerCase())
        );
      });
      setFilteredLyrics(initialFilteredItems);
    } else {
      setFilteredLyrics(lyrics);
    }
  }, [selectedTags, lyrics, searchText]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Icon
          name="search"
          color="#fff"
          onPress={() => {
            setHeader(prevState => !prevState);
            if (searchRef.current) {
              searchRef.current.focus();
            }
          }}
          size={26}
        />
      ),
      headerShown: header,
    });
  }, [navigation, header]);

  return (
    <SafeAreaView>
      {header ? null : (
        <SearchBar
          ref={searchRef}
          placeholder="Type Here..."
          onChangeText={handleSearch}
          platform={Platform.OS}
          autoFocus={true}
          onCancel={() => {
            setHeader(true);
            if (searchRef.current) {
              searchRef.current.blur();
            }
          }}
          onClear={() => {
            setHeader(true);
            if (searchRef.current) {
              searchRef.current.blur();
            }
          }}
          showCancel={true}
          searchIcon={true}
          dropShadowed={true}
          visibleInitially={false}
          persistent={false}
          enableSuggestion={false}
          entryAnimation="from-right-side"
          topOffset={1}
          iconColor="#673AB7"
        />
      )}
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
