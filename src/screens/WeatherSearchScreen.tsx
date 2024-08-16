import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import getWeatherImage from '../helpers/getWeatherImage';
import {LocationResult, WeatherData} from '../api/type';
import {fetchAreaWeatherSearch, fetchWeatherDetails} from '../api/API';

const WeatherSearchScreen: React.FC = () => {
  const [location, setLocation] = useState<string>('Oslo');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<LocationResult[]>([]);
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  useEffect(() => {
    fetchWeatherData(location);
  }, [location]);

  const fetchWeatherData = async (locationName: string) => {
    try {
      const geoResponse: LocationResult[] = await fetchAreaWeatherSearch(
        locationName,
      );
      const {latitude, longitude} = geoResponse[0];
      const weatherResponse = await fetchWeatherDetails(latitude, longitude);
      if (weatherResponse) {
        const dailyData = weatherResponse.data.daily;

        const parsedData = dailyData.time.map(
          (date: string, index: number) => ({
            date,
            temperature_2m_max: dailyData.temperature_2m_max[index],
            temperature_2m_min: dailyData.temperature_2m_min[index],
            weathercode: dailyData.weathercode[index],
          }),
        );

        setWeatherData(parsedData);
      } else {
        Alert.alert('Warning', 'Failed to load weather data');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load weather data');
    }
  };

  const fetchSearchResults = async (query: string) => {
    if (query.length < 3) {
      setShowDropdown(false);
      return;
    }
    try {
      const response = await fetchAreaWeatherSearch(query);
      setSearchResults(response);
      setShowDropdown(true);
    } catch (error) {
      Alert.alert('Error', 'Failed to load location data');
    }
  };

  const selectLocation = (locationName: string) => {
    setLocation(locationName);
    setSearchQuery(locationName);
    setShowDropdown(false);
    fetchWeatherData(locationName);
  };

  const renderForecastItem = ({item}: {item: WeatherData}) => {
    const getImage = getWeatherImage(item.weathercode);

    return (
      <View style={styles.forecastItem}>
        <View>
          <Text style={styles.weahtherDate}>{item.date}</Text>
          <Text style={styles.weahtherDate}>{getImage.day.description}</Text>
        </View>
        <Image
          source={{
            uri: `${getImage.day.image.replace('http', 'https')}`,
          }}
          style={styles.weatherImage}
        />
        <Text style={styles.weahtherDate}>
          {Math.round((item.temperature_2m_max + item.temperature_2m_min) / 2)}
          °C
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search location..."
          value={searchQuery}
          onChangeText={text => {
            setSearchQuery(text);
            fetchSearchResults(text);
          }}
        />
      </View>

      {showDropdown && (
        <FlatList
          data={searchResults}
          keyExtractor={item => item.id.toString()}
          renderItem={({item}) => (
            <TouchableOpacity onPress={() => selectLocation(item.name)}>
              <Text
                style={
                  styles.locationItem
                }>{`${item.admin1},${item.admin2} `}</Text>
            </TouchableOpacity>
          )}
          style={styles.dropdown}
        />
      )}

      <Text style={styles.locationName}>{location}</Text>
      <FlatList
        data={weatherData}
        renderItem={renderForecastItem}
        keyExtractor={item => item.date}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  searchContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: 4,
    borderBottomWidth: 1,
    borderColor: '#000000',
    marginTop: Platform.OS === 'ios' ? 35 : 0,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    padding: 10,
    fontSize: 16,
  },
  dropdown: {
    maxHeight: 200,
    borderColor: 'grey',
    borderWidth: 1,
    borderRadius: 4,
    marginBottom: 10,
  },
  locationItem: {
    padding: 10,
    borderBottomWidth: 1,
    color: '#000000',
    borderColor: '#000000',
  },
  locationName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#000000',
  },

  weahtherDate: {
    fontSize: 20,
    color: '#000000',
  },
  forecastItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderColor: '#000000',
  },
  weatherImage: {
    width: 60,
    height: 60,
  },
});

export default WeatherSearchScreen;
