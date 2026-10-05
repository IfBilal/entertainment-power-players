import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, View, type PressableProps } from 'react-native';
import * as Haptics from 'expo-haptics';
import { AppText } from './AppText';
import { colors, radius, spacing } from '../theme';
import { useReducedMotion } from '../hooks/useReducedMotion';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
type ButtonSize = 'md' | 'lg';

type ButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  haptics?: boolean;
  /** Stretch to the container width — the default for the mockups' CTAs. */
  fullWidth?: boolean;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  variant = 'primary',
  size = 'md',
  disabled,
  haptics = true,
  fullWidth,
  onPressIn,
  onPressOut,
  onPress,
  ...rest
}: ButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const reduceMotion = useReducedMotion();

  function handlePressIn(e: Parameters<NonNullable<PressableProps['onPressIn']>>[0]) {
    if (!reduceMotion) Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 40, bounciness: 4 }).start();
    onPressIn?.(e);
  }

  function handlePressOut(e: Parameters<NonNullable<PressableProps['onPressOut']>>[0]) {
    if (!reduceMotion) Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start();
    onPressOut?.(e);
  }

  function handlePress(e: Parameters<NonNullable<PressableProps['onPress']>>[0]) {
    if (haptics && !disabled) {
      Haptics.impactAsync(
        variant === 'destructive' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light,
      ).catch(() => undefined);
    }
    onPress?.(e);
  }

  const sizeStyle = size === 'lg' ? styles.lg : styles.base;

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      style={[
        styles.shell,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        { transform: [{ scale }] },
      ]}
      {...rest}
    >
      <View style={[styles.surface, sizeStyle, variantStyles[variant]]}>
        <AppText variant="button" color={labelColor(variant)}>
          {label}
        </AppText>
      </View>
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
      return colors.textPrimary;
    default:
      return colors.accentSoftText;
  }
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    alignSelf: 'flex-start',
  },
  fullWidth: {
    alignSelf: 'stretch',
  },
  surface: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.pill,
  },
  base: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  lg: {
    minHeight: 54,
    paddingHorizontal: spacing.xl,
  },
  disabled: {
    opacity: 0.4,
  },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.accent },
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
    borderWidth: 1,
    borderColor: colors.danger,
  },
});
