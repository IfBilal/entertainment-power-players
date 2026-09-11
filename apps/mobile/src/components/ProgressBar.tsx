import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { colors, radius } from '../theme';

type ProgressBarProps = {
  progress: number; // 0..1
  height?: number;
};

export function ProgressBar({ progress, height = 6 }: ProgressBarProps) {
  const anim = useRef(new Animated.Value(0)).current;
  const clamped = Math.max(0, Math.min(1, progress));

  useEffect(() => {
    Animated.timing(anim, { toValue: clamped, duration: 380, useNativeDriver: false }).start();
  }, [clamped]);

  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <Animated.View style={[styles.fill, { width, borderRadius: height / 2 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.accent,
    borderRadius: radius.pill,
  },
});
