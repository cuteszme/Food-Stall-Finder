import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Card, Text, Divider } from 'react-native-paper';

const MenuItem = ({ item, onPress }) => {
  return (
    <Card style={styles.card} onPress={onPress}>
      <View style={styles.container}>
        <Image 
          source={{ uri: item.image_url }} 
          style={styles.image} 
          resizeMode="cover"
        />
        <View style={styles.content}>
          <Text style={styles.name}>{item.name}</Text>
          <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
      </View>
      <Divider style={styles.divider} />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 1,
  },
  container: {
    flexDirection: 'row',
    padding: 12,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 12,
    color: '#666',
  },
  divider: {
    height: 1,
  },
});

export default MenuItem;