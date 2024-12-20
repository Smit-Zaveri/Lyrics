import React, { useEffect, useState } from 'react';
import { View, Dimensions, useColorScheme } from 'react-native';
import SingleRow from './SingleRow';
import { getFromAsyncStorage } from '../../config/DataService';
import { colors } from '../../theme/Theme'; // Assuming you have a theme file with colors

const { height } = Dimensions.get('window');

const CategoryDisplay = ({ navigation }) => {
  const [tirthData, setTirthData] = useState([]);
  const [artistData, setArtistData] = useState([]);
  const [tirtankarData, setTirtankarData] = useState([]);

  const systemTheme = useColorScheme(); // Detect system theme
  const [isDarkMode, setIsDarkMode] = useState(systemTheme === 'dark'); // Set theme based on system preference

  const themeColors = isDarkMode ? colors.dark : colors.light; // Use theme colors based on the theme mode

  const loadData = async () => {
    try {
      const fetchedDataTirths = await getFromAsyncStorage("tirth");
      const fetchedDataArtist = await getFromAsyncStorage("artists");
      const fetchedDataTirtankar = await getFromAsyncStorage("tirtankar");
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
    <View
      style={{
        flex: 1,
        justifyContent: 'space-between',
        height,
        backgroundColor: themeColors.background, // Use dynamic background color
      }}>
      <SingleRow
        navigation={navigation}
        redirect={'List'}
        title="Tirth"
        data={tirthData}
        themeColors={themeColors} // Pass themeColors to SingleRow if necessary
      />
      <SingleRow
        navigation={navigation}
        redirect={'List'}
        title="24 Tirthenkar"
        data={tirtankarData}
        themeColors={themeColors} // Pass themeColors to SingleRow if necessary
      />
      <SingleRow
        navigation={navigation}
        title="Artist"
        redirect={'List'}
        data={artistData}
        themeColors={themeColors} // Pass themeColors to SingleRow if necessary
      />
    </View>
  );
};

export default CategoryDisplay;
