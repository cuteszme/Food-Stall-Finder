import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, HelperText, RadioButton } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { register } from '../../redux/actions/authActions';
import { theme } from '../../utils/theme';

const RegisterScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('customer'); // Default to customer
  
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [secureConfirmTextEntry, setSecureConfirmTextEntry] = useState(true);
  
  const dispatch = useDispatch();
  const { loading, error } = useSelector(state => state.auth);
  
  const validateForm = () => {
    let isValid = true;
    
    // Validate name
    if (!name.trim()) {
      setNameError('Name is required');
      isValid = false;
    } else {
      setNameError('');
    }
    
    // Validate email
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email is invalid');
      isValid = false;
    } else {
      setEmailError('');
    }
    
    // Validate password
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }
    
    // Validate confirm password
    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmPasswordError('');
    }
    
    return isValid;
  };
  
  const handleRegister = () => {
    if (validateForm()) {
      dispatch(register({
        name,
        email,
        password,
        user_type: userType
      }));
    }
  };
  
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.appName}>Food Stall Finder</Text>
      </View>
      
      <View style={styles.formContainer}>
        <Text style={styles.title}>Create Account</Text>
        
        <TextInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          error={!!nameError}
        />
        {nameError ? <HelperText type="error">{nameError}</HelperText> : null}
        
        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          error={!!emailError}
        />
        {emailError ? <HelperText type="error">{emailError}</HelperText> : null}
        
        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={secureTextEntry}
          style={styles.input}
          error={!!passwordError}
          right={
            <TextInput.Icon
              name={secureTextEntry ? 'eye-off' : 'eye'}
              onPress={() => setSecureTextEntry(!secureTextEntry)}
            />
          }
        />
        {passwordError ? <HelperText type="error">{passwordError}</HelperText> : null}
        
        <TextInput
          label="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={secureConfirmTextEntry}
          style={styles.input}
          error={!!confirmPasswordError}
          right={
            <TextInput.Icon
              name={secureConfirmTextEntry ? 'eye-off' : 'eye'}
              onPress={() => setSecureConfirmTextEntry(!secureConfirmTextEntry)}
            />
          }
        />
        {confirmPasswordError ? <HelperText type="error">{confirmPasswordError}</HelperText> : null}
        
        <Text style={styles.sectionTitle}>I am a:</Text>
        <View style={styles.radioGroup}>
          <View style={styles.radioOption}>
            <RadioButton
              value="customer"
              status={userType === 'customer' ? 'checked' : 'unchecked'}
              onPress={() => setUserType('customer')}
              color={theme.colors.primary}
            />
            <Text onPress={() => setUserType('customer')}>Customer</Text>
          </View>
          
          <View style={styles.radioOption}>
            <RadioButton
              value="owner"
              status={userType === 'owner' ? 'checked' : 'unchecked'}
              onPress={() => setUserType('owner')}
              color={theme.colors.primary}
            />
            <Text onPress={() => setUserType('owner')}>Food Stall Owner</Text>
          </View>
        </View>
        
        {error && (
          <HelperText type="error" style={styles.errorText}>
            {error}
          </HelperText>
        )}
        
        <Button
          mode="contained"
          onPress={handleRegister}
          style={styles.button}
          loading={loading}
          disabled={loading}
        >
          Sign Up
        </Button>
        
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 24,
  },
  logo: {
    width: 80,
    height: 80,
  },
  appName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginTop: 8,
  },
  formContainer: {
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
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
  radioGroup: {
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.primary,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 8,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  loginText: {
    color: '#666',
  },
  loginLink: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default RegisterScreen;