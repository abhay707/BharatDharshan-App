import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ReanimatedLib, {
  useSharedValue,
  useAnimatedStyle as useReanimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ImageWithFallback } from '../../components/shared/ImageWithFallback';
import { ErrorState } from '../../components/ui/ErrorState';
import { SkeletonBox } from '../../components/ui/SkeletonBox';
import { FilterDropdown, DropdownOption } from '../../components/ui/FilterDropdown';
import { useFestivals } from '../../hooks/useFestivals';
import { colors } from '../../constants/colors';
import { fontFamily, fontSize } from '../../constants/fonts';

// ─── Constants ────────────────────────────────────────────────────────────────
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const HERO_H = SCREEN_H * 0.3;

const RELIGION_OPTIONS: DropdownOption[] = [
  { label: 'All Religions', value: '' },
  { label: 'Hindu', value: 'Hindu' },
  { label: 'Muslim', value: 'Muslim' },
  { label: 'Sikh', value: 'Sikh' },
  { label: 'Christian', value: 'Christian' },
  { label: 'Buddhist', value: 'Buddhist' },
  { label: 'Jain', value: 'Jain' },
  { label: 'Tribal', value: 'Tribal' },
  { label: 'Secular', value: 'Secular' },
];

const MONTH_OPTIONS: DropdownOption[] = [
  { label: 'All Months', value: '0' },
  { label: 'January', value: '1' },
  { label: 'February', value: '2' },
  { label: 'March', value: '3' },
  { label: 'April', value: '4' },
  { label: 'May', value: '5' },
  { label: 'June', value: '6' },
  { label: 'July', value: '7' },
  { label: 'August', value: '8' },
  { label: 'September', value: '9' },
  { label: 'October', value: '10' },
  { label: 'November', value: '11' },
  { label: 'December', value: '12' },
];

const RELIGION_TILES = [
  { name: 'Hindu', color: colors.religion.Hindu, icon: '🔱' },
  { name: 'Muslim', color: colors.religion.Muslim, icon: '☪️' },
  { name: 'Sikh', color: colors.religion.Sikh, icon: '☬' },
  { name: 'Christian', color: colors.religion.Christian, icon: '✝️' },
  { name: 'Buddhist', color: colors.religion.Buddhist, icon: '☸️' },
  { name: 'Secular', color: colors.religion.Secular, icon: '🌟' },
];

const PARTICLE_DEFS = [
  { id: 1, x: '8%', y: '22%', s: 5, d: 0 },
  { id: 2, x: '22%', y: '58%', s: 3, d: 350 },
  { id: 3, x: '42%', y: '14%', s: 6, d: 150 },
  { id: 4, x: '62%', y: '48%', s: 4, d: 500 },
  { id: 5, x: '78%', y: '28%', s: 3, d: 220 },
  { id: 6, x: '88%', y: '65%', s: 5, d: 420 },
  { id: 7, x: '52%', y: '76%', s: 3, d: 600 },
  { id: 8, x: '32%', y: '38%', s: 4, d: 80 },
  { id: 9, x: '68%', y: '12%', s: 3, d: 280 },
];

// ─── Types ────────────────────────────────────────────────────────────────────
interface FestivalItem {
  id: number;
  name: string;
  slug: string;
  tagline?: string;
  religion: string;
  month: number;
  month_name: string;
  duration_days?: number;
  is_national?: boolean;
  state?: string;
  cover_image_url: string;
}

interface MonthSection {
  month: number;
  month_name: string;
  festivals: FestivalItem[];
}

// ─── Gold particle ────────────────────────────────────────────────────────────
function GoldParticle({
  x,
  y,
  s,
  d,
}: {
  x: string;
  y: string;
  s: number;
  d: number;
}) {
  const float = useSharedValue(0);
  const fade = useSharedValue(0.3);

  useEffect(() => {
    float.value = withDelay(
      d,
      withRepeat(
        withSequence(
          withTiming(-9, { duration: 2200 }),
          withTiming(0, { duration: 2200 }),
        ),
        -1,
        false,
      ),
    );
    fade.value = withDelay(
      d,
      withRepeat(
        withSequence(
          withTiming(0.85, { duration: 2200 }),
          withTiming(0.25, { duration: 2200 }),
        ),
        -1,
        false,
      ),
    );
  }, []);

  const anim = useReanimatedStyle(() => ({
    transform: [{ translateY: float.value }],
    opacity: fade.value,
  }));

  const baseStyle = {
    position: 'absolute' as const,
    left: x,
    top: y,
    width: s,
    height: s,
    borderRadius: s / 2,
    backgroundColor: '#C9901A',
  };

  return <ReanimatedLib.View style={[baseStyle as any, anim]} />;
}

// ─── Ticker strip ─────────────────────────────────────────────────────────────
function TickerStrip({ names }: { names: string }) {
  const scrollX = useRef(new Animated.Value(0)).current;
  const dist = SCREEN_W * 3;

  useEffect(() => {
    if (!names) return;
    const loop = Animated.loop(
      Animated.timing(scrollX, {
        toValue: -dist,
        duration: 32000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    loop.start();
    return () => loop.stop();
  }, [names]);

  return (
    <View style={styles.ticker} pointerEvents="none">
      <Animated.Text
        style={[styles.tickerText, { transform: [{ translateX: scrollX }] }]}
        numberOfLines={1}
      >
        {`${names}  ✦  ${names}  ✦  ${names}  ✦  ${names}  ✦  `}
      </Animated.Text>
    </View>
  );
}

// ─── Festival card (calendar row) ─────────────────────────────────────────────
function FestivalListCard({ item }: { item: FestivalItem }) {
  const religionColor =
    colors.religion[item.religion as keyof typeof colors.religion] ?? colors.gold;

  return (
    <TouchableOpacity
      style={[styles.fCard, { borderLeftColor: religionColor }]}
      onPress={() => router.push(`/festivals/${item.slug}`)}
      activeOpacity={0.88}
    >
      {/* Religion-tinted top strip */}
      <LinearGradient
        colors={[religionColor + 'EE', religionColor + '88']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.fTop}
      >
        <Text style={styles.fReligion}>{item.religion}</Text>
        {item.is_national && (
          <View style={styles.fNational}>
            <Text style={styles.fNationalText}>Pan India</Text>
          </View>
        )}
      </LinearGradient>

      {/* White body */}
      <View style={styles.fBody}>
        <Text style={styles.fName} numberOfLines={2}>{item.name}</Text>
        {item.state && !item.is_national && (
          <Text style={styles.fState} numberOfLines={1}>{item.state}</Text>
        )}
        {item.duration_days != null && (
          <Text style={styles.fDuration}>{item.duration_days}-day celebration</Text>
        )}
        {item.tagline ? (
          <Text style={styles.fTagline} numberOfLines={2}>{item.tagline}</Text>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

// ─── Festival skeleton ────────────────────────────────────────────────────────
function FestivalSkeleton() {
  return (
    <View style={styles.fCard}>
      <SkeletonBox w="100%" h={44} radius={0} />
      <View style={{ padding: 12, gap: 8, backgroundColor: '#FAFAF8' }}>
        <SkeletonBox w="80%" h={22} />
        <SkeletonBox w="50%" h={12} />
        <SkeletonBox w="65%" h={12} />
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function FestivalsScreen() {
  const [religion, setReligion] = useState('');
  const [month, setMonth] = useState('0');
  const insets = useSafeAreaInsets();

  const { data, isLoading, isError, refetch, isRefetching } = useFestivals({
    religion: religion || undefined,
    month: month !== '0' ? Number(month) : undefined,
    per_page: 60,
  });

  const festivals: FestivalItem[] = data?.data ?? [];

  // Group by month for calendar view
  const monthSections = useMemo((): MonthSection[] => {
    const grouped: Record<number, FestivalItem[]> = {};
    for (const f of festivals) {
      if (!grouped[f.month]) grouped[f.month] = [];
      grouped[f.month].push(f);
    }
    return Object.entries(grouped)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([m, list]) => ({
        month: Number(m),
        month_name: list[0]?.month_name ?? '',
        festivals: list,
      }));
  }, [festivals]);

  const tickerNames = festivals.map((f) => f.name).join('  ✦  ');

  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <ScrollView
      style={styles.screen}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={isRefetching}
          onRefresh={refetch}
          tintColor={colors.gold}
          colors={[colors.gold]}
        />
      }
    >
      {/* ── Hero with floating particles */}
      <LinearGradient
        colors={['#1A0404', '#8B1A1A', '#C9901A']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 16, height: HERO_H }]}
      >
        {/* Gold particles */}
        {PARTICLE_DEFS.map((p) => (
          <GoldParticle key={p.id} x={p.x} y={p.y} s={p.s} d={p.d} />
        ))}

        <View style={styles.heroContent}>
          <Text style={styles.heroEye}>✦ FESTIVALS OF INDIA ✦</Text>
          <Text style={styles.heroTitle}>365 Days of{'\n'}Celebration</Text>
          <Text style={styles.heroSub}>
            Every season a festival, every festival a story
          </Text>
        </View>
      </LinearGradient>

      {/* ── Filter bar */}
      <View style={styles.filterBar}>
        <FilterDropdown
          label="All Religions"
          selected={religion}
          options={RELIGION_OPTIONS}
          onSelect={setReligion}
        />
        <FilterDropdown
          label="All Months"
          selected={month}
          options={MONTH_OPTIONS}
          onSelect={setMonth}
        />
      </View>

      {/* ── Ticker strip */}
      {tickerNames.length > 0 && <TickerStrip names={tickerNames} />}

      {/* ── Loading skeletons */}
      {isLoading && (
        <View style={styles.skeletonWrap}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.skSection}>
              <SkeletonBox w={120} h={28} radius={6} style={{ marginBottom: 12 }} />
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[0, 1, 2].map((j) => (
                  <FestivalSkeleton key={j} />
                ))}
              </ScrollView>
            </View>
          ))}
        </View>
      )}

      {/* ── Calendar view: one section per month */}
      {!isLoading &&
        monthSections.map((section) => (
          <View key={section.month} style={styles.monthSection}>
            {/* Month header */}
            <View style={styles.monthHeader}>
              <Text style={styles.monthName}>{section.month_name}</Text>
              <View style={styles.monthBadge}>
                <Text style={styles.monthCount}>{section.festivals.length}</Text>
              </View>
            </View>

            {/* Horizontal festival cards */}
            <FlatList
              horizontal
              data={section.festivals}
              keyExtractor={(item) => item.slug}
              renderItem={({ item }) => <FestivalListCard item={item} />}
              contentContainerStyle={styles.monthList}
              showsHorizontalScrollIndicator={false}
              nestedScrollEnabled
            />
          </View>
        ))}

      {/* ── Empty state */}
      {!isLoading && festivals.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyIcon}>🎊</Text>
          <Text style={styles.emptyText}>No festivals found for your filters</Text>
        </View>
      )}

      {/* ── Religion mosaic */}
      <View style={styles.mosaic}>
        <Text style={styles.mosaicTitle}>Celebrate Every Faith</Text>
        <View style={styles.mosaicGrid}>
          {RELIGION_TILES.map((tile) => (
            <TouchableOpacity
              key={tile.name}
              style={[styles.mosaicTile, { backgroundColor: tile.color }]}
              onPress={() => setReligion(tile.name)}
              activeOpacity={0.8}
            >
              <Text style={styles.mosaicIcon}>{tile.icon}</Text>
              <Text style={styles.mosaicName}>{tile.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },

  // Hero
  hero: {
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  heroContent: {
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
    color: 'rgba(245,237,216,0.72)',
    lineHeight: 20,
  },

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

  // Ticker
  ticker: {
    backgroundColor: colors.ink,
    paddingVertical: 10,
    overflow: 'hidden',
  },
  tickerText: {
    fontFamily: fontFamily.dmSansMedium,
    fontSize: 12,
    color: colors.gold,
    letterSpacing: 0.5,
    width: SCREEN_W * 12,
  },

  // Skeleton
  skeletonWrap: {
    backgroundColor: colors.cream,
    paddingVertical: 20,
  },
  skSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },

  // Month section
  monthSection: {
    backgroundColor: colors.cream,
    paddingTop: 20,
    paddingBottom: 4,
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 10,
  },
  monthName: {
    fontFamily: fontFamily.cormorantBold,
    fontSize: 30,
    color: colors.ink,
    lineHeight: 32,
  },
  monthBadge: {
    backgroundColor: colors.saffron + '20',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  monthCount: {
    fontFamily: fontFamily.dmSansBold,
    fontSize: 12,
    color: colors.saffron,
  },
  monthList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },

  // Festival card
  fCard: {
    width: 220,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 4,
    borderLeftColor: colors.gold,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  fTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 6,
  },
  fReligion: {
    fontFamily: fontFamily.dmSansBold,
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  fNational: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 20,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  fNationalText: {
    fontFamily: fontFamily.dmSans,
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  fBody: { padding: 12, gap: 4 },
  fName: {
    fontFamily: fontFamily.cormorantBold,
    fontSize: 20,
    color: colors.ink,
    lineHeight: 22,
  },
  fState: {
    fontFamily: fontFamily.dmSansMedium,
    fontSize: 12,
    color: colors.saffron,
  },
  fDuration: {
    fontFamily: fontFamily.dmSans,
    fontSize: 11,
    color: colors.ink + '77',
  },
  fTagline: {
    fontFamily: fontFamily.cormorantItalic,
    fontSize: 14,
    color: colors.ink + 'AA',
    lineHeight: 18,
    marginTop: 2,
  },

  // Empty
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: colors.cream,
    gap: 12,
  },
  emptyIcon: { fontSize: 40 },
  emptyText: {
    fontFamily: fontFamily.dmSans,
    fontSize: 15,
    color: colors.ink + '88',
  },

  // Religion mosaic
  mosaic: {
    backgroundColor: colors.ink,
    paddingVertical: 28,
    paddingHorizontal: 16,
  },
  mosaicTitle: {
    fontFamily: fontFamily.cormorantBold,
    fontSize: 28,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  mosaicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  mosaicTile: {
    width: (SCREEN_W - 56) / 3,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
  },
  mosaicIcon: { fontSize: 26 },
  mosaicName: {
    fontFamily: fontFamily.dmSansMedium,
    fontSize: 12,
    color: '#FFFFFF',
  },
});
