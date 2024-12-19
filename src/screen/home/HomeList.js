import React, {useState, useEffect, useCallback, useMemo} from 'react';
import {
  FlatList,
  Text,
  StyleSheet,
  View,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  useColorScheme,
  RefreshControl,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../theme/theme';
import {getFromAsyncStorage} from '../../config/dataService';

const HomeList = () => {
  const systemTheme = useColorScheme();
  const navigation = useNavigation();

  const themeColors = useMemo(
    () => (systemTheme === 'dark' ? colors.dark : colors.light),
    [systemTheme],
  );

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    setRefreshing(true);
    try {
      const collections = await getFromAsyncStorage('collections');
      setData(
        collections.sort((a, b) => a.numbering - b.numbering), // Sort only if necessary
      );
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleItemPress = useCallback(
    item => () => {
      navigation.navigate('List', {
        collectionName: item.name,
        Tags: 'tirtankar',
        title: item.displayName || item.name,
      });
    },
    [navigation],
  );

  const renderItem = useMemo(
    () =>
      ({item}) => (
        <Pressable
          onPress={handleItemPress(item)}
          style={({pressed}) => [
            styles.itemContainer,
            {
              backgroundColor: pressed
                ? themeColors.surface
                : themeColors.background,
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
      ),
    [themeColors, handleItemPress],
  );

  if (isLoading) {
    return (
      <View
        style={[styles.centered, {backgroundColor: themeColors.background}]}>
        <ActivityIndicator size="large" color={themeColors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.flex, {backgroundColor: themeColors.background}]}>
      <FlatList
        contentContainerStyle={{backgroundColor: themeColors.background}}
        data={data}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={loadData} />
        }
        getItemLayout={(data, index) => ({
          length: 70,
          offset: 70 * index,
          index,
        })}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  flex: {flex: 1},
  centered: {flex: 1, justifyContent: 'center', alignItems: 'center'},
  itemContainer: {
    borderBottomWidth: 0.5,
    padding: 12,
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftContainer: {flexDirection: 'row', alignItems: 'center', flex: 1},
  numberingContainer: {justifyContent: 'center', alignItems: 'center'},
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
  detailsContainer: {flex: 1},
  title: {fontWeight: 'bold', fontSize: 16},
});

export default HomeList;
