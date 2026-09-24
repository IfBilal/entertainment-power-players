import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Button, IconTile, Screen } from '../../components';
import { colors, gradients, radius, spacing, type GradientToken, type IoniconName } from '../../theme';
import type { OnboardingStackParamList } from '../../navigation/types';
import { useReducedMotion } from '../../hooks/useReducedMotion';

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

function SlideEntrance({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(32)).current;
  const scale = useRef(new Animated.Value(0.98)).current;

  useEffect(() => {
    if (reduceMotion || process.env.NODE_ENV === 'test') {
      opacity.setValue(1);
      translateY.setValue(0);
      scale.setValue(1);
      return;
    }

    const entrance = Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 360, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, speed: 15, bounciness: 7, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, speed: 16, bounciness: 5, useNativeDriver: true }),
    ]);
    entrance.start();
    return () => entrance.stop();
  }, [opacity, reduceMotion, scale, translateY]);

  return (
    <Animated.View style={[styles.slideEntrance, { opacity, transform: [{ translateY }, { scale }] }]}>
      {children}
    </Animated.View>
  );
}

const slides: Slide[] = [
  {
    // The mockup breaks this across four narrow lines rather than two wide
    // ones, which is what gives the slide its poster-like proportions.
    title: 'Real\nConnections.\nBigger\nOpportunities.',
    body: 'Join a community of industry professionals, creators and decision makers.',
    photo: true,
  },
  {
    title: 'Track Your\nProgress.',
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

/**
 * Mockup 3: a tilted panel carrying a rising trend line, with the stat rows
 * overlapping its lower half.
 */
function StatPreview() {
  const rows: Array<{ icon: IoniconName; label: string; value: string; tone: GradientToken }> = [
    { icon: 'people-outline', label: 'Contacts', value: '12', tone: 'brand' },
    { icon: 'bookmark-outline', label: 'Events', value: '3', tone: 'green' },
    { icon: 'leaf-outline', label: 'Follow-ups', value: '5', tone: 'ember' },
  ];

  return (
    <View style={styles.previewWrap}>
      <View style={styles.chartPanel}>
        <LinearGradient
          colors={['rgba(144,208,16,0.14)', 'rgba(5,15,17,0.2)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Svg width="100%" height="100%" viewBox="0 0 300 150">
          <Defs>
            <SvgGradient id="trend" x1="0" y1="1" x2="1" y2="0">
              <Stop offset="0" stopColor="#75DA3D" />
              <Stop offset="0.65" stopColor="#9CBB2A" />
              <Stop offset="1" stopColor="#FC5D06" />
            </SvgGradient>
          </Defs>
          <Path
            d="M8 126 L46 112 L74 118 L104 96 L134 102 L164 70 L196 84 L226 40 L262 52 L292 14"
            stroke="url(#trend)"
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <Circle cx={196} cy={84} r={6} fill="#F0C010" />
          <Circle cx={292} cy={14} r={5} fill="#FC5D06" />
        </Svg>
      </View>

      <View style={styles.statCard}>
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
    </View>
  );
}

/**
 * Mockup 4: wide dark cards carrying a single outlined glyph, cascading down
 * and alternating left/right rather than sitting in a row. Each card is nearly
 * black with a coloured edge and a faint wash — the colour comes from the
 * glyph and the border, not a filled tile.
 */
function TileScatter({ tiles }: { tiles: NonNullable<Slide['tiles']> }) {
  return (
    <View style={styles.scatter}>
      {tiles.map((t, i) => {
        const warm = t.tone === 'ember';
        const hue = warm ? colors.accentOrange : colors.accentLime;
        return (
          <View
            key={t.icon}
            style={[
              styles.cascadeCard,
              { marginLeft: (i % 2 === 0 ? 0 : 74) + i * 6, borderColor: `${hue}55` },
            ]}
          >
            <LinearGradient
              colors={[`${hue}26`, 'rgba(5,15,17,0.15)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Ionicons name={t.icon} size={38} color={hue} />
          </View>
        );
      })}
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

        {/* The photo slide stacks headline-last over the image; the two
            illustrated slides lead with the headline and put the graphic
            underneath, as mockups 3 and 4 do. */}
        <SlideEntrance key={index}>
          <View style={slide.photo ? styles.body : styles.bodyTop}>
            <AppText variant="hero" style={styles.title}>
              {slide.title}
            </AppText>
            <AppText variant="body" color={colors.textSecondary} style={styles.slideBody}>
              {slide.body}
            </AppText>

            {slide.stat ? <StatPreview /> : null}
            {slide.tiles ? <TileScatter tiles={slide.tiles} /> : null}
          </View>
        </SlideEntrance>

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
  slideEntrance: { flex: 1 },
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
    // The mockup's image/crowd transition sits near 40% of the phone. Limiting
    // this frame to 62% keeps the contained portrait crop from dropping the
    // crowd and headline too far down the screen.
    height: '62%',
  },
  body: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: spacing.lg,
  },
  bodyTop: {
    flex: 1,
    paddingTop: spacing.xl,
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
  previewWrap: {
    marginTop: spacing.xxl,
  },
  chartPanel: {
    height: 150,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    // Slight tilt, as the mockup's panel sits off-axis behind the stat card.
    transform: [{ rotate: '-2deg' }],
  },
  statCard: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.sm + 2,
    marginTop: -spacing.xl - spacing.xs,
    marginHorizontal: spacing.sm,
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
    marginTop: spacing.xxl,
  },
  cascadeCard: {
    width: 165,
    height: 88,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    // Each card overlaps the one above it, as the mockup's stack does.
    marginTop: -spacing.lg,
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
