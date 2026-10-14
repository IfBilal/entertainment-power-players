import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, radius } from '../theme';
import { useReducedMotion } from '../hooks/useReducedMotion';

type ProgressBarProps = {
  progress: number; // 0..1
  height?: number;
  /** Which brand gradient fills the bar — lets the home screen's stacked bars
   *  differentiate contacts / events / follow-ups as they do in the mockups. */
  tone?: 'brand' | 'green' | 'ember' | 'barAmber' | 'barLime' | 'barOrange';
};

export function ProgressBar({ progress, height = 6, tone = 'brand' }: ProgressBarProps) {
  const reduceMotion = useReducedMotion();
  const clamped = Math.max(0, Math.min(1, progress));
  const anim = useRef(new Animated.Value(reduceMotion || process.env.NODE_ENV === 'test' ? clamped : 0)).current;
  const gradient = gradients[tone];

  useEffect(() => {
    if (reduceMotion || process.env.NODE_ENV === 'test') {
      anim.setValue(clamped);
      return;
    }
    const animation = Animated.timing(anim, { toValue: clamped, duration: 380, useNativeDriver: false });
    animation.start();
    return () => animation.stop();
  }, [anim, clamped, reduceMotion]);

  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <Animated.View style={[styles.fill, { width, borderRadius: height / 2 }]}>
        <LinearGradient
          colors={[...gradient.colors]}
          start={gradient.start}
          end={gradient.end}
          style={[StyleSheet.absoluteFill, { borderRadius: height / 2 }]}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.surfaceStrong,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
});
