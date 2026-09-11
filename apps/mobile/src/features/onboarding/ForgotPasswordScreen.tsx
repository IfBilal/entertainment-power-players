import { StyleSheet, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, Screen } from '../../components';
import { colors, radius, spacing } from '../../theme';
import type { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  return (
    <Screen>
      <AppText variant="title">Reset your password</AppText>
      <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>
        We'll email you a reset link.
      </AppText>
      <View style={styles.form}>
        <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address" style={styles.input} placeholderTextColor={colors.textSecondary} />
        <Button label="Send reset link" onPress={() => navigation.goBack()} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: spacing.xs, marginBottom: spacing.lg },
  form: { gap: spacing.sm },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    color: colors.textPrimary,
  },
});
