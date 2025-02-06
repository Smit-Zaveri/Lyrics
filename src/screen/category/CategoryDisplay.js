import React, {useEffect, useState} from 'react';
import {View, Dimensions, useColorScheme} from 'react-native';
import ItemGrid from '../../component/ItemGrid';
import {getFromAsyncStorage} from '../../config/DataService';
import {colors} from '../../theme/Theme'; // Assuming you have a theme file with colors

const CategoryDisplay = ({navigation}) => {
  const [tirthData, setTirthData] = useState([]);
  const [artistData, setArtistData] = useState([]);
  const [tirtankarData, setTirtankarData] = useState([]);

  const systemTheme = useColorScheme(); // Detect system theme
  const [isDarkMode, setIsDarkMode] = useState(systemTheme === 'dark'); // Set theme based on system preference

  const themeColors = isDarkMode ? colors.dark : colors.light; // Use theme colors based on the theme mode

  const loadData = async () => {
    try {
      const fetchedDataTirths = await getFromAsyncStorage('tirth');
      const fetchedDataArtist = await getFromAsyncStorage('artists');
      const fetchedDataTirtankar = await getFromAsyncStorage('tirtankar');
      setTirthData(fetchedDataTirths);
      setArtistData(fetchedDataArtist);
      setTirtankarData(fetchedDataTirtankar);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    setIsDarkMode(systemTheme === 'dark');
  }, [systemTheme]);

  return (
    <View style={{flex: 1, backgroundColor: themeColors.background}}>
      <ItemGrid
        navigation={navigation}
        redirect={'List'}
        title="Tirth"
        data={tirthData}
        layout="single"
      />
      <ItemGrid
        navigation={navigation}
        redirect={'List'}
        title="24 Tirthenkar"
        data={tirtankarData}
        layout="single"
      />
      <ItemGrid
        navigation={navigation}
        redirect={'List'}
        title="Artist"
        data={artistData}
        layout="single"
      />
    </View>
  );
};

export default CategoryDisplay;
