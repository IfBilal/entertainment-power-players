import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText } from './AppText';
import { Card } from './Card';
import { Logo } from './Logo';
import { colors, fontFamilies, radius, spacing } from '../theme';
import { useReducedMotion } from '../hooks/useReducedMotion';

type QuoteCardProps = {
  text: string;
  author: string;
  variant?: 'hero' | 'feed';
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
  entranceIndex?: number;
};

/** Editorial quote surface — oversized quote mark for the hero variant (spec §25). */
export function QuoteCard({
  text,
  author,
  variant = 'feed',
  isFavorite,
  onToggleFavorite,
  onShare,
  entranceIndex = 0,
}: QuoteCardProps) {
  const isHero = variant === 'hero';
  const reduceMotion = useReducedMotion();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(28)).current;
  const scale = useRef(new Animated.Value(0.97)).current;

  useEffect(() => {
    if (reduceMotion || process.env.NODE_ENV === 'test') {
      opacity.setValue(1);
      translateY.setValue(0);
      scale.setValue(1);
      return;
    }

    const entrance = Animated.sequence([
      Animated.delay(Math.min(entranceIndex * 75, 375)),
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 320, useNativeDriver: true }),
        Animated.spring(translateY, { toValue: 0, speed: 15, bounciness: 6, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, speed: 16, bounciness: 5, useNativeDriver: true }),
      ]),
    ]);
    entrance.start();
    return () => entrance.stop();
  }, [entranceIndex, opacity, reduceMotion, scale, translateY]);

  return (
    <Animated.View style={{ opacity, transform: [{ translateY }, { scale }] }}>
      <Card style={isHero ? styles.heroCard : styles.feedCard} elevation={isHero ? 'raised' : 'card'}>
        <AppText style={[styles.mark, isHero && styles.markHero]} color={colors.accentOrange}>
          &ldquo;
        </AppText>
        <AppText variant={isHero ? 'subtitle' : 'body'} style={styles.text}>
          {text}
        </AppText>
        <View style={styles.footer}>
          <AppText variant="caption" color={colors.textSecondary}>— {author}</AppText>
          {isHero ? (
            <Logo variant="mark" width={72} />
          ) : (
            <View style={styles.actions}>
              <Pressable
                onPress={onToggleFavorite}
                style={styles.feedAction}
                accessibilityRole="button"
                accessibilityState={{ selected: isFavorite }}
                accessibilityLabel={isFavorite ? `Remove saved quote by ${author}` : `Save quote by ${author}`}
              >
                <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={18} color={colors.accent} />
                <AppText variant="captionStrong" color={colors.accent}>{isFavorite ? 'Saved' : 'Save'}</AppText>
              </Pressable>
              <Pressable
                onPress={onShare}
                style={styles.feedAction}
                accessibilityRole="button"
                accessibilityLabel="Share quote"
              >
                <Ionicons name="share-outline" size={18} color={colors.accent} />
                <AppText variant="captionStrong" color={colors.accent}>Share</AppText>
              </Pressable>
            </View>
          )}
        </View>
        {isHero ? (
          <View style={styles.heroActions}>
            <Pressable onPress={onShare} style={styles.heroAction} accessibilityRole="button" accessibilityLabel="Share quote">
              <Ionicons name="share-social" size={19} color={colors.accentOrange} />
              <AppText variant="button">Share</AppText>
            </Pressable>
            <Pressable
              onPress={onToggleFavorite}
              style={styles.heroAction}
              accessibilityRole="button"
              accessibilityState={{ selected: isFavorite }}
              accessibilityLabel={isFavorite ? 'Remove saved quote of the day' : 'Save quote of the day'}
            >
              <Ionicons name={isFavorite ? 'bookmark' : 'bookmark-outline'} size={19} color={colors.accentAmber} />
              <AppText variant="button">{isFavorite ? 'Saved' : 'Save'}</AppText>
            </Pressable>
          </View>
        ) : null}
      </Card>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    padding: spacing.lg,
    borderRadius: radius.xl,
    backgroundColor: colors.surface,
  },
  feedCard: {},
  mark: {
    fontFamily: fontFamilies.displayBold,
    fontSize: 30,
    lineHeight: 30,
    marginBottom: -spacing.xs,
  },
  markHero: {
    fontSize: 48,
    lineHeight: 48,
    marginBottom: -spacing.sm,
  },
  text: {
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  feedAction: {
    minHeight: 40,
    minWidth: 72,
    paddingHorizontal: spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
  heroActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  heroAction: {
    flex: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    paddingVertical: 13,
  },
});
