import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppText, Button, Screen } from '../../components';
import { colors, spacing } from '../../theme';
import type { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'IntroSlides'>;

const slides = [
  { title: 'Build your directory', body: 'A categorised contact book of the people who matter to your career.' },
  { title: 'Track your progress', body: 'Log contacts, events and follow-ups every week and watch the trend.' },
  { title: 'Take on challenges', body: 'Six tracks of career actions, one tick at a time.' },
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
        <AppText variant="title">{slide.title}</AppText>
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
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  dotActive: {
    backgroundColor: colors.accent,
  },
});
