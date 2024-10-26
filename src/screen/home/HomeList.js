import React, {useState, useEffect} from 'react';
import {
  FlatList,
  Text,
  StyleSheet,
  View,
  SafeAreaView,
  Pressable,
  ActivityIndicator, // Loading indicator
  useColorScheme,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../theme/theme';
import {getFromAsyncStorage} from '../../config/dataService';

const HomeList = () => {
  const systemTheme = useColorScheme();
  const navigation = useNavigation();

  const [isDarkMode, setIsDarkMode] = useState(systemTheme === 'dark');
  const themeColors = isDarkMode ? colors.dark : colors.light;

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Update theme mode based on system changes
  useEffect(() => {
    setIsDarkMode(systemTheme === 'dark');
  }, [systemTheme]);

  // Fetch collections data
  const loadData = async () => {
    try {
      setIsLoading(true);
      const collections = await getFromAsyncStorage('collections'); // Fetch collection names
      // Sort collections by numbering in ascending order

      const sortedCollections = collections.sort(
        (a, b) => a.numbering - b.numbering,
      );
      setData(sortedCollections);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Handle item press
  const handleItemPress = item => {
    navigation.navigate('List', {
      collectionName: item.name,
      Tags: 'tirtankar',
      title: item.displayName || item.name,
    });
  };

  const ListItem = ({item, onItemPress, themeColors}) => (
    <Pressable
      onPress={() => onItemPress(item)}
      style={({pressed}) => [
        styles.itemContainer,
        {
          backgroundColor: pressed
            ? themeColors.surface
            : themeColors.background,
          borderBottomColor: themeColors.border,
        },
      ]}>
      <View style={styles.leftContainer}>
        <View style={styles.numberingContainer}>
          <Text
            style={[
              styles.numberingText,
              {backgroundColor: themeColors.primary, color: '#fff'},
            ]}>
            {item.numbering}
          </Text>
        </View>
        <View style={styles.detailsContainer}>
          <Text style={[styles.title, {color: themeColors.text}]}>
            {item.displayName}
          </Text>
        </View>
      </View>
    </Pressable>
  );

  // Show loading indicator while data is loading
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: themeColors.background,
        }}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: themeColors.background}}>
      <View style={{flex: 1}}>
        <FlatList
          contentContainerStyle={{backgroundColor: themeColors.background}}
          data={data}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => (
            <ListItem
              item={item}
              themeColors={themeColors}
              onItemPress={handleItemPress}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  itemContainer: {
    borderBottomWidth: 0.5,
    padding: 12,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  numberingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberingText: {
    marginRight: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    borderRadius: 20,
    width: 40,
    height: 40,
  },
  detailsContainer: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HomeList;
