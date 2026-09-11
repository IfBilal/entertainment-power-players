import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Button, Screen } from '../../components';
import { colors, radius, spacing } from '../../theme';
import { tracks } from '../../services/mock/challenges';
import { useAppStore } from '../../store/useAppStore';
import type { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'TrackPicker'>;

export function TrackPickerScreen({ navigation }: Props) {
  const [selected, setSelected] = useState<string[]>([]);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  function toggle(slug: string) {
    setSelected((prev) => (prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]));
  }

  return (
    <Screen>
      <AppText variant="title">Pick your tracks</AppText>
      <AppText variant="body" color={colors.textSecondary} style={styles.subtitle}>
        Choose one or more — you can change this later in Profile.
      </AppText>
      <FlatList
        data={tracks}
        keyExtractor={(t) => t.slug}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          const isSelected = selected.includes(item.slug);
          return (
            <Pressable style={[styles.row, isSelected && styles.rowSelected]} onPress={() => toggle(item.slug)}>
              <AppText variant="bodyStrong">{item.name}</AppText>
              {isSelected ? <Ionicons name="checkmark-circle" size={22} color={colors.accent} /> : <Ionicons name="ellipse-outline" size={22} color={colors.border} />}
            </Pressable>
          );
        }}
      />
      <Button
        label="Continue"
        disabled={selected.length === 0}
        onPress={() => completeOnboarding(selected)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  subtitle: { marginTop: spacing.xs, marginBottom: spacing.md },
  list: { gap: spacing.sm, paddingBottom: spacing.md },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  rowSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.surface,
  },
});
