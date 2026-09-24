import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Button, Logo, Screen } from '../../components';
import { colors, radius, spacing } from '../../theme';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

const benefits = ['Full contact directory', 'All challenge track details'];

/**
 * Product selection is ready here; entitlement must only come from RevenueCat
 * (handbook §2), never from a local button press. Billing SDK wiring is not
 * configured in this Expo Go app yet, so purchase and restore fail honestly.
 */
export function PaywallScreen({ navigation, route }: Props) {
  const [plan, setPlan] = useState<'monthly' | 'annual'>(route.params?.plan ?? 'annual');

  function subscribe() {
    Alert.alert('Purchases are unavailable', 'Premium billing is not connected yet. Your account has not been changed.');
  }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable accessibilityRole="button" accessibilityLabel="Close paywall" onPress={() => navigation.goBack()} style={styles.close}><Ionicons name="chevron-back" size={24} color={colors.textSecondary} /></Pressable>
        <View style={styles.brand}><Logo variant="mark" width={76} /></View>
        <AppText variant="display" style={styles.headline}>Unlock the full{`\n`}experience</AppText>
        <AppText variant="body" color={colors.textSecondary} style={styles.subheadline}>Get access to the complete directory,{`\n`}challenges and more.</AppText>

        <View style={styles.benefits}>
          {benefits.map((benefit) => (
            <View key={benefit} style={styles.benefit}>
              <Ionicons name="checkmark-circle" size={22} color={colors.accentLime} />
              <AppText variant="body">{benefit}</AppText>
            </View>
          ))}
        </View>

        <View style={styles.plans}>
          <Pressable accessibilityRole="radio" accessibilityLabel="Annual plan, $49.99 per year" accessibilityState={{ selected: plan === 'annual' }} onPress={() => setPlan('annual')} style={[styles.planCard, plan === 'annual' && styles.planSelected]}>
            <AppText variant="bodyStrong">Annual</AppText><AppText variant="title">$49.99 <AppText variant="caption">/ year</AppText></AppText><AppText variant="caption" color={colors.accentLime}>Save 25%</AppText>
          </Pressable>
          <Pressable accessibilityRole="radio" accessibilityLabel="Monthly plan, $9.99 per month" accessibilityState={{ selected: plan === 'monthly' }} onPress={() => setPlan('monthly')} style={[styles.planCard, plan === 'monthly' && styles.planSelected]}>
            <AppText variant="bodyStrong">Monthly</AppText><AppText variant="title">$9.99 <AppText variant="caption">/ month</AppText></AppText>
          </Pressable>
        </View>

        <Button label="Subscribe" size="lg" onPress={subscribe} />
        <View style={styles.footerLinks}>
          <Button label="Restore Purchase" variant="ghost" onPress={() => Alert.alert('Restore unavailable', 'Premium billing is not connected yet.')} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl, paddingTop: spacing.sm },
  close: { alignSelf: 'flex-start', minHeight: 30, justifyContent: 'center' },
  brand: { alignItems: 'center', marginTop: spacing.md },
  headline: { marginTop: spacing.md, textAlign: 'center' },
  subheadline: { marginTop: spacing.sm, marginBottom: spacing.lg, textAlign: 'center' },
  benefits: { gap: spacing.sm, marginBottom: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.md },
  benefit: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  plans: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  planCard: { flex: 1, minHeight: 118, justifyContent: 'center', gap: 6, borderWidth: 1, borderColor: colors.borderStrong, borderRadius: radius.lg, paddingHorizontal: spacing.md, backgroundColor: colors.surface },
  planSelected: { borderColor: colors.accentLime, backgroundColor: 'rgba(111, 209, 59, 0.14)' },
  footerLinks: { alignItems: 'center', marginTop: spacing.xs },
});
