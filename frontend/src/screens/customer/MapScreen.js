import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { Text, FAB, ActivityIndicator, Chip, Searchbar } from 'react-native-paper';
import MapView, { Marker, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { fetchFoodStalls } from '../../redux/actions/foodStallActions';

const { width, height } = Dimensions.get('window');

const MapScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { foodStalls, loading } = useSelector(state => state.foodStalls);
  
  const [region, setRegion] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const mapRef = useRef(null);
  
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }
      
      let location = await Location.getCurrentPositionAsync({});
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      
      setRegion(newRegion);
      
      // Fetch food stalls near the current location
      dispatch(fetchFoodStalls({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        radius: 10 // 10km radius
      }));
    })();
  }, [dispatch]);
  
  const handleMarkerPress = (foodStall) => {
    // Center the map on the selected marker
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: foodStall.location.latitude,
        longitude: foodStall.location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };
  
  const handleCalloutPress = (foodStall) => {
    navigation.navigate('FoodStallDetail', { stallId: foodStall.id });
  };
  
  const goToUserLocation = async () => {
    try {
      let location = await Location.getCurrentPositionAsync({});
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }, 1000);
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      setErrorMsg('Error getting your location');
    }
  };
  
  const handleSearch = (query) => {
    setSearchQuery(query);
  };
  
  const filterStalls = () => {
    let filtered = foodStalls;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(stall => 
        stall.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stall.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(stall => {
        // Assuming stalls have a categories array
        return stall.categories && stall.categories.includes(selectedCategory);
      });
    }
    
    return filtered;
  };
  
  const categories = ['Fast Food', 'Asian', 'Desserts', 'Drinks', 'Street Food'];
  
  if (!region) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search food stalls..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>
      
      <View style={styles.categoryContainer}>
        <View style={styles.chipContainer}>
          <Chip
            mode="outlined"
            selected={selectedCategory === null}
            onPress={() => setSelectedCategory(null)}
            style={styles.chip}
          >
            All
          </Chip>
          {categories.map(category => (
            <Chip
              key={category}
              mode="outlined"
              selected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
              style={styles.chip}
            >
              {category}
            </Chip>
          ))}
        </View>
      </View>
      
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {filterStalls().map(stall => (
          <Marker
            key={stall.id}
            coordinate={{
              latitude: stall.location.latitude,
              longitude: stall.location.longitude,
            }}
            title={stall.name}
            description={stall.description}
            onPress={() => handleMarkerPress(stall)}
            pinColor="#FF6B6B"
          >
            <Callout onPress={() => handleCalloutPress(stall)}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{stall.name}</Text>
                <Text style={styles.calloutRating}>
                  ★ {stall.average_rating.toFixed(1)} ({stall.review_count})
                </Text>
                <Text style={styles.calloutDescription} numberOfLines={2}>
                  {stall.description}
                </Text>
                <Text style={styles.calloutLink}>View Details</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
      
      <FAB
        style={styles.locationFab}
        icon="crosshairs-gps"
        onPress={goToUserLocation}
        small
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  searchContainer: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    zIndex: 5,
  },
  searchBar: {
    elevation: 4,
    borderRadius: 8,
  },
  categoryContainer: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    zIndex: 5,
    paddingHorizontal: 10,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    padding: 8,
  },
  chip: {
    margin: 4,
  },
  callout: {
    width: 200,
    padding: 8,
  },
  calloutTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 4,
  },
  calloutRating: {
    color: '#FFB400',
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  calloutLink: {
    color: '#FF6B6B',
    fontWeight: 'bold',
    fontSize: 12,
    marginTop: 4,
  },
  locationFab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80,
    backgroundColor: 'white',
  },
  errorText: {
    marginTop: 10,
    color: 'red',
    textAlign: 'center',
  },
});

export default MapScreen;