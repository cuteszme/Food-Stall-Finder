import React from 'react';
import { StyleSheet, View, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Card, Title, Paragraph, Text } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import RatingStars from './RatingStars';

const { width } = Dimensions.get('window');

const FoodStallCard = ({ foodStall, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Card style={styles.card}>
        <Image
          source={{ uri: foodStall.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
        <Card.Content style={styles.content}>
          <Title style={styles.title} numberOfLines={1}>
            {foodStall.name}
          </Title>
          
          <View style={styles.ratingContainer}>
            <RatingStars rating={foodStall.average_rating} size={16} />
            <Text style={styles.reviewCount}>
              ({foodStall.review_count})
            </Text>
          </View>
          
          <Paragraph style={styles.description} numberOfLines={2}>
            {foodStall.description}
          </Paragraph>
          
          {foodStall.distance && (
            <View style={styles.distanceContainer}>
              <Ionicons name="location-outline" size={14} color="#666" />
              <Text style={styles.distance}>
                {foodStall.distance.toFixed(1)} km away
              </Text>
            </View>
          )}
          
          {foodStall.location && foodStall.location.address && (
            <Text style={styles.address} numberOfLines={1}>
              {foodStall.location.address}
            </Text>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  image: {
    width: '100%',
    height: 160,
  },
  content: {
    padding: 12,
  },
  title: {
    fontSize: 18,
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewCount: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#444',
    marginBottom: 8,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  distance: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  address: {
    fontSize: 12,
    color: '#888',
  },
});

export default FoodStallCard;