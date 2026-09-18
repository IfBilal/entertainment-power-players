import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, Divider, FormField, Screen } from '../../components';
import { colors, spacing } from '../../theme';
import { signInWithGoogle, signUpWithEmail } from '../../services/supabase/auth';
import type { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'SignUp'>;

/**
 * Apple sign-in is deferred, not built -- no Apple Developer account exists
 * yet (client is providing one; see docs/week2-implementation-plan.md
 * decision #1). No Apple button here rather than a fake-functional one.
 */
export function SignUpScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEmailSignUp() {
    setError(null);
    setSubmitting(true);
    try {
      const data = await signUpWithEmail(email.trim(), password);
      if (data.session) {
        // Email confirmation is off (or already auto-confirmed) -- a real
        // session exists immediately. RootNavigator's auth listener picks
        // it up; move straight to the next onboarding step.
        navigation.navigate('TrackPicker');
      } else {
        // Email confirmation is required on this project -- no session yet.
        setError('Check your email to confirm your account, then log in.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignUp() {
    setError(null);
    setSubmitting(true);
    try {
      await signInWithGoogle();
      navigation.navigate('TrackPicker');
    } catch {
      setError('Google sign-in isn’t available in this preview — use the full build, or sign up with email.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen>
      <AppText variant="label" color={colors.textTertiary}>GET STARTED</AppText>
      <AppText variant="display" style={styles.heading}>Build your career here.</AppText>
      <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>
        Join the directory, tracker and challenges.
      </AppText>

      <View style={styles.form}>
        <FormField
          label="EMAIL"
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <FormField
          label="PASSWORD"
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          error={error ?? undefined}
        />
        <Button label="Sign up with email" onPress={handleEmailSignUp} disabled={submitting || !email || !password} />

        <View style={styles.dividerRow}>
          <Divider tone="subtle" style={styles.dividerLine} />
          <AppText variant="caption" color={colors.textTertiary}>or continue with</AppText>
          <Divider tone="subtle" style={styles.dividerLine} />
        </View>

        <Button label="Continue with Google" variant="secondary" onPress={handleGoogleSignUp} disabled={submitting} />
      </View>

      <View style={styles.footer}>
        <Button label="Already have an account? Log in" variant="ghost" onPress={() => navigation.navigate('Login')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { marginTop: spacing.xs },
  subtitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  form: {
    gap: spacing.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dividerLine: {
    flex: 1,
  },
  footer: {
    marginTop: 'auto',
    marginBottom: spacing.md,
  },
});
