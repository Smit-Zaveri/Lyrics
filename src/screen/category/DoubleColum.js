import React from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';
import { colors } from '../../theme/theme'; // Assuming you have a theme file with colors

const DoubleColumn = ({ route, navigation }) => {
  const { data, title, redirect } = route.params;

  // Detect system theme
  const systemTheme = useColorScheme();
  const isDarkMode = systemTheme === 'dark';
  const themeColors = isDarkMode ? colors.dark : colors.light;

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: title,
    });
  }, [navigation, title]);

  // Sort data based on a numerical property, e.g., 'numbering'
  const sortedData = data.sort((a, b) => a.numbering - b.numbering);

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <TouchableOpacity
        onPress={() => {
          navigation.navigate(redirect, {
            collectionName: item.name,
            Tags: (() => {
              switch (title) {
                case 'Tags':
                  return 'tirtankar';
                case 'Artists':
                  return 'artists';
                case '24 Tirthenkar':
                  return 'collections';
                default:
                  return 'tags';
              }
            })(),
            title: item.displayName ? item.displayName : item.name,
          });
        }}
        style={styles.touchableItem}
      >
        {item.picture ? (
          <Image source={{ uri: item.picture }} style={styles.imageStyle} />
        ) : (
          <View style={[styles.placeholderImage, { backgroundColor: themeColors.surface }]}>
            <Text style={[styles.placeholderText, { color: themeColors.text }]}>
              {item.name.charAt(0)}
            </Text>
          </View>
        )}
        <Text style={[styles.itemText, { color: themeColors.text }]}>
          {item.displayName ? item.displayName : item.name}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <FlatList
        data={sortedData}
        renderItem={renderItem}
        numColumns={3}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={styles.flatListContainer}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flatListContainer: {
    padding: 10,
  },
  itemContainer: {
    flex: 1,
    margin: 5,
    alignItems: 'center',
  },
  touchableItem: {
    alignItems: 'center',
  },
  imageStyle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontWeight: '200',
  },
  itemText: {
    fontWeight: '200',
    marginTop: 5,
    textAlign: 'center',
  },
});

export default DoubleColumn;
