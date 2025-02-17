import React, { useContext, useEffect, useState } from 'react';
import {View, Dimensions} from 'react-native';
import ItemGrid from '../../components/ItemGrid';
import {getFromAsyncStorage} from '../../config/DataService';
import { ThemeContext } from '../../../App';

const CategoryDisplay = ({navigation}) => {
  const { themeColors } = useContext(ThemeContext);
  const [tirthData, setTirthData] = useState([]);
  const [artistData, setArtistData] = useState([]);
  const [tirtankarData, setTirtankarData] = useState([]);

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
