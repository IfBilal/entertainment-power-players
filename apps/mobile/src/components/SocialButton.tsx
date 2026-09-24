import { Pressable, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText } from './AppText';
import { colors, radius, spacing } from '../theme';

type SocialButtonProps = {
  provider: 'apple' | 'google';
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

const providers = {
  apple: { icon: 'logo-apple', color: colors.textPrimary },
  google: { icon: 'logo-google', color: '#EA4335' },
} as const;

/** Dark pill with a hairline border, brand glyph then label centred as a
 *  group — the Apple/Google rows shared by Login and Sign Up. */
export function SocialButton({ provider, label, onPress, disabled }: SocialButtonProps) {
  const { icon, color } = providers[provider];

  return (
    <Pressable
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name={icon} size={19} color={color} />
      <AppText variant="bodyStrong">{label}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
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
  disabled: {
    opacity: 0.4,
  },
});
