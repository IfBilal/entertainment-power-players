import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from './AppText';
import { colors, spacing } from '../theme';

type SectionHeaderProps = {
  label: string;
  action?: { label: string; onPress: () => void };
};

/**
 * Small uppercase Inter label used as an editorial rule between major
 * sections — "YOUR INDUSTRY", "THIS WEEK", "YOUR PATH" (spec §56).
 */
export function SectionHeader({ label, action }: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <AppText variant="label" color={colors.textTertiary} style={styles.label}>
        {label}
      </AppText>
      {action ? (
        <Pressable onPress={action.onPress} hitSlop={8}>
          <AppText variant="label" color={colors.accent}>
            {action.label}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: {
    letterSpacing: 1.2,
  },
});
