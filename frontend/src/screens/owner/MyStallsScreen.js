import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { Text, FAB, ActivityIndicator, Card, Title, Paragraph, Button, IconButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOwnerFoodStalls, deleteFoodStall } from '../../redux/actions/foodStallActions';
import { Ionicons } from '@expo/vector-icons';
import FoodStallCard from '../../components/FoodStallCard';

const MyStallsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { foodStalls, loading, error } = useSelector(state => state.foodStalls);
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    dispatch(fetchOwnerFoodStalls());
  }, [dispatch]);
  
  const onRefresh = () => {
    setRefreshing(true);
    dispatch(fetchOwnerFoodStalls());
    setRefreshing(false);
  };
  
  const handleAddStall = () => {
    navigation.navigate('AddEditStall');
  };
  
  const handleEditStall = (stall) => {
    navigation.navigate('AddEditStall', { stall });
  };
  
  const handleManageMenu = (stall) => {
    navigation.navigate('ManageMenu', { stall });
  };
  
  const handleDeleteStall = (stall) => {
    Alert.alert(
      'Delete Food Stall',
      `Are you sure you want to delete "${stall.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            dispatch(deleteFoodStall(stall.id, () => {
              Alert.alert('Success', 'Food stall deleted successfully');
              dispatch(fetchOwnerFoodStalls());
            }));
          }
        },
      ]
    );
  };
  
  if (loading && !refreshing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>My Food Stalls</Text>
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button onPress={onRefresh} mode="text" color="#D32F2F">
            Try Again
          </Button>
        </View>
      )}
      
      {!loading && foodStalls.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="restaurant-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>You don't have any food stalls yet</Text>
          <Button 
            mode="contained" 
            onPress={handleAddStall} 
            style={styles.addButton}
            icon="plus"
          >
            Add Your First Food Stall
          </Button>
        </View>
      ) : (
        <FlatList
          data={foodStalls}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={styles.card}>
              <FoodStallCard
                foodStall={item}
                onPress={() => handleManageMenu(item)}
              />
              <Card.Actions style={styles.cardActions}>
                <Button 
                  onPress={() => handleManageMenu(item)} 
                  color="#4ECDC4"
                  mode="text"
                >
                  Manage Menu
                </Button>
                <Button 
                  onPress={() => handleEditStall(item)} 
                  color="#FFC107"
                  mode="text"
                >
                  Edit
                </Button>
                <Button 
                  onPress={() => handleDeleteStall(item)} 
                  color="#D32F2F"
                  mode="text"
                >
                  Delete
                </Button>
              </Card.Actions>
            </Card>
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
      
      <FAB
        style={styles.fab}
        icon="plus"
        color="#fff"
        onPress={handleAddStall}
      />
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
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    overflow: 'hidden',
  },
  cardActions: {
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    marginVertical: 16,
    textAlign: 'center',
  },
  addButton: {
    marginTop: 16,
    backgroundColor: '#4ECDC4',
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#D32F2F',
    marginBottom: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#4ECDC4',
  },
});

export default MyStallsScreen;