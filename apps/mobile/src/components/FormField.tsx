import { useState } from 'react';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { AppText } from './AppText';
import { colors, radius, spacing } from '../theme';

type FormFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

/**
 * Labeled input with visible label above the field (spec §17 — never rely
 * solely on placeholders), accent focus border + soft glow, calm error state.
 */
export function FormField({ label, error, style, onFocus, onBlur, ...rest }: FormFieldProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      <AppText variant="captionStrong" color={colors.textSecondary} style={styles.label}>
        {label}
      </AppText>
      <TextInput
        style={[
          styles.input,
          focused && styles.inputFocused,
          Boolean(error) && styles.inputError,
          style,
        ]}
        placeholderTextColor={colors.textMuted}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        {...rest}
      />
      {error ? (
        <AppText variant="caption" color={colors.danger} style={styles.error}>
          {error}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  label: {
    letterSpacing: 0.2,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    minHeight: 50,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceRaised,
  },
  inputFocused: {
    borderColor: colors.accent,
    shadowColor: colors.accent,
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 0 },
  },
  inputError: {
    borderColor: colors.danger,
  },
  error: {
    marginTop: -2,
  },
});
