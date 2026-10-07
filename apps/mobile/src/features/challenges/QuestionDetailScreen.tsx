import { useEffect, useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, Screen } from '../../components';
import { colors, spacing } from '../../theme';
import { useQuestionActions, useQuestionProgress, useQuestions } from '../../hooks/useQuestions';
import type { ChallengesStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ChallengesStackParamList, 'QuestionDetail'>;

export function QuestionDetailScreen({ route, navigation }: Props) {
  const { questionId } = route.params;
  const questionsQuery = useQuestions();
  const progressQuery = useQuestionProgress();
  const actions = useQuestionActions(questionId);

  const question = questionsQuery.data?.find((q) => q.id === questionId);
  // Siblings come from the question's own data, not the route that led here,
  // so a deep link to the question alone still gives correct next/previous.
  const siblings = useMemo(
    () => (question ? (questionsQuery.data ?? []).filter((q) => q.categorySlug === question.categorySlug && q.challengeGroup === question.challengeGroup) : []),
    [questionsQuery.data, question],
  );
  const index = siblings.findIndex((q) => q.id === questionId);

  useEffect(() => {
    if (question) actions.open();
    // Only when the question identity changes -- not on every progress refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId, Boolean(question)]);

  if (questionsQuery.isPending) {
    return <Screen><AppText variant="body">Loading question…</AppText></Screen>;
  }
  if (questionsQuery.isError) {
    return <Screen><Button label="Retry loading question" onPress={() => questionsQuery.refetch()} /></Screen>;
  }
  if (!question) {
    return <Screen><AppText variant="body">This question is no longer available.</AppText></Screen>;
  }

  const progress = progressQuery.data?.[questionId];
  const revealed = Boolean(progress?.revealedAt);
  const completed = Boolean(progress?.completedAt);

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {siblings.length > 1 ? (
          <AppText variant="caption" color={colors.textSecondary} style={styles.position}>{`${index + 1} of ${siblings.length}`}</AppText>
        ) : null}
        <AppText variant="label" color={colors.accentOrange} style={styles.eyebrow}>{question.challengeGroup}</AppText>
        <AppText variant="title" style={styles.question}>{question.question}</AppText>

        {!revealed ? (
          <View style={styles.revealButton}><Button label="Reveal answer" fullWidth onPress={() => actions.reveal()} /></View>
        ) : (
          <View style={styles.panels}>
            <View style={styles.panel}>
              <AppText variant="label" color={colors.accent} style={styles.panelLabel}>ANSWER</AppText>
              <AppText variant="body" style={styles.panelBody}>{question.answer}</AppText>
            </View>
            <View style={styles.panel}>
              <AppText variant="label" color={colors.accent} style={styles.panelLabel}>WHY IT MATTERS</AppText>
              <AppText variant="body" style={styles.panelBody}>{question.why}</AppText>
            </View>
            <View style={styles.panel}>
              <AppText variant="label" color={colors.accent} style={styles.panelLabel}>POWER MOVE</AppText>
              <AppText variant="body" style={styles.panelBody}>{question.powerMove}</AppText>
            </View>
            <Button
              label={completed ? 'Completed' : 'Mark complete'}
              variant={completed ? 'secondary' : 'primary'}
              disabled={completed}
              fullWidth
              onPress={() => actions.complete()}
            />
          </View>
        )}
        {actions.error ? <AppText variant="caption" color={colors.danger} style={styles.error}>Couldn't save your progress. Please try again.</AppText> : null}

        {siblings.length > 1 ? (
          <View style={styles.nav}>
            <Button
              label="Previous"
              variant="ghost"
              disabled={index <= 0}
              onPress={() => index > 0 && navigation.navigate('QuestionDetail', { questionId: siblings[index - 1].id })}
            />
            <Button
              label="Next"
              variant="ghost"
              disabled={index < 0 || index >= siblings.length - 1}
              onPress={() => index >= 0 && index < siblings.length - 1 && navigation.navigate('QuestionDetail', { questionId: siblings[index + 1].id })}
            />
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { alignItems: 'center', paddingBottom: spacing.xl },
  position: { marginBottom: spacing.sm },
  eyebrow: { textAlign: 'center', letterSpacing: 1.2, marginBottom: spacing.sm },
  question: { textAlign: 'center', marginBottom: spacing.lg },
  revealButton: { width: '100%', marginTop: spacing.sm },
  panels: { width: '100%', gap: spacing.lg },
  panel: { gap: spacing.xs },
  panelLabel: { letterSpacing: 1 },
  panelBody: { lineHeight: 24 },
  error: { marginTop: spacing.sm, textAlign: 'center' },
  nav: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: spacing.xl },
});
