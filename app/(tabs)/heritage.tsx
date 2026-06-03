import { useState } from 'react';
import {
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ImageWithFallback } from '../../components/shared/ImageWithFallback';
import { ErrorState } from '../../components/ui/ErrorState';
import { SkeletonBox } from '../../components/ui/SkeletonBox';
import { FilterDropdown, DropdownOption } from '../../components/ui/FilterDropdown';
import { useMonuments } from '../../hooks/useMonuments';
import { api, endpoints } from '../../lib/api';
import { colors } from '../../constants/colors';
import { fontFamily, fontSize } from '../../constants/fonts';

// ─── Constants ────────────────────────────────────────────────────────────────
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const HERO_H = SCREEN_H * 0.3;

const TYPE_OPTIONS: DropdownOption[] = [
  { label: 'All Types', value: '' },
  { label: 'Fort', value: 'Fort' },
  { label: 'Temple', value: 'Temple' },
  { label: 'Palace', value: 'Palace' },
  { label: 'Cave', value: 'Cave' },
  { label: 'Stepwell', value: 'Stepwell' },
  { label: 'Mosque', value: 'Mosque' },
  { label: 'Church', value: 'Church' },
  { label: 'Stupa', value: 'Stupa' },
  { label: 'Memorial', value: 'Memorial' },
  { label: 'Lake', value: 'Lake' },
  { label: 'Park', value: 'Park' },
  { label: 'Other', value: 'Other' },
];

const CATEGORY_OPTIONS: DropdownOption[] = [
  { label: 'All Categories', value: '' },
  { label: 'UNESCO', value: 'UNESCO' },
  { label: 'ASI Protected', value: 'ASI' },
  { label: 'Religious', value: 'Religious' },
  { label: 'Natural', value: 'Natural' },
  { label: 'State Protected', value: 'State_Protected' },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface MonumentItem {
  id: number;
  name: string;
  slug: string;
  state?: string;
  type: string;
  category?: string;
  short_description?: string;
  best_time_to_visit?: string;
  is_featured?: boolean;
  cover_image_url: string;
}

// ─── Cinematic card (featured horizontal scroll) ──────────────────────────────
function CinematicCard({ item }: { item: MonumentItem }) {
  const typeColor =
    colors.monument[item.type as keyof typeof colors.monument] ?? colors.gold;

  return (
    <TouchableOpacity
      style={styles.cinCard}
      onPress={() => router.push(`/heritage/${item.slug}`)}
      activeOpacity={0.88}
    >
      <ImageWithFallback
        uri={item.cover_image_url}
        style={StyleSheet.absoluteFill as any}
        fallbackSlug={item.slug}
      />
      <LinearGradient
        colors={['rgba(13,5,0,0.0)', typeColor + 'F2']}
        start={{ x: 0, y: 0.3 }}
        end={{ x: 0, y: 1 }}
        style={[StyleSheet.absoluteFill as any, { justifyContent: 'flex-end' }]}
      >
        <View style={styles.cinContent}>
          <View style={styles.cinBadge}>
            <Text style={styles.cinBadgeText}>{item.type}</Text>
          </View>
          <Text style={styles.cinName} numberOfLines={2}>{item.name}</Text>
          {item.state && (
            <Text style={styles.cinState}>{item.state}</Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ─── Monument skeleton ────────────────────────────────────────────────────────
function MonumentSkeleton() {
  return (
    <View style={styles.hCard}>
      <SkeletonBox w="100%" h={220} radius={0} />
      <View style={{ padding: 16, gap: 10, backgroundColor: colors.cream }}>
        <SkeletonBox w="72%" h={22} />
        <SkeletonBox w="45%" h={14} />
        <SkeletonBox w="60%" h={14} />
        <SkeletonBox w={130} h={34} radius={8} />
      </View>
    </View>
  );
}

// ─── Heritage card ────────────────────────────────────────────────────────────
function HeritageCard({ item }: { item: MonumentItem }) {
  const typeColor =
    colors.monument[item.type as keyof typeof colors.monument] ?? colors.gold;

  return (
    <TouchableOpacity
      style={styles.hCard}
      onPress={() => router.push(`/heritage/${item.slug}`)}
      activeOpacity={0.88}
    >
      {/* Image section */}
      <View style={styles.hImgWrap}>
        <ImageWithFallback
          uri={item.cover_image_url}
          style={StyleSheet.absoluteFill as any}
          fallbackSlug={item.slug}
        />
        <LinearGradient
          colors={['rgba(13,5,0,0.02)', typeColor + 'DD']}
          start={{ x: 0, y: 0.4 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill as any}
        />
        {/* Category badge (top-left) */}
        {item.category && (
          <View style={styles.hCatBadge}>
            <Text style={styles.hCatText}>{item.category.replace('_', ' ')}</Text>
          </View>
        )}
        {/* Featured badge (top-right) */}
        {item.is_featured && (
          <View style={styles.hFeatBadge}>
            <Text style={styles.hFeatText}>★ FEATURED</Text>
          </View>
        )}
        {/* Type at bottom */}
        <View style={[styles.hTypePill, { backgroundColor: typeColor + 'EE' }]}>
          <Text style={styles.hTypeText}>{item.type}</Text>
        </View>
      </View>

      {/* Content section */}
      <View style={styles.hContent}>
        <Text style={styles.hName} numberOfLines={2}>{item.name}</Text>
        {item.state && (
          <Text style={styles.hState}>{item.state}</Text>
        )}
        {item.short_description && (
          <Text style={styles.hDesc} numberOfLines={2}>{item.short_description}</Text>
        )}
        {item.best_time_to_visit && (
          <View style={styles.hMeta}>
            <Text style={styles.hMetaLabel}>Best time  </Text>
            <Text style={styles.hMetaValue}>{item.best_time_to_visit}</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.hExploreBtn}
          onPress={() => router.push(`/heritage/${item.slug}`)}
          activeOpacity={0.8}
        >
          <Text style={styles.hExploreBtnText}>Explore Monument →</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function HeritageScreen() {
  const [stateFilter, setStateFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const insets = useSafeAreaInsets();

  const { data, isLoading, isError, refetch, isRefetching } = useMonuments({
    state: stateFilter || undefined,
    type: typeFilter || undefined,
    category: categoryFilter || undefined,
    per_page: 40,
  });

  const { data: statesData } = useQuery({
    queryKey: ['states-picker'],
    queryFn: () => api.get(endpoints.states, { params: { per_page: 50 } }) as Promise<any>,
    staleTime: 10 * 60 * 1000,
  });

  const stateOptions: DropdownOption[] = [
    { label: 'All States', value: '' },
    ...(statesData?.data?.map((s: any) => ({ label: s.name, value: s.slug })) ?? []),
  ];

  const monuments: MonumentItem[] = data?.data ?? [];
  const featured = monuments.filter((m) => m.is_featured);

  if (isError) return <ErrorState onRetry={refetch} />;

  const displayData: any[] = isLoading
    ? Array.from({ length: 5 }, (_, i) => ({ _sk: true, id: `sk-${i}` }))
    : monuments;

  const ListHeader = (
    <>
      {/* ── Hero */}
      <LinearGradient
        colors={['#0D0500', '#1A1000', '#2A1800']}
        style={[styles.hero, { paddingTop: insets.top + 16 }]}
      >
        <Text style={styles.heroEye}>✦ EXPLORE HERITAGE ✦</Text>
        <Text style={styles.heroTitle}>Monuments of{'\n'}A Civilisation</Text>
        <Text style={styles.heroSub}>
          5,000 years of architecture, art and devotion
        </Text>
        <View style={styles.heroDivider} />
      </LinearGradient>

      {/* ── Filter bar */}
      <View style={styles.filterBar}>
        <FilterDropdown
          label="All States"
          selected={stateFilter}
          options={stateOptions}
          onSelect={setStateFilter}
        />
        <FilterDropdown
          label="All Types"
          selected={typeFilter}
          options={TYPE_OPTIONS}
          onSelect={setTypeFilter}
        />
        <FilterDropdown
          label="Category"
          selected={categoryFilter}
          options={CATEGORY_OPTIONS}
          onSelect={setCategoryFilter}
        />
      </View>

      {/* ── Featured monuments */}
      {featured.length > 0 && (
        <View style={styles.featSection}>
          <Text style={styles.featTitle}>Featured Sites</Text>
          <FlatList
            horizontal
            data={featured}
            keyExtractor={(m) => m.slug}
            renderItem={({ item }) => <CinematicCard item={item} />}
            contentContainerStyle={styles.featList}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      {/* ── All sites header */}
      <View style={styles.allHeader}>
        <Text style={styles.allTitle}>All Heritage Sites</Text>
        {data?.meta && (
          <Text style={styles.allCount}>{data.meta.total} sites</Text>
        )}
      </View>
    </>
  );

  return (
    <FlatList
      data={displayData}
      keyExtractor={(item) => item.id?.toString() ?? item.slug}
      ListHeaderComponent={ListHeader}
      renderItem={({ item }) =>
        item._sk ? <MonumentSkeleton /> : <HeritageCard item={item} />
      }
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
            <Text style={styles.emptyIcon}>🏛️</Text>
            <Text style={styles.emptyText}>No heritage sites found</Text>
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
  heroEye: {
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
    marginBottom: 14,
  },
  heroDivider: { width: 48, height: 2, backgroundColor: colors.gold, borderRadius: 2 },

  // Filter bar
  filterBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: colors.parchment,
  },

  // Featured
  featSection: {
    backgroundColor: colors.ink,
    paddingVertical: 20,
  },
  featTitle: {
    fontFamily: fontFamily.cormorantBold,
    fontSize: 26,
    color: '#FFFFFF',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  featList: { paddingHorizontal: 16, gap: 14 },

  // Cinematic card
  cinCard: {
    width: 280,
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.ink,
  },
  cinContent: { padding: 14, gap: 4 },
  cinBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
    marginBottom: 4,
  },
  cinBadgeText: {
    fontFamily: fontFamily.dmSans,
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  cinName: {
    fontFamily: fontFamily.cormorantBold,
    fontSize: 20,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  cinState: {
    fontFamily: fontFamily.dmSans,
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
  },

  // All sites header
  allHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 8,
    backgroundColor: colors.cream,
  },
  allTitle: {
    fontFamily: fontFamily.cormorantBold,
    fontSize: 26,
    color: colors.ink,
  },
  allCount: {
    fontFamily: fontFamily.dmSans,
    fontSize: 13,
    color: colors.ink + '66',
  },

  // List
  list: { paddingBottom: 80 },

  // Heritage card
  hCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.cream,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  hImgWrap: { height: 220, overflow: 'hidden' },
  hCatBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(13,5,0,0.65)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  hCatText: {
    fontFamily: fontFamily.dmSans,
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  hFeatBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: colors.gold + 'EE',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  hFeatText: {
    fontFamily: fontFamily.dmSansBold,
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  hTypePill: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  hTypeText: {
    fontFamily: fontFamily.dmSansMedium,
    fontSize: 11,
    color: '#FFFFFF',
  },
  hContent: {
    padding: 16,
    gap: 5,
    backgroundColor: colors.cream,
  },
  hName: {
    fontFamily: fontFamily.cormorantBold,
    fontSize: 26,
    color: colors.ink,
    lineHeight: 28,
  },
  hState: {
    fontFamily: fontFamily.dmSansMedium,
    fontSize: 13,
    color: colors.saffron,
  },
  hDesc: {
    fontFamily: fontFamily.dmSansLight,
    fontSize: 13,
    color: colors.ink + 'AA',
    lineHeight: 20,
  },
  hMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  hMetaLabel: {
    fontFamily: fontFamily.dmSans,
    fontSize: 12,
    color: colors.ink + '66',
  },
  hMetaValue: {
    fontFamily: fontFamily.dmSansMedium,
    fontSize: 12,
    color: colors.gold,
  },
  hExploreBtn: {
    marginTop: 10,
    backgroundColor: colors.ink,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  hExploreBtnText: {
    fontFamily: fontFamily.dmSansMedium,
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },

  // Empty
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyIcon: { fontSize: 40 },
  emptyText: {
    fontFamily: fontFamily.dmSans,
    fontSize: 15,
    color: colors.ink + '88',
  },
});
