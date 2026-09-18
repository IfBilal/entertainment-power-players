import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText } from './AppText';
import { ProgressBar } from './ProgressBar';
import { colors, spacing } from '../theme';

type CounterControlProps = {
  count: number;
  target: number;
  onIncrement: () => void;
  onDecrement: () => void;
};

/** Counter-challenge stepper — "2 of 5" with +/- and a progress bar (spec §24). */
export function CounterControl({ count, target, onIncrement, onDecrement }: CounterControlProps) {
  const complete = count >= target;
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!complete) return;
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.12, useNativeDriver: true, speed: 40, bounciness: 8 }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }),
    ]).start();
  }, [complete]);

  return (
    <View style={styles.container}>
      <View style={styles.stepperRow}>
        <Pressable onPress={onDecrement} disabled={count <= 0} hitSlop={8} accessibilityLabel="Decrease count">
          <Ionicons name="remove-circle-outline" size={26} color={count <= 0 ? colors.border : colors.accent} />
        </Pressable>
        <Animated.View style={{ transform: [{ scale }] }}>
          <AppText variant="bodyStrong" color={complete ? colors.success : colors.textPrimary}>
            {count} of {target}
          </AppText>
        </Animated.View>
        <Pressable onPress={onIncrement} disabled={complete} hitSlop={8} accessibilityLabel="Increase count">
          <Ionicons name="add-circle-outline" size={26} color={complete ? colors.border : colors.accent} />
        </Pressable>
      </View>
      <ProgressBar progress={target > 0 ? count / target : 0} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
});
