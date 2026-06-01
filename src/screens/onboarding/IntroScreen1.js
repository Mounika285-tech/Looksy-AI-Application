import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Button } from '../../components/Button';

export const IntroScreen1 = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.wardrobeVisual}>
          <View style={styles.hangerLine} />
          <View style={styles.hangerGrid}>
            <View style={[styles.itemCard, { backgroundColor: colors.accent }]}>
              <Text style={styles.itemEmoji}>🧥</Text>
            </View>
            <View style={[styles.itemCard, { backgroundColor: colors.surfaceAlt }]}>
              <Text style={styles.itemEmoji}>👠</Text>
            </View>
            <View style={[styles.itemCard, { backgroundColor: colors.white }]}>
              <Text style={styles.itemEmoji}>👜</Text>
            </View>
          </View>
        </View>

        <Text style={styles.title}>Digital Wardrobe</Text>
        <Text style={styles.description}>
          Digitally store, organize, and view all your clothing, shoes, watches, and accessories in one beautiful place.
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>
        <Button
          title="Next"
          variant="primary"
          onPress={() => navigation.navigate('Intro2')}
          style={styles.btn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'flex-end',
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  wardrobeVisual: {
    width: '100%',
    height: 180,
    backgroundColor: colors.surface,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hangerLine: {
    width: '90%',
    height: 6,
    backgroundColor: colors.accentDark,
    borderRadius: 3,
    position: 'absolute',
    top: 30,
  },
  hangerGrid: {
    flexDirection: 'row',
    marginTop: 20,
  },
  itemCard: {
    width: 70,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  itemEmoji: {
    fontSize: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceAlt,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: colors.primary,
  },
  btn: {
    width: '100%',
  },
});
