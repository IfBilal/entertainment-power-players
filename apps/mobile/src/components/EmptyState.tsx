import { StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AppText } from './AppText';
import { colors, radius, spacing, type IoniconName, type MaterialCommunityIconName } from '../theme';

type EmptyStateProps = {
  icon: IoniconName | MaterialCommunityIconName;
  /** Defaults to Ionicons; set 'mci' to render `icon` from MaterialCommunityIcons instead. */
  iconFamily?: 'ionicons' | 'mci';
  title: string;
  description?: string;
};

export function EmptyState({ icon, iconFamily = 'ionicons', title, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        {iconFamily === 'mci'
          ? <MaterialCommunityIcons name={icon as MaterialCommunityIconName} size={26} color={colors.accent} />
          : <Ionicons name={icon as IoniconName} size={26} color={colors.accent} />}
      </View>
      <AppText variant="subtitle" style={styles.title}>
        {title}
      </AppText>
      {description ? (
        <AppText variant="caption" color={colors.textSecondary} style={styles.description}>
          {description}
        </AppText>
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
    width: 56,
    height: 56,
    borderRadius: radius.pill,
    backgroundColor: colors.accentSoft,
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
});
