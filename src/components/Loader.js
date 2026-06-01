import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../theme/colors';

export const Loader = ({ message = 'Loading...' }) => {
  const pulseAnim = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.6,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.pulseCircle, { transform: [{ scale: pulseAnim }], opacity: pulseAnim }]} />
      <View style={styles.innerCircle}>
        <Text style={styles.logoText}>LS</Text>
      </View>
      <Text style={styles.messageText}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(253, 251, 247, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  pulseCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.accent,
    position: 'absolute',
  },
  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  logoText: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  messageText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 24,
    letterSpacing: 0.5,
  },
});
