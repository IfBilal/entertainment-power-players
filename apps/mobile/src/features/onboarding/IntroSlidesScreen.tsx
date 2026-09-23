import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Button, IconTile, Screen } from '../../components';
import { colors, gradients, radius, spacing, type GradientToken, type IoniconName } from '../../theme';
import type { OnboardingStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'IntroSlides'>;

const concertPhoto = require('../../../assets/onboarding-concert.png');

type Slide = {
  title: string;
  body: string;
  /** Slide 1 is photographic (mockup 2); the rest are built from components. */
  photo?: boolean;
  tiles?: Array<{ icon: IoniconName; tone: GradientToken }>;
  stat?: boolean;
};

const slides: Slide[] = [
  {
    // The mockup breaks this across four narrow lines rather than two wide
    // ones, which is what gives the slide its poster-like proportions.
    title: 'Real\nConnections.\nBigger\nOpportunities.',
    body: 'Join a community of industry professionals, creators and decision makers.',
    photo: true,
  },
  {
    title: 'Track Your Progress.',
    body: 'Keep a log of your contacts, events and follow-ups. Stay on top of your goals.',
    stat: true,
  },
  {
    title: 'Take on Challenges.',
    body: 'Complete industry-backed challenges and build your career, one step at a time.',
    tiles: [
      { icon: 'film-outline', tone: 'ember' },
      { icon: 'musical-notes-outline', tone: 'green' },
      { icon: 'game-controller-outline', tone: 'ember' },
      { icon: 'basketball-outline', tone: 'green' },
      { icon: 'glasses-outline', tone: 'brand' },
    ],
  },
];

/** Mockup 3: a small stat card floating over a rising trend line. */
function StatPreview() {
  const rows: Array<{ icon: IoniconName; label: string; value: string; tone: GradientToken }> = [
    { icon: 'people-outline', label: 'Contacts', value: '12', tone: 'brand' },
    { icon: 'calendar-outline', label: 'Events', value: '3', tone: 'green' },
    { icon: 'repeat-outline', label: 'Follow-ups', value: '5', tone: 'ember' },
  ];

  return (
    <View style={styles.preview}>
      <LinearGradient
        colors={['rgba(144,208,16,0.16)', 'rgba(240,80,0,0.10)']}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      {rows.map((r) => (
        <View key={r.label} style={styles.previewRow}>
          <IconTile icon={r.icon} tone={r.tone} size="sm" soft />
          <AppText variant="body" style={styles.previewLabel}>
            {r.label}
          </AppText>
          <AppText variant="bodyStrong">{r.value}</AppText>
        </View>
      ))}
    </View>
  );
}

/** Mockup 4: a loose scatter of category tiles. */
function TileScatter({ tiles }: { tiles: NonNullable<Slide['tiles']> }) {
  return (
    <View style={styles.scatter}>
      {tiles.map((t, i) => (
        <View key={t.icon} style={[styles.scatterItem, i % 2 === 1 && styles.scatterItemOffset]}>
          <IconTile icon={t.icon} tone={t.tone} size="lg" />
        </View>
      ))}
    </View>
  );
}

export function IntroSlidesScreen({ navigation }: Props) {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  const isLast = index === slides.length - 1;

  function next() {
    if (isLast) navigation.navigate('SignUp');
    else setIndex((i) => i + 1);
  }

  return (
    <Screen aurora={slide.photo ? false : 'warm'} padded={false}>
      {slide.photo ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {/* `contain` rather than `cover`: the source is 1290x2000 (0.645)
              against a ~0.46 phone, so cover crops the sides hard and throws
              most of the crowd away. Containing it keeps the full frame, and
              the letterboxed edges fall under the scrim and the background. */}
          <Image source={concertPhoto} style={styles.photo} contentFit="contain" />
          {/* Scrim stays clear of the upper half so the stage and crowd read as
              brightly as they do in the mockup, then ramps hard behind the
              headline block in the lower third. */}
          <LinearGradient
            colors={['rgba(5,15,17,0)', 'rgba(5,15,17,0.10)', 'rgba(5,15,17,0.92)', '#050F11']}
            locations={[0, 0.34, 0.60, 0.74]}
            style={StyleSheet.absoluteFill}
          />
        </View>
      ) : null}

      <View style={styles.inner}>
        <View style={styles.topRow}>
          <AppText variant="bodyStrong" color={colors.accentAmber}>
            {index + 1}
            <AppText variant="bodyStrong" color={colors.textTertiary}>
              {` / ${slides.length}`}
            </AppText>
          </AppText>
        </View>

        <View style={styles.body}>
          {slide.stat ? <StatPreview /> : null}
          {slide.tiles ? <TileScatter tiles={slide.tiles} /> : null}

          <AppText variant="hero" style={styles.title}>
            {slide.title}
          </AppText>
          <AppText variant="body" color={colors.textSecondary} style={styles.slideBody}>
            {slide.body}
          </AppText>
        </View>

        <Button label={isLast ? 'Get Started' : 'Next'} onPress={next} size="lg" fullWidth />

        {/* The mockup puts the progress dots *below* the CTA, not above it. */}
        <View style={styles.dots}>
          {slides.map((s, i) => (
            <View key={s.title} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.sm,
  },
  photo: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    // Contained at full width the frame is ~1.55x as tall as it is wide, so it
    // ends around 62% of the screen -- which is where the mockup's crowd line
    // sits, with the headline block starting just below it.
    height: '78%',
  },
  body: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.lg,
  },
  title: {
    // Measured off the mockup: ~30px over ~36pt lines, tighter than the
    // default hero so four lines still clear the body copy.
    fontSize: 30,
    lineHeight: 36,
    marginBottom: spacing.xs,
  },
  slideBody: {
    marginTop: spacing.sm,
    maxWidth: 330,
  },
  preview: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    padding: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 4,
  },
  previewLabel: {
    flex: 1,
  },
  scatter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm + 4,
    marginBottom: spacing.xl,
  },
  scatterItem: {
    transform: [{ rotate: '-4deg' }],
  },
  scatterItemOffset: {
    transform: [{ rotate: '5deg' }, { translateY: 10 }],
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.borderStrong,
  },
  dotActive: {
    backgroundColor: colors.accentLime,
    width: 20,
  },
});
