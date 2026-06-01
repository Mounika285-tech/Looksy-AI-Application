import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { Feather } from '@expo/vector-icons';

export const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error = '',
  keyboardType = 'default',
  autoCapitalize = 'none',
  containerStyle,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const showPasswordToggle = secureTextEntry;
  const isSecure = secureTextEntry && !isPasswordVisible;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.focusedInput,
          !!error && styles.errorInput,
          style,
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={styles.textInput}
          {...props}
        />
        {showPasswordToggle && (
          <TouchableOpacity
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            activeOpacity={0.7}
            style={styles.eyeContainer}
          >
            <Feather
              name={isPasswordVisible ? 'eye-off' : 'eye'}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
    paddingLeft: 4,
  },
  inputContainer: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  focusedInput: {
    borderColor: colors.accentDark,
    backgroundColor: colors.white,
  },
  errorInput: {
    borderColor: colors.error,
    backgroundColor: colors.white,
  },
  textInput: {
    flex: 1,
    height: '100%',
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
  },
  eyeContainer: {
    height: '100%',
    justifyContent: 'center',
    paddingLeft: 10,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    marginTop: 6,
    paddingLeft: 4,
    fontWeight: '500',
  },
});
