import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { useAuth } from '../../context/AuthContext';

export const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const { resetPassword } = useAuth();

  const validate = () => {
    let isValid = true;
    setEmailError('');
    setGeneralError('');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    }

    return isValid;
  };

  const handleReset = async () => {
    if (!validate()) return;

    setIsLoading(true);
    try {
      await resetPassword(email);
      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      let errorMsg = 'Failed to send reset link. Please verify your email address.';
      if (error.code === 'auth/user-not-found') {
        errorMsg = 'No user account found with this email address.';
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
          <Text style={styles.title}>Password Recovery</Text>
          <Text style={styles.subtitle}>Enter your email to receive a secure recovery link.</Text>
        </View>

        {isSuccess ? (
          <View style={styles.successContainer}>
            <View style={styles.successBadge}>
              <Text style={styles.successEmoji}>📧</Text>
            </View>
            <Text style={styles.successTitle}>Check Your Inbox</Text>
            <Text style={styles.successText}>
              We have sent a secure password reset link to <Text style={styles.emailHighlight}>{email}</Text>. Please follow the instructions in the email.
            </Text>
            <Button
              title="Back to Log In"
              variant="primary"
              onPress={() => navigation.navigate('Login')}
              style={styles.backBtn}
            />
          </View>
        ) : (
          <View style={styles.form}>
            {!!generalError && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorBannerText}>{generalError}</Text>
              </View>
            )}

            <Input
              label="Email Address"
              placeholder="Enter your registered email"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setEmailError('');
              }}
              error={emailError}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Button
              title="Send Reset Link"
              variant="primary"
              onPress={handleReset}
              loading={isLoading}
              style={styles.actionBtn}
            />

            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.cancelBtn}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelText}>Cancel and return</Text>
            </TouchableOpacity>
          </View>
        )}
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
    marginBottom: 32,
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
  actionBtn: {
    marginTop: 12,
    marginBottom: 20,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  cancelText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  successEmoji: {
    fontSize: 36,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text,
    marginBottom: 12,
  },
  successText: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emailHighlight: {
    color: colors.text,
    fontWeight: '700',
  },
  backBtn: {
    width: '100%',
  },
});
