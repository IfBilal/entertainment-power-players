import { Image } from 'expo-image';
import type { StyleProp, ImageStyle } from 'react-native';

const logoFull = require('../../assets/logo-full.png');
const logoMark = require('../../assets/logo-mark.png');

type LogoProps = {
  /** `full` includes the "Entertainment Power Players" wordmark; `mark` is the
   *  star + epp lockup only, for tighter spots like the paywall header. */
  variant?: 'full' | 'mark';
  width?: number;
  style?: StyleProp<ImageStyle>;
};

/** Intrinsic aspect ratios of the supplied artwork, so callers set one
 *  dimension and the other follows without distortion. */
const ratios = {
  full: 2000 / 2000,
  mark: 2500 / 2119,
} as const;

export function Logo({ variant = 'full', width = 160, style }: LogoProps) {
  return (
    <Image
      source={variant === 'full' ? logoFull : logoMark}
      style={[{ width, height: width / ratios[variant] }, style]}
      contentFit="contain"
      accessibilityLabel="Entertainment Power Players"
    />
  );
}
