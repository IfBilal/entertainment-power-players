import { useState } from 'react';
import { FlatList, Pressable, Share, StyleSheet, View } from 'react-native';
import { AppText, QuoteCard, Screen, SectionHeader } from '../../components';
import { colors, spacing } from '../../theme';
import { mockQuotes, type Quote } from '../../services/mock/quotes';
import { useFavoritesStore } from '../../store/useFavoritesStore';

export function QuoteFeedScreen() {
  const favoriteIds = useFavoritesStore((s) => s.favoriteQuoteIds);
  const toggleQuote = useFavoritesStore((s) => s.toggleQuote);
  const [tab, setTab] = useState<'quotes' | 'saved'>('quotes');
  const featured = mockQuotes.find((quote) => quote.id === 'quote_featured');
  const visibleQuotes = tab === 'saved' ? mockQuotes.filter((quote) => favoriteIds.has(quote.id)) : mockQuotes.filter((quote) => quote.id !== featured?.id);

  function shareQuote(quote: Quote) {
    Share.share({ message: `"${quote.text}" — ${quote.author}` }).catch(() => undefined);
  }

  return (
    <Screen>
      <View style={styles.heading}><Pressable onPress={() => undefined}><AppText variant="title">‹</AppText></Pressable><AppText variant="title">Inspiration</AppText></View>
      <View style={styles.tabs}><Pressable onPress={() => setTab('quotes')} style={[styles.tab, tab === 'quotes' && styles.tabActive]}><AppText variant="captionStrong" color={tab === 'quotes' ? colors.textPrimary : colors.textSecondary}>Quotes</AppText></Pressable><Pressable onPress={() => setTab('saved')} style={[styles.tab, tab === 'saved' && styles.tabActive]}><AppText variant="captionStrong" color={tab === 'saved' ? colors.textPrimary : colors.textSecondary}>Saved</AppText></Pressable></View>
      <FlatList
        data={visibleQuotes}
        keyExtractor={(q) => q.id}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          featured && tab === 'quotes' ? (
            <View style={styles.featuredWrap}>
              <QuoteCard
                variant="hero"
                text={featured.text}
                author={featured.author}
                isFavorite={favoriteIds.has(featured.id)}
                onToggleFavorite={() => toggleQuote(featured.id)}
                onShare={() => shareQuote(featured)}
              />
              <View style={styles.moreLabel}><SectionHeader label="MORE TO EXPLORE" /></View>
            </View>
          ) : null
        }
        renderItem={({ item, index }) => (
          <QuoteCard
            variant="feed"
            entranceIndex={index + 1}
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
  heading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  tabs: { flexDirection: 'row', padding: 3, borderRadius: 14, backgroundColor: colors.surface, marginBottom: spacing.md },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: 11 },
  tabActive: { backgroundColor: colors.surfaceStrong },
  list: { gap: spacing.sm, paddingBottom: spacing.lg },
  featuredWrap: { marginBottom: spacing.sm, gap: spacing.xs },
  moreLabel: { marginTop: spacing.lg },
});
