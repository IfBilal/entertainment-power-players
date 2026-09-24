import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText } from './AppText';
import { colors, radius, spacing } from '../theme';

type FormFieldProps = TextInputProps & {
  label: string;
  error?: string;
};

/**
 * Labelled input, sized to the mockups: 44pt tall, label above the field in
 * plain sentence case (not the uppercase micro-label the old theme used), and
 * a reveal toggle whenever the field is a password.
 */
export function FormField({ label, error, style, onFocus, onBlur, secureTextEntry, ...rest }: FormFieldProps) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const isPassword = Boolean(secureTextEntry);
  const multiline = Boolean(rest.multiline);

  return (
    <View style={styles.container}>
      <AppText variant="label" color={colors.textPrimary} style={styles.label}>
        {label}
      </AppText>
      <View
        style={[
          styles.field,
          multiline && styles.fieldMultiline,
          focused && styles.fieldFocused,
          Boolean(error) && styles.fieldError,
        ]}
      >
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.textMuted}
          secureTextEntry={isPassword && !revealed}
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
        {isPassword ? (
          <Pressable
            onPress={() => setRevealed((v) => !v)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
          >
            <Ionicons
              name={revealed ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={colors.textTertiary}
            />
          </Pressable>
        ) : null}
      </View>
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
    gap: spacing.xs + 2,
  },
  label: {
    letterSpacing: 0,
  },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceSubtle,
  },
  fieldMultiline: {
    height: 88,
    alignItems: 'flex-start',
    paddingVertical: spacing.sm,
  },
  fieldFocused: {
    borderColor: colors.accentLime,
  },
  fieldError: {
    borderColor: colors.danger,
  },
  input: {
    flex: 1,
    height: '100%',
    color: colors.textPrimary,
    fontSize: 15,
  },
  error: {
    marginTop: -2,
  },
});
