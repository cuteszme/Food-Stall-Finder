import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, HelperText, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { createReview, updateReview, fetchReviews } from '../../redux/actions/reviewActions';
import { fetchFoodStallDetails } from '../../redux/actions/foodStallActions';

const ReviewScreen = ({ route, navigation }) => {
  const { stallId, reviewId } = route.params;
  const isEditing = !!reviewId;
  
  const dispatch = useDispatch();
  const { reviews, loading, error } = useSelector(state => state.reviews);
  const { foodStall } = useSelector(state => state.foodStallDetails);
  
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  useEffect(() => {
    dispatch(fetchFoodStallDetails(stallId));
    dispatch(fetchReviews(stallId));
  }, [dispatch, stallId]);
  
  useEffect(() => {
    // If editing an existing review, populate the form
    if (isEditing && reviews) {
      const existingReview = reviews.find(review => review.id === reviewId);
      if (existingReview) {
        setRating(existingReview.rating);
        setComment(existingReview.comment);
      }
    }
  }, [isEditing, reviewId, reviews]);
  
  const validateForm = () => {
    if (rating === 0) {
      setErrorMessage('Please select a rating');
      return false;
    }
    
    if (!comment.trim()) {
      setErrorMessage('Please enter a comment');
      return false;
    }
    
    setErrorMessage('');
    return true;
  };
  
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    
    const reviewData = {
      rating,
      comment
    };
    
    if (isEditing) {
      dispatch(updateReview(reviewId, reviewData, () => {
        navigation.goBack();
      }));
    } else {
      dispatch(createReview(stallId, reviewData, () => {
        navigation.goBack();
      }));
    }
  };
  
  if (loading && !reviews) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#FF6B6B" />
      </View>
    );
  }
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {isEditing ? 'Edit Your Review' : 'Write a Review'}
        </Text>
        
        {foodStall && (
          <Text style={styles.stallName}>
            for {foodStall.name}
          </Text>
        )}
        
        <View style={styles.ratingContainer}>
          <Text style={styles.ratingLabel}>Your Rating:</Text>
          <View style={styles.starsContainer}>
            {[1, 2, 3, 4, 5].map(star => (
              <TouchableOpacity
                key={star}
                onPress={() => setRating(star)}
                style={styles.starButton}
              >
                <Ionicons
                  name={rating >= star ? 'star' : 'star-outline'}
                  size={36}
                  color={rating >= star ? '#FFB400' : '#ccc'}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingText}>
            {rating > 0 ? (
              <>
                <Text style={styles.ratingValue}>{rating}</Text> out of 5
              </>
            ) : 'Tap a star to rate'}
          </Text>
        </View>
        
        <TextInput
          label="Your Review"
          value={comment}
          onChangeText={setComment}
          multiline
          numberOfLines={6}
          style={styles.input}
          placeholder="Share your experience with this food stall..."
        />
        
        {(errorMessage || error) && (
          <HelperText type="error" style={styles.errorText}>
            {errorMessage || error}
          </HelperText>
        )}
        
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          loading={loading}
          disabled={loading}
        >
          {isEditing ? 'Update Review' : 'Submit Review'}
        </Button>
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
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  stallName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  ratingContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  starButton: {
    padding: 4,
  },
  ratingText: {
    color: '#666',
  },
  ratingValue: {
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  errorText: {
    textAlign: 'center',
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
    paddingVertical: 8,
    backgroundColor: '#FF6B6B',
  },
});

export default ReviewScreen;