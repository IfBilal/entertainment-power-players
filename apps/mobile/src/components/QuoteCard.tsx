import { Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText } from './AppText';
import { Card } from './Card';
import { colors, fontFamilies, radius, spacing } from '../theme';

type QuoteCardProps = {
  text: string;
  author: string;
  variant?: 'hero' | 'feed';
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onShare: () => void;
};

/** Editorial quote surface — oversized quote mark for the hero variant (spec §25). */
export function QuoteCard({ text, author, variant = 'feed', isFavorite, onToggleFavorite, onShare }: QuoteCardProps) {
  const isHero = variant === 'hero';

  return (
    <Card style={isHero ? styles.heroCard : styles.feedCard} elevation={isHero ? 'raised' : 'card'}>
      <AppText style={[styles.mark, isHero && styles.markHero]} color={colors.accentSoft}>
        &ldquo;
      </AppText>
      <AppText variant={isHero ? 'subtitle' : 'body'} style={styles.text}>
        {text}
      </AppText>
      <View style={styles.footer}>
        <AppText variant="caption" color={colors.textSecondary}>
          — {author}
        </AppText>
        <View style={styles.actions}>
          <Pressable onPress={onToggleFavorite} hitSlop={8} accessibilityLabel={isFavorite ? 'Remove saved quote' : 'Save quote'}>
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={18} color={colors.accent} />
          </Pressable>
          <Pressable onPress={onShare} hitSlop={8} accessibilityLabel="Share quote">
            <Ionicons name="share-outline" size={18} color={colors.accent} />
          </Pressable>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    padding: spacing.lg,
    borderRadius: radius.xl,
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
    gap: spacing.md,
  },
});
