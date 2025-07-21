import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, TextInput, Button, Avatar, Divider, List, Switch } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { updateUserProfile, logout } from '../../redux/actions/authActions';

const ProfileScreen = () => {
  const dispatch = useDispatch();
  const { userInfo, loading } = useSelector(state => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userInfo?.name || '');
  const [email, setEmail] = useState(userInfo?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };
  
  const handleSaveProfile = () => {
    // Validate form
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('Error', 'Valid email is required');
      return;
    }
    
    if (password && password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    
    if (password && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    // Update profile
    const userData = {
      name,
      email,
      ...(password ? { password } : {})
    };
    
    dispatch(updateUserProfile(userData, () => {
      setIsEditing(false);
      setPassword('');
      setConfirmPassword('');
      Alert.alert('Success', 'Profile updated successfully');
    }));
  };
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: () => dispatch(logout()),
          style: 'destructive' 
        }
      ]
    );
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text 
          size={80} 
          label={getInitials(userInfo?.name)} 
          backgroundColor="#FF6B6B" 
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userInfo?.name}</Text>
          <Text style={styles.userEmail}>{userInfo?.email}</Text>
          <Text style={styles.userType}>
            {userInfo?.user_type === 'customer' ? 'Customer' : 'Food Stall Owner'}
          </Text>
        </View>
      </View>
      
      {isEditing ? (
        <View style={styles.editForm}>
          <Text style={styles.sectionTitle}>Edit Profile</Text>
          
          <TextInput
            label="Full Name"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />
          
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          
          <Text style={styles.passwordLabel}>
            Leave blank to keep current password
          </Text>
          
          <TextInput
            label="New Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
          />
          
          <TextInput
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            style={styles.input}
          />
          
          <View style={styles.buttonRow}>
            <Button
              mode="outlined"
              onPress={() => {
                setIsEditing(false);
                setName(userInfo?.name || '');
                setEmail(userInfo?.email || '');
                setPassword('');
                setConfirmPassword('');
              }}
              style={[styles.button, styles.cancelButton]}
            >
              Cancel
            </Button>
            
            <Button
              mode="contained"
              onPress={handleSaveProfile}
              style={[styles.button, styles.saveButton]}
              loading={loading}
              disabled={loading}
            >
              Save
            </Button>
          </View>
        </View>
      ) : (
        <>
          <Button
            mode="outlined"
            icon="account-edit"
            onPress={() => setIsEditing(true)}
            style={styles.editButton}
          >
            Edit Profile
          </Button>
          
          <Divider style={styles.divider} />
          
          <List.Section>
            <List.Subheader>Settings</List.Subheader>
            
            <List.Item
              title="Notifications"
              description="Receive alerts about new food stalls and promotions"
              left={props => <List.Icon {...props} icon="bell-outline" />}
              right={props => 
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  color="#FF6B6B"
                />
              }
            />
            
            <List.Item
              title="Location Services"
              description="Allow the app to access your location"
              left={props => <List.Icon {...props} icon="map-marker-outline" />}
              right={props => 
                <Switch
                  value={locationServices}
                  onValueChange={setLocationServices}
                  color="#FF6B6B"
                />
              }
            />
            
            <Divider style={styles.divider} />
            
            <List.Subheader>About</List.Subheader>
            
            <List.Item
              title="Privacy Policy"
              left={props => <List.Icon {...props} icon="shield-account-outline" />}
              onPress={() => {/* Navigate to privacy policy */}}
            />
            
            <List.Item
              title="Terms of Service"
              left={props => <List.Icon {...props} icon="file-document-outline" />}
              onPress={() => {/* Navigate to terms of service */}}
            />
            
            <List.Item
              title="App Version"
              description="1.0.0"
              left={props => <List.Icon {...props} icon="information-outline" />}
            />
          </List.Section>
          
          <Button
            mode="outlined"
            icon="logout"
            onPress={handleLogout}
            style={styles.logoutButton}
            color="#D32F2F"
          >
            Logout
          </Button>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  userInfo: {
    marginLeft: 20,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  userType: {
    fontSize: 14,
    color: '#FF6B6B',
    marginTop: 4,
    fontWeight: 'bold',
  },
  editButton: {
    margin: 16,
    borderColor: '#FF6B6B',
    borderWidth: 1,
  },
  divider: {
    marginVertical: 8,
  },
  logoutButton: {
    margin: 16,
    marginTop: 32,
    borderColor: '#D32F2F',
  },
  editForm: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  passwordLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
    fontStyle: 'italic',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  button: {
    flex: 1,
    marginHorizontal: 8,
  },
  cancelButton: {
    borderColor: '#999',
  },
  saveButton: {
    backgroundColor: '#FF6B6B',
  },
});

export default ProfileScreen;