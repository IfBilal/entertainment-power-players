import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, Card, Screen } from '../../components';
import { colors, radius, spacing } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import type { ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileHome'>;

export function ProfileHomeScreen({ navigation }: Props) {
  const isPro = useAppStore((s) => s.isPro);

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppText variant="title" style={styles.heading}>Profile</AppText>

        <Card style={styles.card}>
          <View style={styles.subRow}>
            <AppText variant="bodyStrong">Subscription</AppText>
            {isPro ? (
              <View style={styles.proBadge}>
                <AppText variant="label" color={colors.accentDeep}>PRO</AppText>
              </View>
            ) : null}
          </View>
          <AppText variant="caption" color={colors.textSecondary}>
            {isPro ? 'Renews monthly' : 'Free plan'}
          </AppText>
          <Button
            label={isPro ? 'Manage subscription' : 'Upgrade to Pro'}
            onPress={() => navigation.getParent()?.getParent()?.navigate('Paywall', { reason: 'profile' })}
          />
        </Card>

        <Card style={styles.card}>
          <AppText variant="bodyStrong">Notifications</AppText>
          <View style={styles.row}>
            <AppText variant="body">Weekly digest</AppText>
            <Switch value onValueChange={() => undefined} trackColor={{ true: colors.accent, false: colors.border }} thumbColor={colors.surfaceRaised} />
          </View>
        </Card>

        <View style={styles.links}>
          <Button label="Privacy policy" variant="ghost" onPress={() => undefined} />
          <Button label="Terms of service" variant="ghost" onPress={() => undefined} />
          <Button label="Contact support" variant="ghost" onPress={() => undefined} />
          <Button label="Delete account" variant="ghost" onPress={() => undefined} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
  heading: { marginBottom: spacing.md },
  card: { marginBottom: spacing.sm, gap: spacing.xs },
  subRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  proBadge: {
    backgroundColor: colors.accentSoft,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  links: { marginTop: spacing.xs },
});
