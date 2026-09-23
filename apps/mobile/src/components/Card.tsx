import { StyleSheet, View, type ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, radius, shadows, spacing, type ShadowToken } from '../theme';

type CardProps = ViewProps & {
  elevation?: ShadowToken;
  bordered?: boolean;
  /** Adds the faint top-left sheen the mockups use on feature cards. */
  sheen?: boolean;
};

export function Card({
  style,
  children,
  elevation = 'card',
  bordered = true,
  sheen = false,
  ...rest
}: CardProps) {
  return (
    <View style={[styles.card, bordered && styles.bordered, shadows[elevation], style]} {...rest}>
      {sheen ? (
        <LinearGradient
          colors={[...gradients.cardSheen.colors]}
          start={gradients.cardSheen.start}
          end={gradients.cardSheen.end}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : null}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: spacing.md,
    overflow: 'hidden',
  },
  bordered: {
    borderWidth: 1,
    borderColor: colors.border,
  },
});
