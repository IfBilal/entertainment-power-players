import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Button, FormField, Screen } from '../../components';
import { colors, spacing } from '../../theme';
import { updatePassword } from '../../services/supabase/auth';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen({ navigation }: Props) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setError(null);
    if (password.length < 6) {
      setError('Use at least 6 characters for your password.');
      return;
    }
    if (password !== confirmPassword) {
      setError('The passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      await updatePassword(password);
      setComplete(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update your password. Request a new reset link and try again.');
    } finally {
      setSubmitting(false);
    }
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
        {complete ? 'Password updated' : 'Create a new password'}
      </AppText>
      <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>
        {complete
          ? 'Your password has been changed securely. You can continue using the app.'
          : 'Choose a new password for your account.'}
      </AppText>

      {complete ? (
        <Button label="Continue to the app" size="lg" fullWidth onPress={() => navigation.goBack()} />
      ) : (
        <>
          <View style={styles.form}>
            <FormField
              label="New password"
              placeholder="At least 6 characters"
              secureTextEntry
              autoComplete="new-password"
              value={password}
              onChangeText={setPassword}
            />
            <FormField
              label="Confirm new password"
              placeholder="Re-enter your password"
              secureTextEntry
              autoComplete="new-password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={error ?? undefined}
            />
          </View>
          <View style={styles.cta}>
            <Button
              label={submitting ? 'Updating…' : 'Update password'}
              size="lg"
              fullWidth
              onPress={handleSave}
              disabled={submitting || !password || !confirmPassword}
            />
          </View>
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: { alignSelf: 'flex-start', marginTop: spacing.sm, marginLeft: -spacing.xs },
  heading: { marginTop: spacing.xxl, textAlign: 'center' },
  subtitle: { marginTop: spacing.sm, marginBottom: spacing.xl, maxWidth: 320, alignSelf: 'center', textAlign: 'center' },
  form: { gap: spacing.md },
  cta: { marginTop: spacing.xl },
});
