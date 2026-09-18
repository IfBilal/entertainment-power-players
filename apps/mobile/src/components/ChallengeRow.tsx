import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText } from './AppText';
import { Card } from './Card';
import { CounterControl } from './CounterControl';
import { colors, spacing } from '../theme';

type ChallengeRowProps = {
  title: string;
  description?: string;
  type: 'single' | 'counter';
  isComplete: boolean;
  count: number;
  target?: number;
  note: string;
  onToggle: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onNoteChange: (note: string) => void;
};

/** Single/counter challenge card with completion feedback and a collapsed note field (spec §24). */
export function ChallengeRow({
  title,
  description,
  type,
  isComplete,
  count,
  target = 1,
  note,
  onToggle,
  onIncrement,
  onDecrement,
  onNoteChange,
}: ChallengeRowProps) {
  const [noteOpen, setNoteOpen] = useState(Boolean(note));

  return (
    <Card style={[styles.card, isComplete && styles.cardComplete]}>
      <View style={styles.header}>
        <View style={styles.text}>
          <AppText variant="bodyStrong" color={isComplete ? colors.textSecondary : colors.textPrimary}>
            {title}
          </AppText>
          {description ? (
            <AppText variant="caption" color={colors.textTertiary} style={styles.description}>
              {description}
            </AppText>
          ) : null}
        </View>
        {type === 'single' ? (
          <Pressable onPress={onToggle} accessibilityRole="checkbox" accessibilityState={{ checked: isComplete }} hitSlop={8}>
            <Ionicons name={isComplete ? 'checkmark-circle' : 'ellipse-outline'} size={28} color={isComplete ? colors.success : colors.accent} />
          </Pressable>
        ) : null}
      </View>

      {type === 'counter' ? (
        <CounterControl count={count} target={target} onIncrement={onIncrement} onDecrement={onDecrement} />
      ) : null}

      {noteOpen ? (
        <TextInput
          placeholder="Add a note (optional)"
          value={note}
          onChangeText={onNoteChange}
          style={styles.noteInput}
          placeholderTextColor={colors.textMuted}
          multiline
        />
      ) : (
        <Pressable onPress={() => setNoteOpen(true)} hitSlop={6}>
          <AppText variant="caption" color={colors.accent} style={styles.addNote}>
            Add a note
          </AppText>
        </Pressable>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.sm,
  },
  cardComplete: {
    backgroundColor: colors.surfaceSubtle,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  text: {
    flex: 1,
    marginRight: spacing.sm,
    gap: 2,
  },
  description: {
    marginTop: 1,
  },
  addNote: {
    marginTop: spacing.xs,
  },
  noteInput: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderSubtle,
    paddingTop: spacing.sm,
    color: colors.textPrimary,
    minHeight: 20,
  },
});
