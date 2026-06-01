import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Button } from '../../components/Button';

export const IntroScreen2 = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.outfitVisual}>
          <View style={styles.connectorLine} />
          <View style={[styles.itemCard, styles.topCard]}>
            <Text style={styles.itemEmoji}>👕</Text>
          </View>
          <View style={[styles.itemCard, styles.bottomCard]}>
            <Text style={styles.itemEmoji}>👖</Text>
          </View>
          <View style={[styles.itemCard, styles.shoesCard]}>
            <Text style={styles.itemEmoji}>👟</Text>
          </View>
        </View>

        <Text style={styles.title}>AI Outfit Recommendations</Text>
        <Text style={styles.description}>
          Receive instant, personalized outfit suggestions built exclusively from items in your own wardrobe.
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
        </View>
        <Button
          title="Next"
          variant="primary"
          onPress={() => navigation.navigate('Intro3')}
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
  outfitVisual: {
    width: '100%',
    height: 180,
    backgroundColor: colors.surface,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
    borderWidth: 1,
    borderColor: colors.border,
  },
  connectorLine: {
    height: 120,
    width: 2,
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: colors.accentDark,
    position: 'absolute',
  },
  itemCard: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  topCard: {
    top: 15,
  },
  bottomCard: {
    top: 60,
  },
  shoesCard: {
    top: 105,
  },
  itemEmoji: {
    fontSize: 26,
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
