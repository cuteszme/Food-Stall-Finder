import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '../../redux/actions/authActions';
import { theme } from '../../utils/theme';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  
  const dispatch = useDispatch();
  const { loading, error, isLoggedIn } = useSelector(state => state.auth);
  
  useEffect(() => {
    if (isLoggedIn) {
      // Navigate to the appropriate screen based on user type
      // This will be handled by the AppNavigator
    }
  }, [isLoggedIn]);
  
  const validateForm = () => {
    let isValid = true;
    
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
    
    return isValid;
  };
  
  const handleLogin = () => {
    if (validateForm()) {
      dispatch(login(email, password));
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
        <Text style={styles.title}>Sign In</Text>
        
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
        
        {error && (
          <HelperText type="error" style={styles.errorText}>
            {error}
          </HelperText>
        )}
        
        <Button
          mode="contained"
          onPress={handleLogin}
          style={styles.button}
          loading={loading}
          disabled={loading}
        >
          Sign In
        </Button>
        
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Sign Up</Text>
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
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 120,
    height: 120,
  },
  appName: {
    fontSize: 24,
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
  button: {
    marginTop: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.primary,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 8,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    color: '#666',
  },
  registerLink: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginLeft: 4,
  },
});

export default LoginScreen;