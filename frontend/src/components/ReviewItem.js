import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Avatar, Card } from 'react-native-paper';
import { format } from 'date-fns';
import RatingStars from './RatingStars';

const ReviewItem = ({ review }) => {
  // Format the date for display
  const formattedDate = review.updated_at ? 
    format(new Date(review.updated_at), 'MMM d, yyyy') : 
    'Unknown date';
  
  // Generate avatar from user name
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Avatar.Text 
              size={40} 
              label={getInitials(review.user_name)} 
              backgroundColor="#4ECDC4" 
            />
            <View style={styles.nameContainer}>
              <Text style={styles.userName}>{review.user_name}</Text>
              <Text style={styles.date}>{formattedDate}</Text>
            </View>
          </View>
          <RatingStars rating={review.rating} size={16} />
        </View>
        
        <Text style={styles.comment}>{review.comment}</Text>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    borderRadius: 8,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameContainer: {
    marginLeft: 12,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  comment: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
});

export default ReviewItem;