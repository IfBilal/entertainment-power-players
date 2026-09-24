import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Button, FormField, Screen, SocialButton } from '../../components';
import { colors, spacing } from '../../theme';
import { signInWithGoogle, signUpWithEmail } from '../../services/supabase/auth';
import type { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'SignUp'>;

export function SignUpScreen({ navigation }: Props) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEmailSignUp() {
    setError(null);
    setSubmitting(true);
    try {
      const data = await signUpWithEmail(email.trim(), password, fullName.trim() || undefined);
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

  function handleAppleSignUp() {
    // The mockup shows an Apple button, so the layout keeps its place --
    // but Apple sign-in needs an Apple Developer account the project does
    // not have yet (docs/week2-implementation-plan.md decision #1). Saying so
    // beats a button that silently does nothing.
    setError('Apple sign-in isn’t set up yet — use Google or email for now.');
  }

  return (
    <Screen aurora="warm">
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
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
          Create your account
        </AppText>
        <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>
          Join Entertainment Power Players today.
        </AppText>

        <View style={styles.rule} />

        <View style={styles.form}>
          <FormField
            label="Full name"
            placeholder="John Doe"
            autoCapitalize="words"
            autoComplete="name"
            value={fullName}
            onChangeText={setFullName}
          />
          <FormField
            label="Email address"
            placeholder="you@domain.com"
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <FormField
            label="Password"
            placeholder="Create a strong password"
            secureTextEntry
            autoComplete="new-password"
            value={password}
            onChangeText={setPassword}
            error={error ?? undefined}
          />
        </View>

        <View style={styles.ctaWrap}>
          <Button
            label={submitting ? 'Creating account…' : 'Sign Up'}
            size="lg"
            fullWidth
            onPress={handleEmailSignUp}
            disabled={submitting || !email || !password}
          />
        </View>

        <AppText variant="body" color={colors.textSecondary} style={styles.or}>
          or
        </AppText>

        <View style={styles.socials}>
          <SocialButton
            provider="apple"
            label="Continue with Apple"
            onPress={handleAppleSignUp}
            disabled={submitting}
          />
          <SocialButton
            provider="google"
            label="Continue with Google"
            onPress={handleGoogleSignUp}
            disabled={submitting}
          />
        </View>

        <Pressable
          onPress={() => navigation.navigate('Login')}
          style={styles.footer}
          accessibilityRole="button"
        >
          <AppText variant="body" color={colors.textSecondary}>
            Already have an account?{' '}
          </AppText>
          <AppText variant="bodyStrong" color={colors.accentAmber}>
            Log in
          </AppText>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingBottom: spacing.lg,
  },
  back: {
    alignSelf: 'flex-start',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
    marginLeft: -spacing.xs,
  },
  heading: {
    marginBottom: spacing.xs,
  },
  subtitle: {
    maxWidth: 300,
  },
  /** Hairline under the intro block, as the mockup has. */
  rule: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderStrong,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  form: {
    gap: spacing.md,
  },
  ctaWrap: {
    marginTop: spacing.lg,
  },
  or: {
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  socials: {
    gap: spacing.sm + 4,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
});
