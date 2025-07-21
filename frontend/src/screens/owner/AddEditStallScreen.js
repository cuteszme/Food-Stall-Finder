import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, Alert, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, HelperText, ActivityIndicator } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

import { createFoodStall, updateFoodStall } from '../../redux/actions/foodStallActions';

const AddEditStallScreen = ({ route, navigation }) => {
  const { stall } = route.params || {};
  const isEditing = !!stall;
  
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.foodStalls);
  
  // Form state
  const [name, setName] = useState(stall?.name || '');
  const [description, setDescription] = useState(stall?.description || '');
  const [image, setImage] = useState(null);
  const [imageUrl, setImageUrl] = useState(stall?.image_url || null);
  const [location, setLocation] = useState(stall?.location || null);
  const [address, setAddress] = useState(stall?.location?.address || '');
  
  // Form validation
  const [nameError, setNameError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');
  const [imageError, setImageError] = useState('');
  const [locationError, setLocationError] = useState('');
  
  useEffect(() => {
    if (!isEditing) {
      getCurrentLocation();
    }
  }, []);
  
  const getCurrentLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
        return;
      }
      
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      // Get address from coordinates
      const addresses = await Location.reverseGeocodeAsync({ latitude, longitude });
      const firstAddress = addresses[0];
      const addressString = `${firstAddress.street || ''}, ${firstAddress.city || ''}, ${firstAddress.region || ''}, ${firstAddress.country || ''}`;
      
      setLocation({
        latitude,
        longitude,
        address: addressString.replace(/^, |, $|, ,/g, '')
      });
      setAddress(addressString.replace(/^, |, $|, ,/g, ''));
      setLocationError('');
    } catch (error) {
      setLocationError('Error getting current location');
    }
  };
  
  const pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
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
      setNameError('Food stall name is required');
      isValid = false;
    } else {
      setNameError('');
    }
    
    // Validate description
    if (!description.trim()) {
      setDescriptionError('Description is required');
      isValid = false;
    } else {
      setDescriptionError('');
    }
    
    // Validate image
    if (!isEditing && !image) {
      setImageError('Please select an image');
      isValid = false;
    } else {
      setImageError('');
    }
    
    // Validate location
    if (!location) {
      setLocationError('Location is required');
      isValid = false;
    } else {
      setLocationError('');
    }
    
    return isValid;
  };
  
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    
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
    
    formData.append('location_data', JSON.stringify({
      latitude: location.latitude,
      longitude: location.longitude,
      address: address
    }));
    
    if (isEditing) {
      dispatch(updateFoodStall(stall.id, formData, () => {
        Alert.alert('Success', 'Food stall updated successfully');
        navigation.goBack();
      }));
    } else {
      dispatch(createFoodStall(formData, () => {
        Alert.alert('Success', 'Food stall created successfully');
        navigation.goBack();
      }));
    }
  };
  
  const handleMapPress = async (event) => {
    const { coordinate } = event.nativeEvent;
    
    // Get address from coordinates
    try {
      const addresses = await Location.reverseGeocodeAsync(coordinate);
      const firstAddress = addresses[0];
      const addressString = `${firstAddress.street || ''}, ${firstAddress.city || ''}, ${firstAddress.region || ''}, ${firstAddress.country || ''}`;
      
      setLocation({
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
        address: addressString.replace(/^, |, $|, ,/g, '')
      });
      setAddress(addressString.replace(/^, |, $|, ,/g, ''));
      setLocationError('');
    } catch (error) {
      console.log('Error getting address:', error);
    }
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.formTitle}>
          {isEditing ? 'Edit Food Stall' : 'Add New Food Stall'}
        </Text>
        
        <TextInput
          label="Food Stall Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          error={!!nameError}
        />
        {nameError ? <HelperText type="error">{nameError}</HelperText> : null}
        
        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={styles.input}
          error={!!descriptionError}
        />
        {descriptionError ? <HelperText type="error">{descriptionError}</HelperText> : null}
        
        <Text style={styles.sectionTitle}>Food Stall Image</Text>
        
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
        
        <Text style={styles.sectionTitle}>Location</Text>
        <Button
          mode="outlined"
          icon="map-marker"
          onPress={getCurrentLocation}
          style={styles.locationButton}
        >
          Use Current Location
        </Button>
        
        {location && (
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: location.latitude,
                longitude: location.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              onPress={handleMapPress}
            >
              <Marker
                coordinate={{
                  latitude: location.latitude,
                  longitude: location.longitude,
                }}
                draggable
                onDragEnd={handleMapPress}
              />
            </MapView>
            <TextInput
              label="Address"
              value={address}
              onChangeText={setAddress}
              style={styles.input}
              disabled
            />
            <Text style={styles.mapHelpText}>
              Tap on the map to adjust the location or drag the marker
            </Text>
          </View>
        )}
        {locationError ? <HelperText type="error">{locationError}</HelperText> : null}
        
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
          loading={loading}
          disabled={loading}
        >
          {isEditing ? 'Update Food Stall' : 'Create Food Stall'}
        </Button>
        
        {error && (
          <HelperText type="error" style={styles.errorText}>
            {error}
          </HelperText>
        )}
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
  locationButton: {
    marginBottom: 16,
  },
  mapContainer: {
    marginBottom: 16,
  },
  map: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  mapHelpText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 16,
    paddingVertical: 8,
    backgroundColor: '#4ECDC4',
  },
  errorText: {
    textAlign: 'center',
  },
});

export default AddEditStallScreen;