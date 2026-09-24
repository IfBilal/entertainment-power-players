import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
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
      <Screen aurora="streaks">
        <AppText variant="display" style={styles.heading}>
          Check your email
        </AppText>
        <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>
          We sent a password reset link to {email.trim()}. Open it on this device to set a new password, then log in.
        </AppText>
        <Button label="Back to login" size="lg" fullWidth onPress={() => navigation.goBack()} />
      </Screen>
    );
  }

  return (
    <Screen aurora="streaks">
      <Pressable
        onPress={() => navigation.goBack()}
        hitSlop={12}
        style={styles.back}
        accessibilityRole="button"
        accessibilityLabel="Go back"
      >
        <Ionicons name="chevron-back" size={26} color={colors.textPrimary} />
      </Pressable>

      <AppText variant="display" style={styles.heading}>
        Reset your password
      </AppText>
      <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>
        Enter your email and we'll send you a link to reset your password.
      </AppText>

      <FormField
        label="Email address"
        placeholder="you@domain.com"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        error={error ?? undefined}
      />

      <View style={styles.ctaWrap}>
        <Button
          label={submitting ? 'Sending…' : 'Send Reset Link'}
          size="lg"
          fullWidth
          onPress={handleSend}
          disabled={submitting || !email}
        />
      </View>

      <Pressable
        onPress={() => navigation.goBack()}
        style={styles.backToLogin}
        accessibilityRole="button"
      >
        <Ionicons name="arrow-back" size={19} color={colors.textSecondary} />
        <AppText variant="body" color={colors.textSecondary}>
          Back to login
        </AppText>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    marginLeft: -spacing.xs,
  },
  heading: {
    marginTop: spacing.xxl,
  },
  subtitle: {
    marginTop: spacing.sm,
    marginBottom: spacing.xl,
    maxWidth: 310,
  },
  ctaWrap: {
    marginTop: spacing.lg,
  },
  backToLogin: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    alignSelf: 'flex-start',
    marginTop: spacing.lg,
    paddingVertical: spacing.sm,
  },
});
