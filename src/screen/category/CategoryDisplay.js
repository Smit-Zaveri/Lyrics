import React, {useContext, useEffect, useState} from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import ItemGrid from '../../components/ItemGrid';
import CategorySkeleton from '../../components/CategorySkeleton';
import {getFromAsyncStorage} from '../../config/dataService';
import {ThemeContext} from '../../../App';
import {LanguageContext} from '../../context/LanguageContext';

const CategoryDisplay = ({navigation}) => {
  const {themeColors} = useContext(ThemeContext);
  const {getString, language} = useContext(LanguageContext); // Add language here
  const [tirthData, setTirthData] = useState([]);
  const [artistData, setArtistData] = useState([]);
  const [tirtankarData, setTirtankarData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const formatData = (data, startIndex = 0) => {
    if (!Array.isArray(data)) return [];
    return data.map((item, index) => {
      // Get localized display name if available
      let displayName = item.displayName;
      if (Array.isArray(item.displayName)) {
        displayName = getString(item.displayName);
      }

      return {
        ...item,
        name: item.name || displayName || '',
        displayName: displayName || item.name || '',
        numbering: item.numbering || startIndex + index + 1,
      };
    });
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      const fetchedDataTirths = await getFromAsyncStorage('tirth');
      const fetchedDataArtist = await getFromAsyncStorage('artists');
      const fetchedDataTirtankar = await getFromAsyncStorage('tirtankar');

      setTirthData(formatData(fetchedDataTirths));
      setArtistData(formatData(fetchedDataArtist));
      setTirtankarData(formatData(fetchedDataTirtankar));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadData().finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    loadData();
  }, [language]); // Add language dependency to refresh data when language changes

  // Get localized section titles
  const titles = {
    tirth: ['તીર્થ', 'तीर्थ', 'Tirth'],
    tirthankar: ['24 તીર્થંકર', '24 तीर्थंकर', '24 Tirthankar'],
    artist: ['કલાકારો', 'कलाकार', 'Artists'],
  };

  return (
    <View style={[styles.container, {backgroundColor: themeColors.background}]}>
      {isLoading ? (
        <CategorySkeleton themeColors={themeColors} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[themeColors.primary]}
              tintColor={themeColors.primary}
            />
          }>
          <ItemGrid
            key={`tirth-${language}`}
            navigation={navigation}
            redirect={'List'}
            title={titles.tirth}
            data={tirthData}
            layout="single"
            language={language}
          />
          <ItemGrid
            key={`tirthankar-${language}`}
            navigation={navigation}
            redirect={'List'}
            title={titles.tirthankar}
            data={tirtankarData}
            layout="single"
            language={language}
          />
          <ItemGrid
            key={`artist-${language}`}
            navigation={navigation}
            redirect={'List'}
            title={titles.artist}
            data={artistData}
            layout="single"
            language={language}
          />
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 8,
    paddingBottom: 20,
    minHeight: Dimensions.get('window').height * 0.5,
  },
});

export default CategoryDisplay;
