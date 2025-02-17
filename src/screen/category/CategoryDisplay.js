import React, { useContext, useEffect, useState } from 'react';
import {View, ScrollView, Dimensions} from 'react-native';
import ItemGrid from '../../components/ItemGrid';
import {getFromAsyncStorage} from '../../config/DataService';
import { ThemeContext } from '../../../App';

const CategoryDisplay = ({navigation}) => {
  const { themeColors } = useContext(ThemeContext);
  const [tirthData, setTirthData] = useState([]);
  const [artistData, setArtistData] = useState([]);
  const [tirtankarData, setTirtankarData] = useState([]);

  const formatData = (data, startIndex = 0) => {
    if (!Array.isArray(data)) return [];
    return data.map((item, index) => ({
      ...item,
      name: item.name || item.displayName || '',
      displayName: item.displayName || item.name || '',
      numbering: item.numbering || startIndex + index + 1,
    }));
  };

  const loadData = async () => {
    try {
      const fetchedDataTirths = await getFromAsyncStorage('tirth');
      const fetchedDataArtist = await getFromAsyncStorage('artists');
      const fetchedDataTirtankar = await getFromAsyncStorage('tirtankar');
      
      setTirthData(formatData(fetchedDataTirths));
      setArtistData(formatData(fetchedDataArtist));
      setTirtankarData(formatData(fetchedDataTirtankar));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <View style={{flex: 1, backgroundColor: themeColors.background}}>
      <ScrollView 
        contentContainerStyle={{
          flexGrow: 1, 
          paddingVertical: 10,
          paddingHorizontal: 5,
          minHeight: Dimensions.get('window').height * 0.5
        }}
        showsVerticalScrollIndicator={true}
      >
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
      </ScrollView>
    </View>
  );
};

export default CategoryDisplay;
