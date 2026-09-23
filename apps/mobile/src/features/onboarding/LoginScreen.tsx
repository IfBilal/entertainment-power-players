import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Button, FormField, Logo, Screen } from '../../components';
import { colors, radius, spacing } from '../../theme';
import { signInWithEmail } from '../../services/supabase/auth';
import type { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Login'>;

/** Apple / Google row from the mockup: dark pill, hairline border, brand glyph
 *  then label, both centred as a group. */
function SocialButton({
  icon,
  label,
  color,
  onPress,
}: {
  icon: 'logo-apple' | 'logo-google';
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.social} onPress={onPress} accessibilityRole="button">
      <Ionicons name={icon} size={19} color={color} />
      <AppText variant="bodyStrong">{label}</AppText>
    </Pressable>
  );
}

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
          <Logo variant="mark" width={124} />
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
            autoComplete="email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <FormField
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            autoComplete="current-password"
            value={password}
            onChangeText={setPassword}
            error={error ?? undefined}
          />
        </View>

        <View style={styles.ctaWrap}>
          <Button
            label={submitting ? 'Signing in…' : 'Log In'}
            size="lg"
            fullWidth
            onPress={handleLogin}
            disabled={submitting || !email || !password}
          />
        </View>

        <Pressable
          onPress={() => navigation.navigate('ForgotPassword')}
          style={styles.forgot}
          accessibilityRole="button"
        >
          <AppText variant="body" color={colors.textSecondary}>
            Forgot password?
          </AppText>
        </Pressable>

        <View style={styles.dividerRow}>
          <View style={styles.rule} />
          <AppText variant="body" color={colors.textSecondary}>
            or
          </AppText>
          <View style={styles.rule} />
        </View>

        <View style={styles.socials}>
          <SocialButton
            icon="logo-apple"
            label="Continue with Apple"
            color={colors.textPrimary}
            onPress={() => navigation.navigate('SignUp')}
          />
          <SocialButton
            icon="logo-google"
            label="Continue with Google"
            color="#EA4335"
            onPress={() => navigation.navigate('SignUp')}
          />
        </View>

        <Pressable
          onPress={() => navigation.navigate('SignUp')}
          style={styles.footer}
          accessibilityRole="button"
        >
          <AppText variant="body" color={colors.textSecondary}>
            Don't have an account?{' '}
          </AppText>
          <AppText variant="bodyStrong" color={colors.accentAmber}>
            Sign up
          </AppText>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

// Vertical rhythm mirrors the measured mockup: logo top ~55pt, headline ~158pt,
// CTA ~419pt, socials ~592/653pt on a 390x844 screen.
const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    paddingBottom: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  heading: {
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  form: {
    marginTop: spacing.lg + 4,
    gap: spacing.md,
  },
  ctaWrap: {
    marginTop: spacing.lg,
  },
  forgot: {
    alignSelf: 'center',
    paddingVertical: spacing.md,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
  },
  rule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderStrong,
  },
  socials: {
    gap: spacing.sm + 4,
  },
  social: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm + 2,
    height: 46,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceSubtle,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.lg + 4,
  },
});
