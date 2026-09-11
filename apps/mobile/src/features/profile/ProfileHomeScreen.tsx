import { StyleSheet, Switch, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, Card, Screen } from '../../components';
import { colors, spacing } from '../../theme';
import { useAppStore } from '../../store/useAppStore';
import type { ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileHome'>;

export function ProfileHomeScreen({ navigation }: Props) {
  const isPro = useAppStore((s) => s.isPro);
  const setIsPro = useAppStore((s) => s.setIsPro);

  return (
    <Screen>
      <AppText variant="title" style={styles.heading}>Profile</AppText>

      <Card style={styles.card}>
        <AppText variant="bodyStrong">Subscription</AppText>
        <AppText variant="caption" color={colors.textSecondary}>
          {isPro ? 'Pro — renews monthly' : 'Free plan'}
        </AppText>
        <Button label={isPro ? 'Manage subscription' : 'Upgrade to Pro'} onPress={() => navigation.navigate('Paywall', { reason: 'profile' })} />
      </Card>

      <Card style={styles.card}>
        <View style={styles.row}>
          <AppText variant="body">Demo: Pro entitlement</AppText>
          <Switch value={isPro} onValueChange={setIsPro} />
        </View>
        <AppText variant="caption" color={colors.textSecondary}>
          Stands in for the real RevenueCat + Firestore claim flow (Week 3). Lets you preview locked/unlocked screens now.
        </AppText>
      </Card>

      <Card style={styles.card}>
        <AppText variant="bodyStrong">Notifications</AppText>
        <View style={styles.row}>
          <AppText variant="body">Weekly digest</AppText>
          <Switch value onValueChange={() => undefined} />
        </View>
      </Card>

      <Button label="Privacy policy" variant="ghost" onPress={() => undefined} />
      <Button label="Terms of service" variant="ghost" onPress={() => undefined} />
      <Button label="Contact support" variant="ghost" onPress={() => undefined} />
      <Button label="Delete account" variant="ghost" onPress={() => undefined} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { marginBottom: spacing.md },
  card: { marginBottom: spacing.sm, gap: spacing.xs },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
