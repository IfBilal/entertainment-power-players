import { StyleSheet, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, Screen } from '../../components';
import { colors, radius, spacing } from '../../theme';
import type { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  return (
    <Screen>
      <AppText variant="title">Log in</AppText>
      <View style={styles.form}>
        <TextInput placeholder="Email" autoCapitalize="none" keyboardType="email-address" style={styles.input} placeholderTextColor={colors.textSecondary} />
        <TextInput placeholder="Password" secureTextEntry style={styles.input} placeholderTextColor={colors.textSecondary} />
        <Button label="Log in" onPress={() => navigation.getParent()?.goBack()} />
        <Button label="Forgot password?" variant="ghost" onPress={() => navigation.navigate('ForgotPassword')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    color: colors.textPrimary,
  },
});
