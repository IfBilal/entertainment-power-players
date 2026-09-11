import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, type PressableProps } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AppText } from './AppText';
import { colors, radius, spacing } from '../theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'md' | 'lg';

type ButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  haptics?: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({ label, variant = 'primary', size = 'md', disabled, haptics = true, onPressIn, onPressOut, onPress, ...rest }: ButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn(e: Parameters<NonNullable<PressableProps['onPressIn']>>[0]) {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
    onPressIn?.(e);
  }

  function handlePressOut(e: Parameters<NonNullable<PressableProps['onPressOut']>>[0]) {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start();
    onPressOut?.(e);
  }

  function handlePress(e: Parameters<NonNullable<PressableProps['onPress']>>[0]) {
    if (haptics && !disabled) {
      Haptics.impactAsync(variant === 'destructive' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
    }
    onPress?.(e);
  }

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[
        styles.base,
        size === 'lg' && styles.lg,
        variantStyles[variant],
        disabled && styles.disabled,
        { transform: [{ scale }] },
      ]}
      {...rest}
    >
      <AppText variant="button" color={labelColor(variant)}>
        {label}
      </AppText>
    </AnimatedPressable>
  );
}

function labelColor(variant: ButtonVariant) {
  switch (variant) {
    case 'primary':
      return colors.textInverse;
    case 'destructive':
      return colors.danger;
    case 'secondary':
      return colors.ink;
    default:
      return colors.accent;
  }
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.pill,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lg: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  disabled: {
    opacity: 0.4,
  },
});

const variantStyles = StyleSheet.create({
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: colors.surfaceRaised,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  destructive: {
    backgroundColor: colors.dangerSoft,
  },
});
