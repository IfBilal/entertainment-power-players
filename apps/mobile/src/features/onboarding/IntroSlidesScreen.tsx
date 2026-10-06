import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Path, Stop } from 'react-native-svg';
import { AppText, Button, CategoryGlyph, IconTile, Screen } from '../../components';
import { colors, gradients, radius, spacing, type GradientToken, type IoniconName } from '../../theme';
import type { OnboardingStackParamList } from '../../navigation/types';
import { useReducedMotion } from '../../hooks/useReducedMotion';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'IntroSlides'>;

type Slide = {
  title: string;
  body: string;
  hero?: boolean;
  tiles?: Array<{ slug: string; tone: GradientToken }>;
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
    title: 'Real Connections.\nBigger Opportunities.',
    body: 'Join a community of industry professionals, creators and decision makers.',
    hero: true,
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
      { slug: 'film-tv', tone: 'ember' },
      { slug: 'music', tone: 'green' },
      { slug: 'gaming', tone: 'ember' },
      { slug: 'sports', tone: 'green' },
      { slug: 'fashion', tone: 'brand' },
    ],
  },
];

/** A centered, full-width illustration with its metrics grouped below. */
function CategoryHero() {
  const slugs = ['fashion', 'film-tv', 'gaming', 'music', 'sports'];
  return <View style={styles.categoryHero} accessibilityLabel="Fashion, Film and TV, Gaming, Music, and Sports">
    {slugs.map((slug) => <View key={slug} style={styles.categoryHeroIcon}><CategoryGlyph slug={slug} size={28} color={colors.accent} /></View>)}
  </View>;
}

function StatPreview() {
  const rows: Array<{ icon: IoniconName; label: string; value: string; tone: GradientToken }> = [
    { icon: 'people-outline', label: 'Contacts', value: '12', tone: 'brand' },
    { icon: 'bookmark-outline', label: 'Events', value: '3', tone: 'green' },
    { icon: 'leaf-outline', label: 'Follow-ups', value: '5', tone: 'ember' },
  ];

  return (
    <View style={styles.previewWrap} accessibilityLabel="Progress preview">
      <View style={styles.chartPanel}>
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

/** Symmetric category-only icon grid for the challenges introduction. */
function TileScatter({ tiles }: { tiles: NonNullable<Slide['tiles']> }) {
  return (
    <View style={styles.scatter}>
      {tiles.map((t) => {
        const warm = t.tone === 'ember';
        const hue = warm ? colors.accentOrange : colors.accentLime;
        return (
          <View
            key={t.slug}
            style={[
              styles.cascadeCard,
              { borderColor: `${hue}55` },
            ]}
          >
            <LinearGradient colors={[`${hue}16`, colors.surface]} style={StyleSheet.absoluteFill} />
            <CategoryGlyph slug={t.slug} size={38} color={hue} />
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
    <Screen padded={false}>
      <View style={styles.inner}>
        <View style={styles.topRow}>
          <AppText variant="bodyStrong" color={colors.accentAmber}>
            {index + 1}
            <AppText variant="bodyStrong" color={colors.textTertiary}>
              {` / ${slides.length}`}
            </AppText>
          </AppText>
        </View>

        <SlideEntrance key={index}>
          <View style={styles.bodyTop}>
            {slide.hero ? <CategoryHero /> : null}
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
    justifyContent: 'center',
    paddingTop: spacing.sm,
  },
  bodyTop: {
    flex: 1,
    paddingTop: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  slideBody: {
    marginTop: spacing.sm,
    maxWidth: 330,
    textAlign: 'center',
  },
  categoryHero: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: spacing.sm, maxWidth: 250, marginVertical: spacing.xxl },
  categoryHeroIcon: { width: 62, height: 62, borderRadius: 20, backgroundColor: colors.accentSoft, alignItems: 'center', justifyContent: 'center' },
  previewWrap: {
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
    marginTop: spacing.xxl,
  },
  chartPanel: {
    height: 150,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
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
    width: '100%',
    maxWidth: 330,
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  cascadeCard: {
    width: 96,
    height: 96,
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
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
