import { StyleSheet, View, type ViewProps } from 'react-native';
import { colors } from '../theme';

type DividerProps = ViewProps & {
  tone?: 'default' | 'subtle';
};

/** Thin editorial rule used to separate major sections (spec §56/§115). */
export function Divider({ tone = 'default', style, ...rest }: DividerProps) {
  return <View style={[styles.base, tone === 'subtle' && styles.subtle, style]} {...rest} />;
}

const styles = StyleSheet.create({
  base: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
  },
  subtle: {
    backgroundColor: colors.borderSubtle,
  },
});
