import { StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors, radius, spacing } from '../theme';

type TagTone = 'accent' | 'neutral' | 'success' | 'warning' | 'danger';

type TagProps = {
  label: string;
  tone?: TagTone;
};

const toneStyles: Record<TagTone, { bg: string; text: string }> = {
  accent: { bg: colors.accentFaint, text: colors.accentDeep },
  neutral: { bg: colors.surfaceStrong, text: colors.textSecondary },
  success: { bg: colors.successSoft, text: colors.success },
  warning: { bg: colors.warningSoft, text: colors.warning },
  danger: { bg: colors.dangerSoft, text: colors.danger },
};

/** Compact status/category label — used sparingly, never as primary hierarchy (spec §15). */
export function Tag({ label, tone = 'neutral' }: TagProps) {
  const { bg, text } = toneStyles[tone];
  return (
    <View style={[styles.base, { backgroundColor: bg }]}>
      <AppText variant="captionStrong" color={text} numberOfLines={1}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
});
