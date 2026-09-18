import { StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText } from './AppText';
import { Button } from './Button';
import { colors, radius, spacing, type IoniconName } from '../theme';

type ErrorStateProps = {
  icon?: IoniconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onRetry?: () => void;
};

/** Calm, useful error surface — never a raw exception (spec §20). */
export function ErrorState({ icon = 'cloud-offline-outline', title, description, actionLabel = 'Try again', onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={24} color={colors.danger} />
      </View>
      <AppText variant="subtitle" style={styles.title}>
        {title}
      </AppText>
      {description ? (
        <AppText variant="caption" color={colors.textSecondary} style={styles.description}>
          {description}
        </AppText>
      ) : null}
      {onRetry ? (
        <View style={styles.button}>
          <Button label={actionLabel} variant="secondary" onPress={onRetry} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.dangerSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: spacing.md,
    textAlign: 'center',
  },
  description: {
    marginTop: spacing.xs,
    textAlign: 'center',
    maxWidth: 260,
  },
  button: {
    marginTop: spacing.md,
  },
});
