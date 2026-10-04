import { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { AppText } from './AppText';
import { colors } from '../theme';
import { useReducedMotion } from '../hooks/useReducedMotion';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type ProgressRingProps = {
  progress: number; // 0..1
  size?: number;
  strokeWidth?: number;
  label?: string;
};

/** Animated progress focal point; reduced-motion users get the final state. */
export function ProgressRing({ progress, size = 84, strokeWidth = 8, label }: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(1, progress));
  const reduceMotion = useReducedMotion();
  const anim = useRef(new Animated.Value(reduceMotion || process.env.NODE_ENV === 'test' ? clamped : 0)).current;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    if (reduceMotion || process.env.NODE_ENV === 'test') {
      anim.setValue(clamped);
      return;
    }
    const animation = Animated.timing(anim, { toValue: clamped, duration: 850, easing: Easing.out(Easing.cubic), useNativeDriver: false });
    animation.start();
    return () => animation.stop();
  }, [anim, clamped, reduceMotion]);

  const strokeDashoffset = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Defs>
          <LinearGradient id="ringGradient" x1="0" y1="1" x2="1" y2="0">
            <Stop offset="0" stopColor={colors.accentLime} />
            <Stop offset="1" stopColor={colors.accentOrange} />
          </LinearGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.surfaceStrong}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {Platform.OS === 'web' ? (
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={colors.accentLime}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={circumference * (1 - clamped)}
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        ) : (
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#ringGradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        )}
      </Svg>
      {label ? (
        <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignItems: 'center', justifyContent: 'center' }}>
          <AppText variant="bodyStrong">{label}</AppText>
        </View>
      ) : null}
    </View>
  );
}
