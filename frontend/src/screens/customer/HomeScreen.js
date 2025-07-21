import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Text, Card, Title, Paragraph, ActivityIndicator, Searchbar, Chip } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

import { fetchFoodStalls } from '../../redux/actions/foodStallActions';
import FoodStallCard from '../../components/FoodStallCard';

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { foodStalls, loading } = useSelector(state => state.foodStalls);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    getLocationAndFetchStalls();
  }, []);

  const getLocationAndFetchStalls = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
        // Fetch food stalls without location filter
        dispatch(fetchFoodStalls());
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      
      // Fetch food stalls with location filter
      dispatch(fetchFoodStalls({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        radius: 10 // 10km radius
      }));
    } catch (error) {
      setLocationError('Error getting location');
      // Fetch food stalls without location filter
      dispatch(fetchFoodStalls());
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    getLocationAndFetchStalls().then(() => setRefreshing(false));
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

  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Food Stalls Near You</Text>
        <Searchbar
          placeholder="Search food stalls..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
        />

        <FlatList
          horizontal
          data={['All', ...categories]}
          keyExtractor={(item) => item}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <Chip
              mode="outlined"
              selected={selectedCategory === item || (item === 'All' && !selectedCategory)}
              onPress={() => setSelectedCategory(item === 'All' ? null : item)}
              style={styles.chip}
            >
              {item}
            </Chip>
          )}
          style={styles.categoryList}
        />
      </View>

      {locationError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {locationError}. Showing all food stalls.
          </Text>
        </View>
      )}

      {filterStalls().length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="restaurant-outline" size={64} color="#ccc" />
          <Text style={styles.noResultsText}>No food stalls found</Text>
        </View>
      ) : (
        <FlatList
          data={filterStalls()}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FoodStallCard
              foodStall={item}
              onPress={() => navigation.navigate('FoodStallDetail', { stallId: item.id })}
            />
          )}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  searchBar: {
    marginBottom: 12,
    elevation: 0,
    backgroundColor: '#f0f0f0',
  },
  categoryList: {
    marginBottom: 8,
  },
  chip: {
    marginRight: 8,
  },
  listContent: {
    padding: 16,
  },
  errorContainer: {
    padding: 8,
    backgroundColor: '#FFE5E5',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 4,
  },
  errorText: {
    color: '#D32F2F',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noResultsText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
  },
});

export default HomeScreen;