import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Text, Button, Card, Divider, Chip, ActivityIndicator, Menu, List } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker } from 'react-native-maps';

import { fetchFoodStallDetails } from '../../redux/actions/foodStallActions';
import { fetchMenuItems } from '../../redux/actions/menuActions';
import { fetchReviews } from '../../redux/actions/reviewActions';
import ReviewItem from '../../components/ReviewItem';
import MenuItem from '../../components/MenuItem';
import RatingStars from '../../components/RatingStars';

const FoodStallDetailScreen = ({ route, navigation }) => {
  const { stallId } = route.params;
  const dispatch = useDispatch();
  const { foodStall, loading } = useSelector(state => state.foodStallDetails);
  const { menuItems, loading: menuLoading } = useSelector(state => state.menu);
  const { reviews, loading: reviewsLoading } = useSelector(state => state.reviews);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showReviews, setShowReviews] = useState(false);

  useEffect(() => {
    dispatch(fetchFoodStallDetails(stallId));
    dispatch(fetchMenuItems(stallId));
    dispatch(fetchReviews(stallId));
  }, [dispatch, stallId]);

  const getCategories = () => {
    if (!menuItems) return [];
    const categories = [...new Set(menuItems.map(item => item.category))];
    return categories;
  };

  const filteredMenuItems = selectedCategory 
    ? menuItems?.filter(item => item.category === selectedCategory)
    : menuItems;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }

  if (!foodStall) {
    return (
      <View style={styles.centered}>
        <Text>Food stall not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={{ uri: foodStall.image_url }} 
        style={styles.headerImage} 
        resizeMode="cover"
      />
      
      <View style={styles.detailsContainer}>
        <Text style={styles.stallName}>{foodStall.name}</Text>
        
        <View style={styles.ratingContainer}>
          <RatingStars rating={foodStall.average_rating} size={20} />
          <Text style={styles.reviewCount}>
            ({foodStall.review_count} {foodStall.review_count === 1 ? 'review' : 'reviews'})
          </Text>
          <TouchableOpacity 
            onPress={() => navigation.navigate('Review', { stallId: foodStall.id })}
            style={styles.writeReviewButton}
          >
            <Text style={styles.writeReviewText}>Write a Review</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.description}>{foodStall.description}</Text>
        
        <View style={styles.locationContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: foodStall.location.latitude,
              longitude: foodStall.location.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker
              coordinate={{
                latitude: foodStall.location.latitude,
                longitude: foodStall.location.longitude,
              }}
              title={foodStall.name}
            />
          </MapView>
          <Text style={styles.address}>{foodStall.location.address}</Text>
          <Button 
            mode="contained" 
            icon="navigation" 
            onPress={() => {
              // Open in maps app
            }}
            style={styles.directionsButton}
          >
            Get Directions
          </Button>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Menu</Text>
          
          {menuLoading ? (
            <ActivityIndicator size="small" color="#FF6B6B" />
          ) : menuItems?.length === 0 ? (
            <Text style={styles.noDataText}>No menu items available</Text>
          ) : (
            <>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.categoryScroll}
              >
                <Chip
                  mode="outlined"
                  selected={selectedCategory === null}
                  onPress={() => setSelectedCategory(null)}
                  style={styles.categoryChip}
                >
                  All
                </Chip>
                {getCategories().map(category => (
                  <Chip
                    key={category}
                    mode="outlined"
                    selected={selectedCategory === category}
                    onPress={() => setSelectedCategory(category)}
                    style={styles.categoryChip}
                  >
                    {category}
                  </Chip>
                ))}
              </ScrollView>
              
              {filteredMenuItems?.map(item => (
                <MenuItem key={item.id} item={item} />
              ))}
            </>
          )}
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.reviewsSection}>
          <View style={styles.reviewsHeader}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <TouchableOpacity onPress={() => setShowReviews(!showReviews)}>
              <Text style={styles.toggleText}>
                {showReviews ? 'Hide' : 'Show All'}
              </Text>
            </TouchableOpacity>
          </View>
          
          {reviewsLoading ? (
            <ActivityIndicator size="small" color="#FF6B6B" />
          ) : reviews?.length === 0 ? (
            <Text style={styles.noDataText}>No reviews yet</Text>
          ) : (
            <View>
              {(showReviews ? reviews : reviews.slice(0, 3)).map(review => (
                <ReviewItem key={review.id} review={review} />
              ))}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImage: {
    width: '100%',
    height: 200,
  },
  detailsContainer: {
    padding: 16,
  },
  stallName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  reviewCount: {
    marginLeft: 8,
    color: '#666',
  },
  writeReviewButton: {
    marginLeft: 'auto',
  },
  writeReviewText: {
    color: '#FF6B6B',
    fontWeight: '500',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    marginBottom: 16,
  },
  locationContainer: {
    marginBottom: 16,
  },
  map: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  address: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  directionsButton: {
    marginTop: 8,
    backgroundColor: '#4ECDC4',
  },
  divider: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryChip: {
    marginRight: 8,
  },
  noDataText: {
    color: '#999',
    fontStyle: 'italic',
    marginVertical: 16,
    textAlign: 'center',
  },
  reviewsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  toggleText: {
    color: '#FF6B6B',
    fontWeight: '500',
  },
  reviewsSection: {
    marginBottom: 24,
  },
  menuSection: {
    marginBottom: 16,
  },
});

export default FoodStallDetailScreen;