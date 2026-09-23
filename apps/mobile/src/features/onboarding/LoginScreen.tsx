import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, Divider, FormField, Logo, Screen } from '../../components';
import { colors, spacing } from '../../theme';
import { signInWithEmail } from '../../services/supabase/auth';
import type { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);
    setSubmitting(true);
    try {
      await signInWithEmail(email.trim(), password);
      // Route through Splash again rather than guessing here -- it already
      // knows how to wait for the profile fetch and decide between
      // TrackPicker (no tracks yet) and doing nothing (RootNavigator swaps
      // to Main once tracks are confirmed present). Avoids duplicating that
      // async decision logic and racing the profile fetch.
      navigation.replace('Splash');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wrong email or password.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen aurora="warm">
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Logo variant="mark" width={132} />
          <AppText variant="display" style={styles.heading}>
            Welcome back
          </AppText>
          <AppText variant="body" color={colors.textSecondary}>
            Sign in to continue your journey.
          </AppText>
        </View>

        <View style={styles.form}>
          <FormField
            label="Email address"
            placeholder="you@domain.com"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <FormField
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            error={error ?? undefined}
          />
          <Button
            label={submitting ? 'Signing in…' : 'Log In'}
            size="lg"
            fullWidth
            onPress={handleLogin}
            disabled={submitting || !email || !password}
          />
          <View style={styles.center}>
            <Button
              label="Forgot password?"
              variant="ghost"
              onPress={() => navigation.navigate('ForgotPassword')}
            />
          </View>
        </View>

        <View style={styles.dividerRow}>
          <Divider style={styles.dividerLine} />
          <AppText variant="caption" color={colors.textTertiary}>
            or
          </AppText>
          <Divider style={styles.dividerLine} />
        </View>

        <Button
          label="Continue with Google"
          variant="secondary"
          size="lg"
          fullWidth
          onPress={() => navigation.navigate('SignUp')}
        />

        <View style={styles.footer}>
          <AppText variant="caption" color={colors.textSecondary}>
            Don't have an account?{' '}
          </AppText>
          <Button label="Sign up" variant="ghost" onPress={() => navigation.navigate('SignUp')} />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
    gap: spacing.xs,
  },
  heading: {
    marginTop: spacing.sm,
  },
  form: {
    gap: spacing.md,
  },
  center: {
    alignSelf: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
});
