import { StyleSheet, View, type ViewProps } from 'react-native';
import { colors, radius, shadows, spacing, type ShadowToken } from '../theme';

type CardProps = ViewProps & {
  elevation?: ShadowToken;
  bordered?: boolean;
};

export function Card({ style, children, elevation = 'card', bordered = true, ...rest }: CardProps) {
  return (
    <View style={[styles.card, bordered && styles.bordered, shadows[elevation], style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  bordered: {
    borderWidth: 1,
    borderColor: colors.border,
  },
});
