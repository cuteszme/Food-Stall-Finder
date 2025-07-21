import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, HelperText, ActivityIndicator, Chip } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { createMenuItem, updateMenuItem, fetchMenuItems } from '../../redux/actions/menuActions';

const AddEditMenuItemScreen = ({ route, navigation }) => {
  const { stallId, item } = route.params;
  const isEditing = !!item;
  
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.menu);
  const { menuItems } = useSelector(state => state.menu);
  
  // Form state
  const [name, setName] = useState(item?.name || '');
  const [price, setPrice] = useState(item?.price ? item.price.toString() : '');
  const [description, setDescription] = useState(item?.description || '');
  const [category, setCategory] = useState(item?.category || '');
  const [customCategory, setCustomCategory] = useState('');
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(item?.image_url || null);
  
  // Form validation
  const [nameError, setNameError] = useState('');
  const [priceError, setPriceError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [imageError, setImageError] = useState('');
  
  // Load existing categories
  const [existingCategories, setExistingCategories] = useState([]);
  
  useEffect(() => {
    if (!menuItems) {
      dispatch(fetchMenuItems(stallId));
    } else {
      // Extract unique categories
      const categories = [...new Set(menuItems.map(item => item.category))];
      setExistingCategories(categories);
    }
  }, [dispatch, stallId, menuItems]);
  
  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.cancelled && result.assets && result.assets[0]) {
        setImage(result.assets[0]);
        setImageError('');
      }
    } catch (error) {
      console.log('Error picking image:', error);
      setImageError('Error selecting image');
    }
  };
  
  const validateForm = () => {
    let isValid = true;
    
    // Validate name
    if (!name.trim()) {
      setNameError('Item name is required');
      isValid = false;
    } else {
      setNameError('');
    }
    
    // Validate price
    if (!price.trim()) {
      setPriceError('Price is required');
      isValid = false;
    } else if (isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      setPriceError('Price must be a positive number');
      isValid = false;
    } else {
      setPriceError('');
    }
    
    // Validate description
    if (!description.trim()) {
      setDescriptionError('Description is required');
      isValid = false;
    } else {
      setDescriptionError('');
    }
    
    // Validate category
    if (!category.trim() && !customCategory.trim()) {
      setCategoryError('Category is required');
      isValid = false;
    } else {
      setCategoryError('');
    }
    
    // Validate image
    if (!isEditing && !image) {
      setImageError('Please select an image');
      isValid = false;
    } else {
      setImageError('');
    }
    
    return isValid;
  };
  
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('category', customCategory || category);
    
    if (image) {
      const imageUri = image.uri;
      const filename = imageUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image';
      
      formData.append('image', {
        uri: imageUri,
        name: filename,
        type
      });
    }
    
    if (isEditing) {
      dispatch(updateMenuItem(item.id, formData, () => {
        Alert.alert('Success', 'Menu item updated successfully');
        navigation.goBack();
      }));
    } else {
      dispatch(createMenuItem(stallId, formData, () => {
        Alert.alert('Success', 'Menu item added successfully');
        navigation.goBack();
      }));
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.formTitle}>
          {isEditing ? 'Edit Menu Item' : 'Add Menu Item'}
        </Text>
        
        <TextInput
          label="Item Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          error={!!nameError}
        />
        {nameError ? <HelperText type="error">{nameError}</HelperText> : null}
        
        <TextInput
          label="Price"
          value={price}
          onChangeText={setPrice}
          keyboardType="decimal-pad"
          style={styles.input}
          error={!!priceError}
          left={<TextInput.Affix text="$" />}
        />
        {priceError ? <HelperText type="error">{priceError}</HelperText> : null}
        
        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={styles.input}
          error={!!descriptionError}
        />
        {descriptionError ? <HelperText type="error">{descriptionError}</HelperText> : null}
        
        <Text style={styles.sectionTitle}>Category</Text>
        
        <View style={styles.categoriesContainer}>
          {existingCategories.map(cat => (
            <Chip
              key={cat}
              selected={category === cat}
              onPress={() => {
                setCategory(cat);
                setCustomCategory('');
              }}
              style={styles.categoryChip}
            >
              {cat}
            </Chip>
          ))}
        </View>
        
        <TextInput
          label="Or Enter New Category"
          value={customCategory}
          onChangeText={setCustomCategory}
          style={styles.input}
          disabled={!!category}
        />
        {categoryError ? <HelperText type="error">{categoryError}</HelperText> : null}
        
        {category && (
          <Button
            mode="text"
            onPress={() => setCategory('')}
            style={styles.clearButton}
          >
            Clear Selected Category
          </Button>
        )}
        
        <Text style={styles.sectionTitle}>Item Image</Text>
        
        {(image || imageUrl) ? (
          <View style={styles.imagePreviewContainer}>
            <Image
              source={{ uri: image ? image.uri : imageUrl }}
              style={styles.imagePreview}
              resizeMode="cover"
            />
            <TouchableOpacity
              style={styles.changeImageButton}
              onPress={pickImage}
            >
              <Text style={styles.changeImageText}>Change Image</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Button
            mode="outlined"
            icon="image"
            onPress={pickImage}
            style={styles.imagePickerButton}
          >
            Select Image
          </Button>
        )}
        {imageError ? <HelperText type="error">{imageError}</HelperText> : null}
        
        {error && (
          <HelperText type="error" style={styles.errorText}>
            {error}
          </HelperText>
        )}
        
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          loading={loading}
          disabled={loading}
        >
          {isEditing ? 'Update Menu Item' : 'Add Menu Item'}
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
  form: {
    padding: 16,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  categoryChip: {
    margin: 4,
  },
  clearButton: {
    marginTop: 4,
    marginBottom: 16,
  },
  imagePickerButton: {
    marginBottom: 16,
  },
  imagePreviewContainer: {
    marginBottom: 16,
    alignItems: 'center',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  changeImageButton: {
    padding: 8,
  },
  changeImageText: {
    color: '#4ECDC4',
    fontWeight: 'bold',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 8,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 16,
    paddingVertical: 8,
    backgroundColor: '#4ECDC4',
  },
});

export default AddEditMenuItemScreen;