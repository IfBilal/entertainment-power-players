import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Button, PaywallCard, Screen, SubscriptionOption } from '../../components';
import { colors, radius, spacing } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Paywall'>;

const benefits = [
  { icon: 'people-outline' as const, text: 'Full contact directory' },
  { icon: 'trophy-outline' as const, text: 'All challenge tracks' },
  { icon: 'stats-chart-outline' as const, text: 'Advanced tracker & goals' },
  { icon: 'sparkles-outline' as const, text: 'Exclusive inspiration content' },
];

/**
 * Plan pricing/trial and the actual purchase flow are RevenueCat/Week 3 scope
 * (handbook §4.6). This screen wires the UI and the local `isPro` mock flag so
 * the paywall gate (src/utils/paywall.ts) can be built and tested now.
 */
export function PaywallScreen({ navigation }: Props) {
  const [plan, setPlan] = useState<'monthly' | 'annual'>('monthly');
  const setIsPro = useAppStore((s) => s.setIsPro);

  function subscribe() {
    setIsPro(true);
    navigation.goBack();
  }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Ionicons name="close-outline" size={22} color={colors.textSecondary} style={styles.close} onPress={() => navigation.goBack()} />
        <AppText variant="display" style={styles.headline}>Unlock the full{`\n`}experience</AppText>
        <AppText variant="body" color={colors.textSecondary} style={styles.subheadline}>Get access to the complete directory,{`\n`}challenges and more.</AppText>

        <View style={styles.benefits}>
          {benefits.map((b) => (
            <PaywallCard key={b.text} icon={b.icon} text={b.text} />
          ))}
        </View>

        <View style={styles.plans}>
          <SubscriptionOption
            label="Yearly"
            price="$89.99 / year"
            note="Save 25%"
            selected={plan === 'annual'}
            onPress={() => setPlan('annual')}
          />
          <SubscriptionOption
            label="Monthly"
            price="$9.99 / month"
            selected={plan === 'monthly'}
            onPress={() => setPlan('monthly')}
          />
        </View>

        <Button label="Start Free Trial" size="lg" onPress={subscribe} />
        <View style={styles.footerLinks}>
          <Button label="Restore Purchase" variant="ghost" onPress={() => undefined} />
          <Button label="Not now" variant="ghost" onPress={() => navigation.goBack()} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl, paddingTop: spacing.sm },
  close: { alignSelf: 'flex-end' },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    marginTop: spacing.sm,
  },
  headline: { marginTop: spacing.md },
  subheadline: { marginTop: spacing.sm, marginBottom: spacing.lg },
  benefits: { gap: spacing.sm, marginBottom: spacing.xl },
  plans: { gap: spacing.sm, marginBottom: spacing.lg },
  footerLinks: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xs },
});
