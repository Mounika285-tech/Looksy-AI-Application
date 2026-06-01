import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';

export const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');

  const { signUp } = useAuth();

  const validate = () => {
    let isValid = true;
    setNameError('');
    setEmailError('');
    setPasswordError('');
    setConfirmPasswordError('');
    setGeneralError('');

    if (!name.trim()) {
      setNameError('Full name is required');
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      isValid = false;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      isValid = false;
    }

    return isValid;
  };

  const handleSignUp = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await signUp(name, email, password);
    } catch (error) {
      console.error(error);
      let errorMsg = 'Failed to create account. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMsg = 'This email address is already in use.';
      } else if (error.code === 'auth/invalid-email') {
        errorMsg = 'Invalid email address format.';
      } else if (error.code === 'auth/weak-password') {
        errorMsg = 'The password is too weak.';
      }
      setGeneralError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join LookSy and organize your wardrobe smartly.</Text>
        </View>

        <View style={styles.form}>
          {!!generalError && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>{generalError}</Text>
            </View>
          )}

          <Input
            label="Full Name"
            placeholder="Enter your full name"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setNameError('');
            }}
            error={nameError}
            autoCapitalize="words"
          />

          <Input
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError('');
            }}
            error={emailError}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Input
            label="Password"
            placeholder="Create a password"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setPasswordError('');
            }}
            error={passwordError}
            secureTextEntry
            autoCapitalize="none"
          />

          <Input
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={(text) => {
              setConfirmPassword(text);
              setConfirmPasswordError('');
            }}
            error={confirmPasswordError}
            secureTextEntry
            autoCapitalize="none"
          />

          <Button
            title="Create Account"
            variant="primary"
            onPress={handleSignUp}
            loading={isLoading}
            style={styles.signupBtn}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerLabel}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
            <Text style={styles.footerAction}>Log In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    paddingVertical: 40,
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  errorBanner: {
    backgroundColor: 'rgba(211, 47, 47, 0.08)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(211, 47, 47, 0.2)',
  },
  errorBannerText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  signupBtn: {
    marginTop: 10,
    marginBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  footerLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  footerAction: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
});
