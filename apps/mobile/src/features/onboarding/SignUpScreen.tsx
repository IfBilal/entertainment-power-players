import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, Screen } from '../../components';
import { colors, spacing } from '../../theme';
import type { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'SignUp'>;

/**
 * UI only — no auth wiring yet (Week 2 scope, handbook §6). Apple sign-in is
 * mandatory here because other third-party providers are present (App Store
 * requirement, handbook §4.1).
 */
export function SignUpScreen({ navigation }: Props) {
  return (
    <Screen>
      <AppText variant="title">Create your account</AppText>
      <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>
        Join the directory, tracker and challenges.
      </AppText>

      <View style={styles.form}>
        <Button label="Continue with Apple" variant="secondary" onPress={() => navigation.navigate('TrackPicker')} />
        <Button label="Continue with Google" variant="secondary" onPress={() => navigation.navigate('TrackPicker')} />
        <Button label="Sign up with email" onPress={() => navigation.navigate('TrackPicker')} />
      </View>

      <View style={styles.footer}>
        <Button label="Already have an account? Log in" variant="ghost" onPress={() => navigation.navigate('Login')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },
  form: {
    gap: spacing.sm,
  },
  footer: {
    marginTop: 'auto',
    marginBottom: spacing.md,
  },
});
