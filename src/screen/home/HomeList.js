import React, {useState, useEffect, useCallback} from 'react';
import {
  FlatList,
  Text,
  StyleSheet,
  View,
  SafeAreaView,
  Pressable,
  useColorScheme,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {colors} from '../../theme/theme';

const HomeList = () => {
  const systemTheme = useColorScheme();
  const navigation = useNavigation();

  const [isDarkMode, setIsDarkMode] = useState(systemTheme === 'dark');

  const themeColors = isDarkMode ? colors.dark : colors.light;

  // Handle theme change dynamically when system theme changes
  useEffect(() => {
    setIsDarkMode(systemTheme === 'dark');
  }, [systemTheme]);

  const data = [
    {id: '1', displayName: 'ગીત', collection: 'lyrics'},
    {id: '2', displayName: 'ચૈત્યવંદન', collection: 'chaityavandan'},
    {id: '3', displayName: 'સ્તુતિ', collection: 'Stuti'},
    {id: '4', displayName: 'સ્તવન', collection: 'Stavana'},
    {id: '5', displayName: 'સજઝાય', collection: 'Sajajhaya'},
    {id: '6', displayName: 'થોય', collection: 'Thoya'},
    {id: '7', displayName: 'પચ્ચક્ખાણ', collection: 'pachkhan'},
    {id: '8', displayName: 'અન્ય', collection: 'other'},
  ];

  const handleItemPress = item => {
    navigation.navigate('List', {
      collectionName: item.collection,
      Tags: 'tirtankar',
      title: item.displayName ? item.displayName : item.name,
    });
  };

  const ListItem = ({item, onItemPress, themeColors}) => {
    return (
      <Pressable
        onPress={() => onItemPress(item)}
        style={({pressed}) => [
          styles.itemContainer,
          {
            backgroundColor: pressed
              ? themeColors.surface
              : themeColors.background, // Dynamically change background on press based on theme
            borderBottomColor: themeColors.border, // Border color from theme
          },
        ]}>
        <View style={styles.leftContainer}>
          <View style={styles.numberingContainer}>
            <Text
              style={[
                styles.numberingText,
                {
                  backgroundColor: themeColors.primary, // Use primary theme color for numbering
                  color: '#fff', // White text for numbering
                },
              ]}>
              {item.id}
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
  };

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: themeColors.background}}>
      <View style={{flex: 1}}>
        <FlatList
          contentContainerStyle={{
            backgroundColor: themeColors.background,
          }}
          data={data}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => (
            <ListItem
              item={item}
              themeColors={themeColors}
              onItemPress={handleItemPress}
            />
          )}
          initialNumToRender={8} // Optimize initial render for better performance
          removeClippedSubviews={true} // Improves performance by unmounting off-screen items
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
