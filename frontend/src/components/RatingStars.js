import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const RatingStars = ({ rating, size = 16, color = '#FFC107' }) => {
  // Convert rating to number and ensure it's between 0 and 5
  const normalizedRating = Math.min(5, Math.max(0, Number(rating) || 0));
  
  // Calculate full, half and empty stars
  const fullStars = Math.floor(normalizedRating);
  const halfStar = normalizedRating % 1 >= 0.5 ? 1 : 0;
  const emptyStars = 5 - fullStars - halfStar;
  
  return (
    <View style={styles.container}>
      {/* Full stars */}
      {[...Array(fullStars)].map((_, i) => (
        <Ionicons key={`full-${i}`} name="star" size={size} color={color} />
      ))}
      
      {/* Half star if needed */}
      {halfStar === 1 && (
        <Ionicons name="star-half" size={size} color={color} />
      )}
      
      {/* Empty stars */}
      {[...Array(emptyStars)].map((_, i) => (
        <Ionicons key={`empty-${i}`} name="star-outline" size={size} color={color} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
});

export default RatingStars;