import { FlatList, Share, StyleSheet, View } from 'react-native';
import { AppText, QuoteCard, Screen, SectionHeader } from '../../components';
import { colors, spacing } from '../../theme';
import { mockQuotes, quoteOfTheDay, type Quote } from '../../services/mock/quotes';
import { useFavoritesStore } from '../../store/useFavoritesStore';

export function QuoteFeedScreen() {
  const favoriteIds = useFavoritesStore((s) => s.favoriteQuoteIds);
  const toggleQuote = useFavoritesStore((s) => s.toggleQuote);
  const featured = quoteOfTheDay(mockQuotes, new Date());

  function shareQuote(quote: Quote) {
    Share.share({ message: `"${quote.text}" — ${quote.author}` }).catch(() => undefined);
  }

  return (
    <Screen>
      <AppText variant="label" color={colors.textTertiary}>INSPIRATION</AppText>
      <AppText variant="display" style={styles.heading}>Keep going.</AppText>

      <FlatList
        data={mockQuotes.filter((q) => q.id !== featured?.id)}
        keyExtractor={(q) => q.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          featured ? (
            <View style={styles.featuredWrap}>
              <SectionHeader label="QUOTE OF THE DAY" />
              <QuoteCard
                variant="hero"
                text={featured.text}
                author={featured.author}
                isFavorite={favoriteIds.has(featured.id)}
                onToggleFavorite={() => toggleQuote(featured.id)}
                onShare={() => shareQuote(featured)}
              />
              <View style={styles.moreLabel}>
                <SectionHeader label="MORE TO EXPLORE" />
              </View>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <QuoteCard
            variant="feed"
            text={item.text}
            author={item.author}
            isFavorite={favoriteIds.has(item.id)}
            onToggleFavorite={() => toggleQuote(item.id)}
            onShare={() => shareQuote(item)}
          />
        )}
        contentContainerStyle={styles.list}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { marginTop: spacing.xs, marginBottom: spacing.md },
  list: { gap: spacing.sm, paddingBottom: spacing.lg },
  featuredWrap: { marginBottom: spacing.sm, gap: spacing.xs },
  moreLabel: { marginTop: spacing.lg },
});
