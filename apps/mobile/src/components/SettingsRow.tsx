import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { AppText } from './AppText';
import { colors, radius, spacing, type IoniconName, type MaterialCommunityIconName } from '../theme';

type SettingsRowProps = {
  icon: IoniconName | MaterialCommunityIconName;
  /** Defaults to Ionicons; set 'mci' to render `icon` from MaterialCommunityIcons instead. */
  iconFamily?: 'ionicons' | 'mci';
  title: string;
  subtitle?: string;
  onPress?: () => void;
  trailing?: ReactNode;
  tone?: 'default' | 'danger';
};

/** Icon + title + optional subtitle + chevron settings row (spec §26). */
export function SettingsRow({ icon, iconFamily = 'ionicons', title, subtitle, onPress, trailing, tone = 'default' }: SettingsRowProps) {
  const danger = tone === 'danger';
  const iconColor = danger ? colors.danger : colors.accent;

  return (
    <Pressable onPress={onPress} disabled={!onPress} style={styles.row}>
      <View style={[styles.iconWrap, danger && styles.iconWrapDanger]}>
        {iconFamily === 'mci'
          ? <MaterialCommunityIcons name={icon as MaterialCommunityIconName} size={18} color={iconColor} />
          : <Ionicons name={icon as IoniconName} size={18} color={iconColor} />}
      </View>
      <View style={styles.text}>
        <AppText variant="bodyStrong" color={danger ? colors.danger : colors.textPrimary}>
          {title}
        </AppText>
        {subtitle ? (
          <AppText variant="caption" color={colors.textSecondary}>
            {subtitle}
          </AppText>
        ) : null}
      </View>
      {trailing ?? (onPress ? <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} /> : null)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    backgroundColor: colors.accentFaint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapDanger: {
    backgroundColor: colors.dangerSoft,
  },
  text: {
    flex: 1,
  },
});
