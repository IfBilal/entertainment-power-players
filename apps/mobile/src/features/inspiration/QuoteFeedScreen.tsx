import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { AppText, Card, Screen } from '../../components';
import { colors, spacing } from '../../theme';
import { mockQuotes, quoteOfTheDay, type Quote } from '../../services/mock/quotes';
import { useFavoritesStore } from '../../store/useFavoritesStore';

export function QuoteFeedScreen() {
  const favoriteIds = useFavoritesStore((s) => s.favoriteQuoteIds);
  const toggleQuote = useFavoritesStore((s) => s.toggleQuote);
  const featured = quoteOfTheDay(mockQuotes, new Date());

  function renderQuote(quote: Quote, isFeatured = false) {
    const isFavorite = favoriteIds.has(quote.id);
    return (
      <Card key={quote.id} style={isFeatured ? styles.featuredCard : styles.card}>
        <AppText variant={isFeatured ? 'subtitle' : 'body'}>&ldquo;{quote.text}&rdquo;</AppText>
        <View style={styles.footer}>
          <AppText variant="caption" color={colors.textSecondary}>— {quote.author}</AppText>
          <View style={styles.actions}>
            <Pressable onPress={() => toggleQuote(quote.id)} accessibilityLabel="Save quote">
              <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={18} color={colors.accent} />
            </Pressable>
            <Pressable accessibilityLabel="Share quote">
              <Ionicons name="share-outline" size={18} color={colors.accent} />
            </Pressable>
          </View>
        </View>
      </Card>
    );
  }

  return (
    <Screen>
      <AppText variant="title" style={styles.heading}>Inspiration</AppText>
      <FlatList
        data={mockQuotes.filter((q) => q.id !== featured?.id)}
        keyExtractor={(q) => q.id}
        ListHeaderComponent={featured ? (
          <View style={styles.featuredWrap}>
            <AppText variant="label" color={colors.textSecondary}>QUOTE OF THE DAY</AppText>
            {renderQuote(featured, true)}
          </View>
        ) : null}
        renderItem={({ item }) => renderQuote(item)}
        contentContainerStyle={styles.list}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  heading: { marginBottom: spacing.md },
  list: { gap: spacing.sm },
  featuredWrap: { marginBottom: spacing.md, gap: spacing.xs },
  featuredCard: { backgroundColor: colors.accent + '15' },
  card: {},
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  actions: { flexDirection: 'row', gap: spacing.md },
});
