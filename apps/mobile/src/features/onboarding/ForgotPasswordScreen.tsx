import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, FormField, Screen } from '../../components';
import { colors, spacing } from '../../theme';
import { sendPasswordResetEmail } from '../../services/supabase/auth';
import type { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    setError(null);
    setSubmitting(true);
    try {
      await sendPasswordResetEmail(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send the reset email. Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <Screen>
        <AppText variant="label" color={colors.textTertiary}>CHECK YOUR EMAIL</AppText>
        <AppText variant="display" style={styles.heading}>You're ready to keep building.</AppText>
        <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>
          We sent a password reset link to {email.trim()}. Open it on this device to set a new password, then log in.
        </AppText>
        <Button label="Back to log in" onPress={() => navigation.goBack()} />
      </Screen>
    );
  }

  return (
    <Screen>
      <AppText variant="label" color={colors.textTertiary}>RESET PASSWORD</AppText>
      <AppText variant="display" style={styles.heading}>Choose a new password to get back in.</AppText>
      <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>
        We'll email you a reset link.
      </AppText>
      <View style={styles.form}>
        <FormField
          label="EMAIL"
          placeholder="you@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          error={error ?? undefined}
        />
        <Button label="Send reset link" onPress={handleSend} disabled={submitting || !email} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { marginTop: spacing.xs },
  subtitle: { marginTop: spacing.sm, marginBottom: spacing.lg },
  form: { gap: spacing.md },
});
