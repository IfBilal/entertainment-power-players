import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Button, Screen } from '../../components';
import { colors, radius, spacing } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import type { ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Paywall'>;

const benefits = [
  { icon: 'people-outline' as const, text: 'Full contact directory across all five categories' },
  { icon: 'trophy-outline' as const, text: 'All six career challenge tracks' },
  { icon: 'stats-chart-outline' as const, text: 'Unlimited tracker history' },
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
      <View style={styles.badge}>
        <Ionicons name="sparkles" size={16} color={colors.accentDeep} />
        <AppText variant="label" color={colors.accentDeep}>POWER PLAYERS PRO</AppText>
      </View>
      <AppText variant="display" style={styles.headline}>
        Open every door
      </AppText>

      <View style={styles.benefits}>
        {benefits.map((b) => (
          <View key={b.text} style={styles.benefitRow}>
            <View style={styles.benefitIcon}>
              <Ionicons name={b.icon} size={16} color={colors.accent} />
            </View>
            <AppText variant="body" style={styles.benefitText}>{b.text}</AppText>
          </View>
        ))}
      </View>

      <View style={styles.plans}>
        <PlanOption
          label="Annual"
          price="$59.99 / year"
          note="Save 20% · billed yearly"
          selected={plan === 'annual'}
          onPress={() => setPlan('annual')}
        />
        <PlanOption
          label="Monthly"
          price="$6.99 / month"
          selected={plan === 'monthly'}
          onPress={() => setPlan('monthly')}
        />
      </View>

      <Button label="Subscribe" size="lg" onPress={subscribe} />
      <View style={styles.footerLinks}>
        <Button label="Restore purchases" variant="ghost" onPress={() => undefined} />
        <Button label="Not now" variant="ghost" onPress={() => navigation.goBack()} />
      </View>
    </Screen>
  );
}

function PlanOption({
  label,
  price,
  note,
  selected,
  onPress,
}: {
  label: string;
  price: string;
  note?: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.planCard, selected && styles.planCardSelected]}>
      <View style={styles.radio}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
      <View style={styles.planText}>
        <AppText variant="bodyStrong">{label}</AppText>
        {note ? <AppText variant="caption" color={colors.accentDeep}>{note}</AppText> : null}
      </View>
      <AppText variant="bodyStrong">{price}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  headline: { marginTop: spacing.md, marginBottom: spacing.lg },
  benefits: { gap: spacing.sm, marginBottom: spacing.xl },
  benefitRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  benefitIcon: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  benefitText: { flex: 1 },
  plans: { gap: spacing.sm, marginBottom: spacing.lg },
  planCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.md,
    backgroundColor: colors.surfaceRaised,
  },
  planCardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
  planText: { flex: 1 },
  footerLinks: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xs },
});
