import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, Card, Screen } from '../../components';
import { colors, spacing } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import type { ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Paywall'>;

const benefits = [
  'Full contact directory across all five categories',
  'All six career challenge tracks',
  'Unlimited tracker history',
];

/**
 * Plan pricing/trial and the actual purchase flow are RevenueCat/Week 3 scope
 * (handbook §4.6). This screen wires the UI and the local `isPro` mock flag so
 * the paywall gate (src/utils/paywall.ts) can be built and tested now.
 */
export function PaywallScreen({ navigation }: Props) {
  const [plan, setPlan] = useState<'monthly' | 'annual'>('annual');
  const setIsPro = useAppStore((s) => s.setIsPro);

  function subscribe() {
    setIsPro(true);
    navigation.goBack();
  }

  return (
    <Screen>
      <AppText variant="title">Unlock Power Players Pro</AppText>
      <View style={styles.benefits}>
        {benefits.map((b) => (
          <AppText key={b} variant="body" color={colors.textSecondary}>
            {'•'} {b}
          </AppText>
        ))}
      </View>

      <View style={styles.plans}>
        <Card style={plan === 'monthly' ? styles.planSelected : undefined}>
          <Button label="Monthly" variant={plan === 'monthly' ? 'primary' : 'ghost'} onPress={() => setPlan('monthly')} />
        </Card>
        <Card style={plan === 'annual' ? styles.planSelected : undefined}>
          <Button label="Annual (save 20%)" variant={plan === 'annual' ? 'primary' : 'ghost'} onPress={() => setPlan('annual')} />
        </Card>
      </View>

      <Button label="Subscribe" onPress={subscribe} />
      <Button label="Restore purchases" variant="ghost" onPress={() => undefined} />
      <Button label="Not now" variant="ghost" onPress={() => navigation.goBack()} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  benefits: {
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.xs,
  },
  plans: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  planSelected: {
    borderColor: colors.accent,
  },
});
