import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, FormField, Screen } from '../../components';
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
    <Screen>
      <AppText variant="label" color={colors.textTertiary}>WELCOME BACK</AppText>
      <AppText variant="display" style={styles.heading}>Keep building.</AppText>
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
        <Button label="Continue" onPress={handleLogin} disabled={submitting || !email || !password} />
        <Button label="Forgot password?" variant="ghost" onPress={() => navigation.navigate('ForgotPassword')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { marginTop: spacing.xs, marginBottom: spacing.lg },
  form: { gap: spacing.md },
});
