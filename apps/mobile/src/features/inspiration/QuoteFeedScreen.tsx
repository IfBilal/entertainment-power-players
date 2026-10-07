import { useEffect, useRef, useState } from 'react';
import { AppState, FlatList, Modal, Pressable, Share, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Sharing from 'expo-sharing';
import { captureRef } from 'react-native-view-shot';
import { AppText, Logo, QuoteCard, Screen, SectionHeader } from '../../components';
import { colors, spacing } from '../../theme';
import type { QuoteRecord } from '../../types/week3';
import { useDailyQuote } from '../../hooks/useContent';
import { useSavedQuotes } from '../../hooks/useSavedQuotes';

type ShareableQuote = { id: string; text: string; author: string };

export function QuoteFeedScreen() {
  const { ids: favoriteIds, toggle: toggleQuote, saveError, query, quotes: quotesQuery } = useSavedQuotes();
  const dailyQuoteQuery = useDailyQuote();
  const [tab, setTab] = useState<'quotes' | 'saved'>('quotes');
  const [shareQuote, setShareQuote] = useState<ShareableQuote | null>(null);
  const [sharing, setSharing] = useState(false);
  const [shareError, setShareError] = useState(false);
  const shareCardRef = useRef<View>(null);
  useEffect(() => {
    // Catch a local-midnight rollover, or a day change from travel, while the app stays open.
    if (process.env.NODE_ENV === 'test') return;
    const listener = AppState.addEventListener('change', (state) => { if (state === 'active') void dailyQuoteQuery.refetch(); });
    return () => listener.remove();
  }, [dailyQuoteQuery]);
  const allQuotes = (quotesQuery.data ?? []) as QuoteRecord[];
  const featured: ShareableQuote | null = dailyQuoteQuery.data
    ? { id: dailyQuoteQuery.data.quoteId, text: dailyQuoteQuery.data.text, author: dailyQuoteQuery.data.author }
    : null;
  const visibleQuotes = tab === 'saved' ? allQuotes.filter((quote) => favoriteIds.has(quote.id)) : allQuotes.filter((quote) => quote.id !== featured?.id);

  async function shareImage() {
    if (!shareQuote || sharing) return;
    setSharing(true);
    setShareError(false);
    try {
      if (!await Sharing.isAvailableAsync()) {
        await Share.share({ message: `"${shareQuote.text}" — ${shareQuote.author}` });
      } else {
        if (!shareCardRef.current) throw new Error('Share card is not ready');
        const uri = await captureRef(shareCardRef.current, { format: 'png', quality: 1, result: 'tmpfile', width: 1080, height: 1440 });
        await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Share inspiration' });
      }
      setShareQuote(null);
    } catch {
      setShareError(true);
    } finally {
      setSharing(false);
    }
  }

  return (
    <Screen>
      <AppText variant="label" color={colors.accentOrange} style={styles.eyebrow}>WORDS THAT MOVE YOU</AppText>
      <View style={styles.heading}><AppText variant="display">Inspiration</AppText></View>
      <View style={styles.tabs}><Pressable onPress={() => setTab('quotes')} style={[styles.tab, tab === 'quotes' && styles.tabActive]}><AppText variant="bodyStrong" color={tab === 'quotes' ? colors.textInverse : colors.textSecondary}>Quotes</AppText></Pressable><Pressable onPress={() => setTab('saved')} style={[styles.tab, tab === 'saved' && styles.tabActive]}><AppText variant="bodyStrong" color={tab === 'saved' ? colors.textInverse : colors.textSecondary}>Saved</AppText></Pressable></View>
      {query.isError ? <Pressable onPress={() => query.refetch()} accessibilityRole="button"><AppText variant="caption" color={colors.danger}>Couldn't load saved quotes. Tap to retry.</AppText></Pressable> : null}
      {quotesQuery.isError ? <Pressable onPress={() => quotesQuery.refetch()} accessibilityRole="button"><AppText variant="caption" color={colors.danger}>Couldn't load quotes. Tap to retry.</AppText></Pressable> : null}
      {dailyQuoteQuery.isError ? <Pressable onPress={() => dailyQuoteQuery.refetch()} accessibilityRole="button"><AppText variant="caption" color={colors.danger}>Couldn't load today's quote. Tap to retry.</AppText></Pressable> : null}
      {saveError ? <AppText variant="caption" color={colors.danger}>Couldn't save quote. Please try again.</AppText> : null}
      {shareError ? <AppText variant="caption" color={colors.danger}>Couldn't share the image. Please try again.</AppText> : null}
      <FlatList
        data={visibleQuotes}
        keyExtractor={(q) => q.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={<AppText variant="body" color={colors.textSecondary} style={styles.empty}>{quotesQuery.isPending ? 'Loading quotes…' : tab === 'saved' ? 'No saved quotes yet.' : 'No quotes available right now.'}</AppText>}
        ListHeaderComponent={
          featured && tab === 'quotes' ? (
            <View style={styles.featuredWrap}>
              <QuoteCard
                variant="hero"
                text={featured.text}
                author={featured.author}
                isFavorite={favoriteIds.has(featured.id)}
                onToggleFavorite={() => toggleQuote(featured.id)}
                onShare={() => { setShareQuote(featured); setShareError(false); }}
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
            onShare={() => { setShareQuote(item); setShareError(false); }}
          />
        )}
        contentContainerStyle={styles.list}
      />
      <Modal visible={Boolean(shareQuote)} transparent animationType="fade" onRequestClose={() => setShareQuote(null)}>
        <View style={styles.shareOverlay}>
          <View ref={shareCardRef} collapsable={false} style={styles.shareCard}>
            <LinearGradient colors={[colors.backgroundDeep, colors.surfaceStrong, colors.background]} style={StyleSheet.absoluteFill} />
            <AppText variant="captionStrong" color={colors.accentAmber}>INSPIRATION</AppText>
            <AppText style={styles.shareMark} color={colors.accentOrange}>&ldquo;</AppText>
            <AppText variant="subtitle" style={styles.shareText}>{shareQuote?.text}</AppText>
            <AppText variant="body" color={colors.textSecondary}>— {shareQuote?.author}</AppText>
            <View style={styles.shareBrand}><Logo variant="mark" width={84} /><AppText variant="captionStrong" color={colors.accentLime}>ENTERTAINMENT POWER PLAYERS®</AppText></View>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Share quote image" disabled={sharing} onPress={() => { void shareImage(); }} style={styles.shareButton}><AppText variant="button">{sharing ? 'Preparing image…' : 'Share image'}</AppText></Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Close share preview" onPress={() => setShareQuote(null)} style={styles.closeShare}><AppText variant="body" color={colors.textSecondary}>Close</AppText></Pressable>
        </View>
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  eyebrow: { textAlign: 'center', letterSpacing: 1.5, marginTop: spacing.sm, marginBottom: spacing.xs },
  heading: { alignItems: 'center', marginBottom: spacing.md },
  tabs: { flexDirection: 'row', alignSelf: 'center', padding: spacing.xs, borderRadius: 18, backgroundColor: colors.surfaceSubtle, marginBottom: spacing.lg },
  tab: { minWidth: 112, alignItems: 'center', paddingVertical: spacing.sm, borderRadius: 14 },
  tabActive: { backgroundColor: colors.accent },
  empty: { textAlign: 'center', marginTop: spacing.xl },
  list: { gap: spacing.sm, paddingBottom: spacing.lg },
  featuredWrap: { marginBottom: spacing.sm, gap: spacing.xs },
  moreLabel: { marginTop: spacing.lg },
  shareOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.md, backgroundColor: colors.overlay },
  shareCard: { width: 300, minHeight: 400, padding: spacing.lg, borderRadius: 18, overflow: 'hidden', justifyContent: 'center', gap: spacing.md },
  shareMark: { fontSize: 58, lineHeight: 60 },
  shareText: { lineHeight: 34 },
  shareBrand: { marginTop: spacing.lg, alignItems: 'center', gap: spacing.sm },
  shareButton: { marginTop: spacing.lg, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, backgroundColor: colors.accentLime, borderRadius: 24 },
  closeShare: { marginTop: spacing.md, padding: spacing.sm },
});
