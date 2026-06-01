import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors } from '../theme/colors';

export const Button = ({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'text'
  size = 'large',      // 'large' | 'medium' | 'small'
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const buttonStyles = [
    styles.button,
    styles[`${variant}Button`],
    styles[`${size}Button`],
    (disabled || loading) && styles.disabledButton,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    (disabled || loading) && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={buttonStyles}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'outline' || variant === 'text' ? colors.primary : colors.white}
        />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  secondaryButton: {
    backgroundColor: colors.accent,
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.accentDark,
  },
  textButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  disabledButton: {
    backgroundColor: colors.surfaceAlt,
    borderColor: 'transparent',
    shadowOpacity: 0,
    elevation: 0,
  },
  largeButton: {
    width: '100%',
    height: 56,
  },
  mediumButton: {
    paddingHorizontal: 24,
    height: 48,
  },
  smallButton: {
    paddingHorizontal: 16,
    height: 38,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.text,
  },
  outlineText: {
    color: colors.text,
  },
  textText: {
    color: colors.primary,
    fontWeight: '700',
  },
  disabledText: {
    color: colors.textSecondary,
  },
  largeText: {
    fontSize: 16,
  },
  mediumText: {
    fontSize: 15,
  },
  smallText: {
    fontSize: 13,
  },
});
