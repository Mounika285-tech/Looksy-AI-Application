import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme/colors';
import { Button } from '../../components/Button';

export const WelcomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.brandName}>LookSy</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <View style={styles.fashionCard}>
            <Text style={styles.cardEmoji}>👗</Text>
            <View style={styles.cardLine} />
            <View style={[styles.cardLine, { width: '60%' }]} />
          </View>
          <View style={[styles.fashionCard, styles.fashionCardRight]}>
            <Text style={styles.cardEmoji}>👔</Text>
            <View style={styles.cardLine} />
            <View style={[styles.cardLine, { width: '40%' }]} />
          </View>
        </View>

        <Text style={styles.title}>Your Wardrobe,{"\n"}Digitized & Smart.</Text>
        <Text style={styles.subtitle}>
          The personal AI stylist that builds outfits, checks the weather, and plans your days seamlessly.
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          title="Get Started"
          variant="primary"
          onPress={() => navigation.navigate('Intro1')}
          style={styles.btn}
        />
        <View style={styles.loginRow}>
          <Text style={styles.loginLabel}>Already have an account? </Text>
          <Button
            title="Log In"
            variant="text"
            onPress={() => navigation.navigate('Login')}
            size="small"
            style={styles.textBtn}
          />
        </View>
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
    alignItems: 'center',
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  imageContainer: {
    height: 180,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 40,
  },
  fashionCard: {
    width: 110,
    height: 140,
    borderRadius: 24,
    backgroundColor: colors.white,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    transform: [{ rotate: '-8deg' }],
    zIndex: 2,
  },
  fashionCardRight: {
    backgroundColor: colors.accent,
    transform: [{ rotate: '8deg' }],
    marginLeft: -20,
    zIndex: 1,
  },
  cardEmoji: {
    fontSize: 42,
    marginBottom: 12,
  },
  cardLine: {
    width: '80%',
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceAlt,
    marginBottom: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 36,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 12,
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    width: '100%',
  },
  btn: {
    marginBottom: 16,
  },
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  textBtn: {
    paddingVertical: 4,
  },
});
