import React, { useEffect, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { Text, FAB, ActivityIndicator, Chip, Button, Menu, Divider, Dialog, Portal } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { fetchMenuItems, deleteMenuItem, deleteCategory } from '../../redux/actions/menuActions';
import MenuItem from '../../components/MenuItem';

const ManageMenuScreen = ({ route, navigation }) => {
  const { stall } = route.params;
  const dispatch = useDispatch();
  const { menuItems, loading, error } = useSelector(state => state.menu);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  
  useEffect(() => {
    dispatch(fetchMenuItems(stall.id));
  }, [dispatch, stall.id]);
  
  const onRefresh = () => {
    setRefreshing(true);
    dispatch(fetchMenuItems(stall.id));
    setRefreshing(false);
  };
  
  const getCategories = () => {
    if (!menuItems || menuItems.length === 0) return [];
    return [...new Set(menuItems.map(item => item.category))];
  };
  
  const handleAddMenuItem = () => {
    navigation.navigate('AddEditMenuItem', { stallId: stall.id });
  };
  
  const handleEditMenuItem = (item) => {
    navigation.navigate('AddEditMenuItem', { stallId: stall.id, item });
  };
  
  const handleDeleteMenuItem = (item) => {
    Alert.alert(
      'Delete Menu Item',
      `Are you sure you want to delete "${item.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            dispatch(deleteMenuItem(item.id, () => {
              Alert.alert('Success', 'Menu item deleted successfully');
              dispatch(fetchMenuItems(stall.id));
            }));
          }
        },
      ]
    );
  };
  
  const openDeleteCategoryDialog = (category) => {
    setCategoryToDelete(category);
    setDeleteDialogVisible(true);
  };
  
  const handleDeleteCategory = () => {
    if (!categoryToDelete) return;
    
    dispatch(deleteCategory(stall.id, categoryToDelete, () => {
      Alert.alert('Success', `Category "${categoryToDelete}" deleted successfully`);
      setDeleteDialogVisible(false);
      setCategoryToDelete(null);
      setSelectedCategory(null);
      dispatch(fetchMenuItems(stall.id));
    }));
  };
  
  const filteredMenuItems = selectedCategory 
    ? menuItems?.filter(item => item.category === selectedCategory)
    : menuItems;
  
  if (loading && !refreshing && !menuItems) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4ECDC4" />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stallName}>{stall.name}</Text>
        <Text style={styles.sectionTitle}>Menu Management</Text>
        
        <View style={styles.actionsRow}>
          <Button 
            icon="plus" 
            mode="contained" 
            onPress={handleAddMenuItem}
            style={styles.addButton}
          >
            Add Item
          </Button>
          
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <Button 
                icon="dots-vertical" 
                mode="outlined" 
                onPress={() => setMenuVisible(true)}
                style={styles.menuButton}
              >
                Options
              </Button>
            }
          >
            <Menu.Item 
              icon="plus-circle-outline"
              onPress={() => {
                setMenuVisible(false);
                handleAddMenuItem();
              }} 
              title="Add New Menu Item" 
            />
            <Divider />
            {selectedCategory && (
              <Menu.Item 
                icon="delete-outline"
                onPress={() => {
                  setMenuVisible(false);
                  openDeleteCategoryDialog(selectedCategory);
                }} 
                title={`Delete '${selectedCategory}' Category`} 
              />
            )}
          </Menu>
        </View>
        
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
        </View>
      </View>
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button onPress={onRefresh} mode="text" color="#D32F2F">
            Try Again
          </Button>
        </View>
      )}
      
      {!loading && (!menuItems || menuItems.length === 0) ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="restaurant-outline" size={64} color="#ccc" />
          <Text style={styles.emptyText}>No menu items yet</Text>
          <Button 
            mode="contained" 
            onPress={handleAddMenuItem} 
            style={styles.addFirstButton}
            icon="plus"
          >
            Add Your First Menu Item
          </Button>
        </View>
      ) : (
        <FlatList
          data={filteredMenuItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.menuItemContainer}>
              <MenuItem item={item} onPress={() => handleEditMenuItem(item)} />
              <View style={styles.menuItemActions}>
                <Button 
                  icon="pencil" 
                  mode="text" 
                  onPress={() => handleEditMenuItem(item)}
                  color="#4ECDC4"
                >
                  Edit
                </Button>
                <Button 
                  icon="delete" 
                  mode="text" 
                  onPress={() => handleDeleteMenuItem(item)}
                  color="#D32F2F"
                >
                  Delete
                </Button>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      )}
      
      <FAB
        style={styles.fab}
        icon="plus"
        color="#fff"
        onPress={handleAddMenuItem}
      />
      
      <Portal>
        <Dialog
          visible={deleteDialogVisible}
          onDismiss={() => setDeleteDialogVisible(false)}
        >
          <Dialog.Title>Delete Category</Dialog.Title>
          <Dialog.Content>
            <Text>
              Are you sure you want to delete the "{categoryToDelete}" category?
              This will delete all menu items in this category.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
            <Button 
              onPress={handleDeleteCategory}
              color="#D32F2F"
            >
              Delete
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  stallName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  addButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#4ECDC4',
  },
  menuButton: {
    width: 120,
  },
  categoriesContainer: {
    flexDirection: 'row',
  },
  categoryChip: {
    marginRight: 8,
  },
  listContent: {
    padding: 16,
  },
  menuItemContainer: {
    marginBottom: 16,
  },
  menuItemActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
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
  addFirstButton: {
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

export default ManageMenuScreen;