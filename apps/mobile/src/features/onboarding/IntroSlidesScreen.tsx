import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Button, Screen } from '../../components';
import { colors, radius, spacing, type IoniconName } from '../../theme';
import type { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'IntroSlides'>;

const slides: Array<{ icons: IoniconName[]; title: string; body: string }> = [
  {
    icons: ['git-network-outline'],
    title: 'Your career is built through connections.',
    body: 'Discover the people, actions and opportunities that move you forward.',
  },
  {
    icons: ['glasses-outline', 'film-outline', 'game-controller-outline', 'musical-notes-outline', 'trophy-outline'],
    title: 'Know your industry.',
    body: 'Explore people across Fashion, Film/TV, Gaming, Music and Sports.',
  },
  {
    icons: ['stats-chart-outline'],
    title: 'Make progress every week.',
    body: 'Track your conversations, events and follow-ups.',
  },
];

export function IntroSlidesScreen({ navigation }: Props) {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const isLast = index === slides.length - 1;

  function next() {
    if (isLast) {
      navigation.navigate('SignUp');
    } else {
      setIndex((i) => i + 1);
    }
  }

  return (
    <Screen>
      <View style={styles.skipRow}>
        <Button label="Skip" variant="ghost" onPress={() => navigation.navigate('SignUp')} />
      </View>
      <View style={styles.body}>
        <View style={styles.motif}>
          {slide.icons.map((icon) => (
            <Ionicons key={icon} name={icon} size={slide.icons.length > 1 ? 34 : 72} color={colors.accent} style={styles.motifIcon} />
          ))}
        </View>
        <AppText variant="display" style={styles.title}>{slide.title}</AppText>
        <AppText variant="body" color={colors.textSecondary} style={styles.slideBody}>
          {slide.body}
        </AppText>
      </View>
      <View style={styles.dots}>
        {slides.map((s, i) => (
          <View key={s.title} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
      <Button label={isLast ? 'Get started' : 'Next'} onPress={next} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  skipRow: {
    alignItems: 'flex-end',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
  },
  motif: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
    opacity: 0.9,
  },
  motifIcon: {
    opacity: 0.85,
  },
  title: {
    marginBottom: spacing.xs,
  },
  slideBody: {
    marginTop: spacing.sm,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.accent,
  },
});
