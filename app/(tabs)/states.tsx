import { useEffect, useMemo, useState } from 'react';
import {
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ImageWithFallback } from '../../components/shared/ImageWithFallback';
import { ErrorState } from '../../components/ui/ErrorState';
import { SkeletonBox } from '../../components/ui/SkeletonBox';
import { useStates } from '../../hooks/useStates';
import { colors } from '../../constants/colors';
import { fontFamily, fontSize } from '../../constants/fonts';

// ─── Constants ────────────────────────────────────────────────────────────────
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const HERO_H = SCREEN_H * 0.3;
const CARD_W = (SCREEN_W - 36) / 2; // 12px padding × 2 + 12px gap

const REGIONS = ['All', 'North', 'South', 'East', 'West', 'Northeast', 'Central'] as const;

// ─── Types ────────────────────────────────────────────────────────────────────
interface StateItem {
  id: number;
  name: string;
  slug: string;
  region: string;
  capital: string;
  language?: string;
  population?: number;
  area_sq_km?: number;
  cover_image_url: string;
  monuments_count?: number;
  festivals_count?: number;
}

// ─── Skeleton card ────────────────────────────────────────────────────────────
function StateCardSkeleton() {
  return (
    <View style={sk.card}>
      <SkeletonBox w={CARD_W} h={150} radius={0} />
      <View style={sk.body}>
        <SkeletonBox w="78%" h={18} />
        <SkeletonBox w="55%" h={12} />
        <SkeletonBox w="45%" h={12} />
        <SkeletonBox w={72} h={26} radius={6} />
      </View>
    </View>
  );
}
const sk = StyleSheet.create({
  card: { width: CARD_W, borderRadius: 14, overflow: 'hidden', marginBottom: 0 },
  body: { backgroundColor: '#F5F0E8', padding: 12, gap: 8 },
});

// ─── State grid card ──────────────────────────────────────────────────────────
function StateGridCard({ item }: { item: StateItem }) {
  const regionColor =
    colors.region[item.region as keyof typeof colors.region] ?? colors.saffron;
  const initial = item.name.charAt(0).toUpperCase();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/states/${item.slug}`)}
      activeOpacity={0.88}
    >
      {/* Top: image + gradient tints + faded initial */}
      <View style={styles.cardTop}>
        <ImageWithFallback
          uri={item.cover_image_url}
          style={StyleSheet.absoluteFill as any}
          fallbackSlug={item.slug}
        />
        <LinearGradient
          colors={[regionColor + '99', regionColor + '22']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill as any}
        />
        <LinearGradient
          colors={['transparent', 'rgba(13,5,0,0.55)']}
          style={StyleSheet.absoluteFill as any}
        />
        <Text style={styles.initial}>{initial}</Text>
        <View style={[styles.regionBadge, { backgroundColor: regionColor + 'DD' }]}>
          <Text style={styles.regionBadgeText}>{item.region.toUpperCase()}</Text>
        </View>
      </View>

      {/* Bottom: white content */}
      <View style={styles.cardBottom}>
        <Text style={styles.stateName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.stateCapital} numberOfLines={1}>{item.capital}</Text>
        {item.language && (
          <Text style={styles.stateLang} numberOfLines={1}>{item.language}</Text>
        )}
        {item.population != null && (
          <Text style={styles.statePop}>
            {item.population >= 1_000_000
              ? `${(item.population / 1_000_000).toFixed(1)}M people`
              : `${item.population.toLocaleString()} people`}
          </Text>
        )}
        <View style={styles.exploreBtn}>
          <Text style={styles.exploreBtnText}>Explore →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function StatesScreen() {
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState('All');
  const insets = useSafeAreaInsets();

  const { data, isLoading, isError, refetch, isRefetching } = useStates({ per_page: 100 });
  const allStates: StateItem[] = data?.data ?? [];

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allStates.filter((s) => {
      const matchRegion = region === 'All' || s.region === region;
      const matchSearch = !q || s.name.toLowerCase().includes(q);
      return matchRegion && matchSearch;
    });
  }, [allStates, region, search]);

  if (isError) return <ErrorState onRetry={refetch} />;

  const displayData: any[] = isLoading
    ? Array.from({ length: 8 }, (_, i) => ({ _sk: true, id: `sk-${i}` }))
    : filtered;

  const ListHeader = (
    <>
      {/* ── Hero */}
      <LinearGradient
        colors={['#0D0500', '#1C0A00', '#2E1200']}
        style={[styles.hero, { paddingTop: insets.top + 16 }]}
      >
        <Text style={styles.heroEyebrow}>✦ INCREDIBLE INDIA ✦</Text>
        <Text style={styles.heroTitle}>The 28 Faces{'\n'}of India</Text>
        <Text style={styles.heroSub}>
          28 states, each a world unto itself — ancient traditions, living heritage
        </Text>
        <View style={styles.heroDivider} />
      </LinearGradient>

      {/* ── Search */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search states…"
            placeholderTextColor={colors.ink + '50'}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            clearButtonMode="while-editing"
            autoCapitalize="words"
          />
        </View>
      </View>

      {/* ── Region pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.pillsRow}
        style={styles.pillsScroll}
      >
        {REGIONS.map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.pill, region === r && styles.pillActive]}
            onPress={() => setRegion(r)}
            activeOpacity={0.75}
          >
            <Text style={[styles.pillText, region === r && styles.pillTextActive]}>
              {r.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Result count */}
      {!isLoading && (
        <Text style={styles.resultCount}>
          {filtered.length} {filtered.length === 1 ? 'state' : 'states'}
          {region !== 'All' ? ` in ${region} India` : ''}
        </Text>
      )}
    </>
  );

  return (
    <FlatList
      data={displayData}
      numColumns={2}
      keyExtractor={(item) => item.id?.toString() ?? item.slug}
      ListHeaderComponent={ListHeader}
      renderItem={({ item }) =>
        item._sk ? <StateCardSkeleton /> : <StateGridCard item={item} />
      }
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.saffron}
          colors={[colors.saffron]}
        />
      }
      ListEmptyComponent={
        !isLoading ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🗺️</Text>
            <Text style={styles.emptyText}>No states match your search</Text>
          </View>
        ) : null
      }
    />
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Hero
  hero: {
    height: HERO_H,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  heroEyebrow: {
    fontFamily: fontFamily.dmSans,
    fontSize: 10,
    color: colors.gold,
    letterSpacing: 2,
    marginBottom: 8,
  },
  heroTitle: {
    fontFamily: fontFamily.cormorantBold,
    fontSize: 42,
    color: '#FFFFFF',
    lineHeight: 46,
    marginBottom: 10,
  },
  heroSub: {
    fontFamily: fontFamily.dmSansLight,
    fontSize: 13,
    color: 'rgba(245,237,216,0.7)',
    lineHeight: 20,
    marginBottom: 16,
  },
  heroDivider: {
    width: 48,
    height: 2,
    backgroundColor: colors.gold,
    borderRadius: 2,
  },

  // Search
  searchWrap: {
    backgroundColor: colors.cream,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.parchment,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.parchment,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    gap: 8,
  },
  searchIcon: { fontSize: 16 },
  searchInput: {
    flex: 1,
    fontFamily: fontFamily.dmSans,
    fontSize: 15,
    color: colors.ink,
    padding: 0,
  },

  // Pills
  pillsScroll: {
    backgroundColor: colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: colors.parchment,
  },
  pillsRow: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.parchment,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pillActive: {
    backgroundColor: colors.saffron + '15',
    borderColor: colors.saffron,
  },
  pillText: {
    fontFamily: fontFamily.dmSansMedium,
    fontSize: 11,
    color: colors.ink + 'AA',
    letterSpacing: 0.6,
  },
  pillTextActive: {
    color: colors.saffron,
  },

  resultCount: {
    fontFamily: fontFamily.dmSans,
    fontSize: 12,
    color: colors.ink + '77',
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.cream,
  },

  // List
  list: { paddingHorizontal: 12, paddingTop: 0, paddingBottom: 80 },
  row: { gap: 12, marginBottom: 12 },

  // Card
  card: {
    width: CARD_W,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.parchment,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTop: { height: 150, overflow: 'hidden' },
  initial: {
    position: 'absolute',
    bottom: -12,
    right: 4,
    fontFamily: fontFamily.cormorantBold,
    fontSize: 88,
    color: 'rgba(255,255,255,0.18)',
    lineHeight: 90,
  },
  regionBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  regionBadgeText: {
    fontFamily: fontFamily.dmSans,
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  cardBottom: {
    backgroundColor: '#FFFFFF',
    padding: 12,
    gap: 3,
  },
  stateName: {
    fontFamily: fontFamily.cormorantBold,
    fontSize: 20,
    color: colors.ink,
    lineHeight: 22,
  },
  stateCapital: {
    fontFamily: fontFamily.dmSans,
    fontSize: 12,
    color: colors.ink + '99',
  },
  stateLang: {
    fontFamily: fontFamily.dmSans,
    fontSize: 11,
    color: colors.ink + '77',
  },
  statePop: {
    fontFamily: fontFamily.dmSans,
    fontSize: 11,
    color: colors.gold,
    fontWeight: '600',
  },
  exploreBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.saffron,
    paddingBottom: 1,
  },
  exploreBtnText: {
    fontFamily: fontFamily.dmSansMedium,
    fontSize: 12,
    color: colors.saffron,
  },

  // Empty
  empty: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyIcon: { fontSize: 40 },
  emptyText: {
    fontFamily: fontFamily.dmSans,
    fontSize: 15,
    color: colors.ink + '88',
  },
});
