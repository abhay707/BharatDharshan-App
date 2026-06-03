import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Linking,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ImageWithFallback } from '../../components/shared/ImageWithFallback';
import { SkeletonBox } from '../../components/ui/SkeletonBox';
import { ErrorState } from '../../components/ui/ErrorState';
import { useStateDetail } from '../../hooks/useStates';
import { colors } from '../../constants/colors';
import { fontFamily, fontSize } from '../../constants/fonts';

// ─── Constants ────────────────────────────────────────────────────────────────
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const HERO_H = SCREEN_H * 0.5;

const TABS = ['Culture', 'Food', 'Traditions'] as const;
type Tab = (typeof TABS)[number];

const FOOD_FILTERS = ['All', 'Veg', 'Non-Veg', 'Breakfast', 'Lunch', 'Dinner', 'Snack'] as const;

const CULTURE_FIELDS = [
  { key: 'classical_dance', label: 'Classical Dance', emoji: '💃' },
  { key: 'music_forms', label: 'Music & Sound', emoji: '🎵' },
  { key: 'traditional_dress_male', label: "Men's Attire", emoji: '👘' },
  { key: 'traditional_dress_female', label: "Women's Attire", emoji: '👗' },
  { key: 'art_forms', label: 'Art Forms', emoji: '🎨' },
  { key: 'handicrafts', label: 'Handicrafts', emoji: '🏺' },
  { key: 'language_script', label: 'Language & Script', emoji: '✍️' },
  { key: 'notable_personalities', label: 'Notable People', emoji: '⭐' },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────
interface Culture {
  classical_dance?: string;
  music_forms?: string;
  traditional_dress_male?: string;
  traditional_dress_female?: string;
  art_forms?: string;
  handicrafts?: string;
  language_script?: string;
  notable_personalities?: string;
}

interface Food {
  id: number;
  name: string;
  slug: string;
  state?: string;
  meal_type: string;
  is_vegetarian: boolean;
  description?: string;
  ingredients?: string;
  cover_image_url: string;
}

interface Tradition {
  id: number;
  name: string;
  category: string;
  description?: string;
  significance?: string;
  region_specific?: string;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function StateSkeleton() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.ink }}>
      <SkeletonBox w="100%" h={HERO_H} radius={0} />
      <View style={{ flexDirection: 'row', backgroundColor: colors.cream }}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center', paddingVertical: 16 }}>
            <SkeletonBox w="60%" h={14} />
          </View>
        ))}
      </View>
      <View style={{ padding: 16, gap: 12 }}>
        {[100, 100, 80, 100, 80].map((h, i) => (
          <SkeletonBox key={i} w="100%" h={h} radius={12} />
        ))}
      </View>
    </ScrollView>
  );
}

// ─── Culture Card ─────────────────────────────────────────────────────────────
function CultureCard({ field, value }: { field: (typeof CULTURE_FIELDS)[number]; value: string }) {
  return (
    <View style={s.cultCard}>
      <View style={s.cultTopBar} />
      <Text style={s.cultEmoji}>{field.emoji}</Text>
      <Text style={s.cultLabel}>{field.label}</Text>
      <Text style={s.cultValue}>{value}</Text>
    </View>
  );
}

// ─── Food Card ────────────────────────────────────────────────────────────────
function FoodCard({ item }: { item: Food }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <View style={s.foodCard}>
      <View style={s.foodHeader}>
        <View style={s.foodTitleRow}>
          <View
            style={[
              s.vegDot,
              { backgroundColor: item.is_vegetarian ? '#2D6A4F' : '#8B1A1A' },
            ]}
          />
          <Text style={s.foodName}>{item.name}</Text>
        </View>
        <View style={[s.mealPill, { backgroundColor: colors.saffron + '18' }]}>
          <Text style={s.mealPillText}>{item.meal_type}</Text>
        </View>
      </View>
      {item.description ? (
        <Text style={s.foodDesc}>{item.description}</Text>
      ) : null}
      {item.ingredients ? (
        <TouchableOpacity
          style={s.ingredientsToggle}
          onPress={() => setExpanded((v) => !v)}
          activeOpacity={0.75}
        >
          <Text style={s.ingredientsToggleText}>
            Ingredients  {expanded ? '▲' : '▼'}
          </Text>
        </TouchableOpacity>
      ) : null}
      {expanded && item.ingredients ? (
        <Text style={s.ingredientsText}>{item.ingredients}</Text>
      ) : null}
    </View>
  );
}

// ─── Tradition Card ───────────────────────────────────────────────────────────
function TraditionCard({ item }: { item: Tradition }) {
  return (
    <View style={s.tradCard}>
      <View style={s.tradHeader}>
        <Text style={s.tradName}>{item.name}</Text>
        <View style={[s.tradBadge, { backgroundColor: colors.gold + '22' }]}>
          <Text style={[s.tradBadgeText, { color: colors.gold }]}>
            {item.category.replace('_', ' ')}
          </Text>
        </View>
      </View>
      {item.description ? (
        <Text style={s.tradDesc}>{item.description}</Text>
      ) : null}
      {item.significance ? (
        <View style={s.tradSig}>
          <Text style={s.tradSigLabel}>Significance</Text>
          <Text style={s.tradSigText}>{item.significance}</Text>
        </View>
      ) : null}
      {item.region_specific ? (
        <Text style={s.tradRegion}>Region: {item.region_specific}</Text>
      ) : null}
    </View>
  );
}

// ─── Animated Tab Bar ─────────────────────────────────────────────────────────
function TabBar({
  activeTab,
  onChange,
  underlineX,
}: {
  activeTab: Tab;
  onChange: (t: Tab, idx: number) => void;
  underlineX: Animated.Value;
}) {
  const TAB_W = SCREEN_W / TABS.length;
  return (
    <View style={s.tabBar}>
      {TABS.map((tab, idx) => (
        <TouchableOpacity
          key={tab}
          style={s.tabItem}
          onPress={() => onChange(tab, idx)}
          activeOpacity={0.75}
        >
          <Text style={[s.tabLabel, activeTab === tab && s.tabLabelActive]}>
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
      <Animated.View
        style={[
          s.tabUnderline,
          { width: TAB_W, transform: [{ translateX: underlineX }] },
        ]}
      />
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function StateDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const { data, isLoading, isError, refetch } = useStateDetail(slug);

  const scrollY = useRef(new Animated.Value(0)).current;
  const underlineX = useRef(new Animated.Value(0)).current;
  const [activeTab, setActiveTab] = useState<Tab>('Culture');
  const [foodFilter, setFoodFilter] = useState<string>('All');

  const headerOpacity = scrollY.interpolate({
    inputRange: [HERO_H - 90, HERO_H - 20],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleTabChange = (tab: Tab, idx: number) => {
    setActiveTab(tab);
    Animated.spring(underlineX, {
      toValue: idx * (SCREEN_W / TABS.length),
      useNativeDriver: true,
      tension: 120,
      friction: 14,
    }).start();
  };

  const filteredFoods = useMemo(() => {
    const foods: Food[] = data?.foods ?? [];
    if (foodFilter === 'All') return foods;
    if (foodFilter === 'Veg') return foods.filter((f) => f.is_vegetarian);
    if (foodFilter === 'Non-Veg') return foods.filter((f) => !f.is_vegetarian);
    return foods.filter((f) => f.meal_type === foodFilter);
  }, [data?.foods, foodFilter]);

  const handleShare = async () => {
    if (!data) return;
    try {
      await Share.share({
        title: data.name,
        message: `Explore ${data.name} on BharatDarshan!`,
      });
    } catch (_) {}
  };

  if (isLoading) return <StateSkeleton />;
  if (isError) return <ErrorState onRetry={refetch} />;
  if (!data) return null;

  const regionColor =
    colors.region[data.region as keyof typeof colors.region] ?? colors.saffron;
  const initial = data.name.charAt(0).toUpperCase();

  const cultureItems = CULTURE_FIELDS.filter(
    (f) => data.culture?.[f.key as keyof Culture],
  );

  return (
    <View style={s.root}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ── Main scrollable content */}
      <Animated.ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        stickyHeaderIndices={[1]}
        showsVerticalScrollIndicator={false}
      >
        {/* [0] HERO */}
        <View style={[s.hero, { height: HERO_H }]}>
          <ImageWithFallback
            uri={data.cover_image_url}
            style={StyleSheet.absoluteFill as any}
            fallbackSlug={data.slug}
          />
          <LinearGradient
            colors={[regionColor + '55', 'transparent', 'rgba(13,5,0,0.88)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill as any}
          />
          {/* Faded initial watermark */}
          <Text
            style={[s.heroInitial, { paddingTop: insets.top }]}
            pointerEvents="none"
          >
            {initial}
          </Text>
          {/* Hero text anchored to bottom */}
          <View style={[s.heroContent, { paddingTop: insets.top + 44 }]}>
            <Text style={s.heroName}>{data.name}</Text>
            {/* Capital · Language · Region pills */}
            <View style={s.heroPills}>
              {data.capital ? (
                <View style={s.heroPill}>
                  <Text style={s.heroPillText}>{data.capital}</Text>
                </View>
              ) : null}
              {data.language ? (
                <View style={s.heroPill}>
                  <Text style={s.heroPillText}>{data.language}</Text>
                </View>
              ) : null}
              <View style={[s.heroPill, { backgroundColor: regionColor + '44' }]}>
                <Text style={[s.heroPillText, { color: regionColor + 'EE' }]}>
                  {data.region}
                </Text>
              </View>
            </View>
            {/* Stat pills */}
            <View style={s.heroStats}>
              {data.established_date ? (
                <View style={s.heroStat}>
                  <Text style={s.heroStatVal}>{data.established_date}</Text>
                  <Text style={s.heroStatLabel}>Established</Text>
                </View>
              ) : null}
              {data.population ? (
                <View style={s.heroStat}>
                  <Text style={s.heroStatVal}>
                    {(data.population / 1_000_000).toFixed(1)}M
                  </Text>
                  <Text style={s.heroStatLabel}>Population</Text>
                </View>
              ) : null}
              {data.area_sq_km ? (
                <View style={s.heroStat}>
                  <Text style={s.heroStatVal}>
                    {(data.area_sq_km / 1000).toFixed(0)}K km²
                  </Text>
                  <Text style={s.heroStatLabel}>Area</Text>
                </View>
              ) : null}
              <View style={s.heroStat}>
                <Text style={s.heroStatVal}>{data.monuments_count ?? 0}</Text>
                <Text style={s.heroStatLabel}>Monuments</Text>
              </View>
            </View>
          </View>
        </View>

        {/* [1] TAB BAR (sticky) */}
        <TabBar
          activeTab={activeTab}
          onChange={handleTabChange}
          underlineX={underlineX}
        />

        {/* [2] TAB CONTENT */}
        <View style={s.tabContent}>
          {/* CULTURE TAB */}
          {activeTab === 'Culture' && (
            <View style={s.cultureSection}>
              {cultureItems.length === 0 ? (
                <Text style={s.emptyText}>Culture information coming soon.</Text>
              ) : (
                <View style={s.cultureGrid}>
                  {cultureItems.map((field) => (
                    <CultureCard
                      key={field.key}
                      field={field}
                      value={data.culture![field.key as keyof Culture] as string}
                    />
                  ))}
                </View>
              )}
            </View>
          )}

          {/* FOOD TAB */}
          {activeTab === 'Food' && (
            <View>
              {/* Filter pills */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.filterPills}
                style={s.filterPillsWrap}
              >
                {FOOD_FILTERS.map((f) => (
                  <TouchableOpacity
                    key={f}
                    style={[s.filterPill, foodFilter === f && s.filterPillActive]}
                    onPress={() => setFoodFilter(f)}
                    activeOpacity={0.75}
                  >
                    <Text
                      style={[
                        s.filterPillText,
                        foodFilter === f && s.filterPillTextActive,
                      ]}
                    >
                      {f}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {filteredFoods.length === 0 ? (
                <Text style={s.emptyText}>No dishes match your filter.</Text>
              ) : (
                filteredFoods.map((food) => <FoodCard key={food.id} item={food} />)
              )}
            </View>
          )}

          {/* TRADITIONS TAB */}
          {activeTab === 'Traditions' && (
            <View style={s.tradSection}>
              {(data.traditions ?? []).length === 0 ? (
                <Text style={s.emptyText}>Tradition information coming soon.</Text>
              ) : (
                (data.traditions ?? []).map((t: Tradition) => (
                  <TraditionCard key={t.id} item={t} />
                ))
              )}
            </View>
          )}
        </View>

        {/* [3] HERITAGE SITES section */}
        <View style={s.bottomSection}>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Heritage Sites</Text>
            <Text style={s.sectionCount}>{data.monuments_count ?? 0} sites</Text>
          </View>
          <TouchableOpacity
            style={s.viewAllBtn}
            onPress={() => router.push('/(tabs)/heritage')}
            activeOpacity={0.8}
          >
            <Text style={s.viewAllBtnText}>
              View all {data.name} monuments  →
            </Text>
          </TouchableOpacity>
        </View>

        {/* [4] Bottom pad */}
        <View style={{ height: 80 }} />
      </Animated.ScrollView>

      {/* ── Floating animated header (back + title + share) */}
      <View
        style={[s.floatingHeader, { paddingTop: insets.top }]}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.ink, opacity: headerOpacity }]}
          pointerEvents="none"
        />
        <TouchableOpacity
          style={s.backBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Animated.Text style={[s.headerTitle, { opacity: headerOpacity }]} numberOfLines={1}>
          {data.name}
        </Animated.Text>
        <TouchableOpacity
          style={s.shareBtn}
          onPress={handleShare}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="share-outline" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const CARD_W = (SCREEN_W - 44) / 2;

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },

  // Hero
  hero: { overflow: 'hidden' },
  heroInitial: {
    position: 'absolute',
    right: -10,
    top: 0,
    fontFamily: fontFamily.cormorantBold,
    fontSize: 220,
    color: 'rgba(255,255,255,0.07)',
    lineHeight: 220,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 28,
    gap: 10,
  },
  heroName: {
    fontFamily: fontFamily.cormorantBoldItalic,
    fontSize: 64,
    color: '#FFFFFF',
    lineHeight: 66,
  },
  heroPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  heroPill: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  heroPillText: {
    fontFamily: fontFamily.dmSans,
    fontSize: 12,
    color: 'rgba(255,255,255,0.88)',
  },
  heroStats: {
    flexDirection: 'row',
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 12,
  },
  heroStat: { alignItems: 'center', gap: 2 },
  heroStatVal: {
    fontFamily: fontFamily.cormorantSemiBold,
    fontSize: 18,
    color: colors.gold,
    lineHeight: 20,
  },
  heroStatLabel: {
    fontFamily: fontFamily.dmSans,
    fontSize: 9,
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 0.8,
  },

  // Floating header
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 10,
    paddingHorizontal: 16,
    zIndex: 100,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: {
    flex: 1,
    fontFamily: fontFamily.cormorantBold,
    fontSize: 20,
    color: '#FFFFFF',
    textAlign: 'center',
    marginHorizontal: 8,
  },
  shareBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },

  // Tab bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: colors.parchment,
    position: 'relative',
    zIndex: 10,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabLabel: {
    fontFamily: fontFamily.dmSansMedium,
    fontSize: 14,
    color: colors.ink + '66',
    letterSpacing: 0.3,
  },
  tabLabelActive: { color: colors.saffron },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    height: 2,
    backgroundColor: colors.saffron,
    borderRadius: 2,
  },

  // Tab content
  tabContent: { backgroundColor: colors.cream, minHeight: 400 },

  // Culture
  cultureSection: { padding: 16 },
  cultureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cultCard: {
    width: CARD_W,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    padding: 14,
    gap: 6,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cultTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: colors.saffron,
  },
  cultEmoji: { fontSize: 24, marginTop: 4 },
  cultLabel: {
    fontFamily: fontFamily.dmSansBold,
    fontSize: 11,
    color: colors.ink + '88',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  cultValue: {
    fontFamily: fontFamily.dmSans,
    fontSize: 13,
    color: colors.ink,
    lineHeight: 19,
  },

  // Food
  filterPillsWrap: {
    borderBottomWidth: 1,
    borderBottomColor: colors.parchment,
    backgroundColor: colors.cream,
  },
  filterPills: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.parchment,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  filterPillActive: {
    backgroundColor: colors.saffron + '15',
    borderColor: colors.saffron,
  },
  filterPillText: {
    fontFamily: fontFamily.dmSansMedium,
    fontSize: 12,
    color: colors.ink + 'AA',
  },
  filterPillTextActive: { color: colors.saffron },

  foodCard: {
    marginHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 8,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  foodTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  vegDot: { width: 10, height: 10, borderRadius: 5 },
  foodName: {
    fontFamily: fontFamily.cormorantBold,
    fontSize: 20,
    color: colors.ink,
    flex: 1,
  },
  mealPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  mealPillText: {
    fontFamily: fontFamily.dmSans,
    fontSize: 10,
    color: colors.saffron,
    fontWeight: '600',
  },
  foodDesc: {
    fontFamily: fontFamily.dmSansLight,
    fontSize: 13,
    color: colors.ink + 'CC',
    lineHeight: 20,
  },
  ingredientsToggle: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  ingredientsToggleText: {
    fontFamily: fontFamily.dmSansMedium,
    fontSize: 12,
    color: colors.saffron,
  },
  ingredientsText: {
    fontFamily: fontFamily.dmSansLight,
    fontSize: 12,
    color: colors.ink + 'AA',
    lineHeight: 19,
    fontStyle: 'italic',
  },

  // Traditions
  tradSection: { padding: 16, gap: 12 },
  tradCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.gold,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  tradHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  tradName: {
    fontFamily: fontFamily.cormorantBold,
    fontSize: 20,
    color: colors.ink,
    flex: 1,
  },
  tradBadge: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 20,
  },
  tradBadgeText: {
    fontFamily: fontFamily.dmSans,
    fontSize: 10,
    fontWeight: '600',
  },
  tradDesc: {
    fontFamily: fontFamily.dmSans,
    fontSize: 13,
    color: colors.ink + 'CC',
    lineHeight: 20,
  },
  tradSig: {
    backgroundColor: colors.parchment,
    borderRadius: 8,
    padding: 10,
    gap: 3,
  },
  tradSigLabel: {
    fontFamily: fontFamily.dmSansBold,
    fontSize: 10,
    color: colors.ink + '77',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  tradSigText: {
    fontFamily: fontFamily.dmSans,
    fontSize: 13,
    color: colors.ink,
    lineHeight: 19,
  },
  tradRegion: {
    fontFamily: fontFamily.dmSans,
    fontSize: 11,
    color: colors.ink + '66',
    fontStyle: 'italic',
  },

  // Bottom sections
  bottomSection: {
    backgroundColor: colors.parchment,
    padding: 20,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontFamily: fontFamily.cormorantBold,
    fontSize: 26,
    color: colors.ink,
  },
  sectionCount: {
    fontFamily: fontFamily.dmSans,
    fontSize: 13,
    color: colors.ink + '77',
  },
  viewAllBtn: {
    backgroundColor: colors.ink,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignSelf: 'flex-start',
  },
  viewAllBtnText: {
    fontFamily: fontFamily.dmSansMedium,
    fontSize: 13,
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  emptyText: {
    fontFamily: fontFamily.dmSansLight,
    fontSize: 14,
    color: colors.ink + '66',
    textAlign: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
});
