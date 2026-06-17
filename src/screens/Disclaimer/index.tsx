import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../theme';
import { STRINGS } from '../../constants/strings';
import { ROUTES } from '../../constants/routes';
import { CustomButton } from '../../components/common/CustomButton';
import { CustomHeader } from '../../components/common/CustomHeader';

export const DisclaimerScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const handleAccept = () => {
    navigation.replace(ROUTES.PROFILE_SETUP);
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title={STRINGS.DISCLAIMER.TITLE} />
      
      {/* Ambient glowing rings */}
      <View style={styles.blurRing1} />
      <View style={styles.blurRing2} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {/* Header Shield Circle */}
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>🛡️</Text>
          </View>
          
          <Text style={styles.welcomeText}>Welcome to MoveHub</Text>
          <Text style={styles.introText}>
            MoveHub is a digital tracking tool designed to encourage personal physical activity, habit building, and general wellness.
          </Text>

          {/* Structured Warn Box */}
          <View style={styles.disclosureBox}>
            <Text style={styles.disclosureHeader}>⚠️ IMPORTANT DISCLOSURES</Text>
            
            <View style={styles.bulletRow}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                This application is <Text style={styles.boldText}>not a medical device</Text> and has not been cleared or approved by the CDSCO or any medical regulatory authority.
              </Text>
            </View>

            <View style={styles.bulletRow}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                The exercise routines, calorie calculations, and tracking targets generated are intended strictly for <Text style={styles.boldText}>fitness and motivational purposes</Text>. They do not constitute medical advice or a treatment prescription.
              </Text>
            </View>

            <View style={styles.bulletRow}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                If you have a history of chronic health conditions (heart issues, hypertension, etc.), you <Text style={styles.boldText}>must consult a qualified physician</Text> before beginning any physical routine.
              </Text>
            </View>
          </View>

          <Text style={styles.consentText}>
            By clicking 'Accept & Begin', you acknowledge that you understand and agree to these terms.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <CustomButton
          title={STRINGS.DISCLAIMER.ACCEPT_BUTTON}
          onPress={handleAccept}
          variant="primary"
          style={styles.button}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    position: 'relative',
  },
  blurRing1: {
    position: 'absolute',
    top: '15%',
    left: '-10%',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.colors.primaryLight + '30',
    zIndex: -1,
  },
  blurRing2: {
    position: 'absolute',
    bottom: '25%',
    right: '-10%',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: theme.colors.secondary + '10',
    zIndex: -1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.spacing.borderRadiusLg,
    padding: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    elevation: 3,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  iconText: {
    fontSize: 32,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: theme.fonts.weights.bold as any,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 4,
  },
  introText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  disclosureBox: {
    backgroundColor: '#FFFBEB', // Light warning amber background
    borderWidth: 1,
    borderColor: '#FDE68A', // Amber border
    borderRadius: theme.spacing.borderRadiusMd,
    padding: theme.spacing.md,
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  disclosureHeader: {
    fontSize: 12.5,
    fontWeight: theme.fonts.weights.bold as any,
    color: '#B45309', // Dark amber text
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bulletDot: {
    fontSize: 16,
    color: '#B45309',
    marginRight: 8,
    lineHeight: 18,
  },
  bulletText: {
    fontSize: 13,
    color: '#78350F', // Warm brown color
    lineHeight: 18,
    flex: 1,
  },
  boldText: {
    fontWeight: 'bold',
  },
  consentText: {
    fontSize: 12,
    color: theme.colors.textLight,
    textAlign: 'center',
    lineHeight: 18,
    marginTop: theme.spacing.sm,
  },
  footer: {
    padding: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  button: {
    width: '100%',
  },
});

export default DisclaimerScreen;
