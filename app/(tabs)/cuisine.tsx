import { useState } from 'react';
import {
  Dimensions,
  FlatList,
  RefreshControl,
  ScrollView,
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
import { useCuisine } from '../../hooks/useCuisine';
import { api, endpoints } from '../../lib/api';
import { colors } from '../../constants/colors';
import { fontFamily, fontSize } from '../../constants/fonts';

// ─── Constants ────────────────────────────────────────────────────────────────
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const HERO_H = SCREEN_H * 0.3;
const CARD_W = (SCREEN_W - 36) / 2;

const MEAL_TYPES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack', 'Dessert', 'Drink'] as const;

const REGIONAL_FLAVOURS = [
  {
    region: 'North',
    title: 'North India',
    color: colors.region.North,
    dishes: ['Dal Makhani', 'Biryani', 'Rajma Chawal'],
    flavor: 'Rich & Creamy',
  },
  {
    region: 'South',
    title: 'South India',
    color: colors.region.South,
    dishes: ['Dosa', 'Idli Sambar', 'Appam'],
    flavor: 'Tangy & Spiced',
  },
  {
    region: 'East',
    title: 'East India',
    color: colors.region.East,
    dishes: ['Rosogolla', 'Litti Chokha', 'Maach'],
    flavor: 'Subtle & Sweet',
  },
  {
    region: 'West',
    title: 'West India',
    color: colors.region.West,
    dishes: ['Dhokla', 'Dal Baati', 'Vada Pav'],
    flavor: 'Tangy & Sweet',
  },
  {
    region: 'Northeast',
    title: 'Northeast',
    color: colors.region.Northeast,
    dishes: ['Thukpa', 'Jadoh', 'Bamboo Shoot'],
    flavor: 'Unique & Earthy',
  },
  {
    region: 'Central',
    title: 'Central India',
    color: colors.region.Central,
    dishes: ['Bhutte Ka Kees', 'Dal Bafla', 'Saoji'],
    flavor: 'Spicy & Robust',
  },
] as const;

// ─── Types ────────────────────────────────────────────────────────────────────
interface DishItem {
  id: number;
  name: string;
  slug: string;
  state?: string;
  meal_type: string;
  is_vegetarian: boolean;
  description?: string;
  cover_image_url: string;
}

type VegFilter = 'all' | 'veg' | 'nonveg';

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function DishSkeleton() {
  return (
    <View style={sk.card}>
      <SkeletonBox w={CARD_W} h={130} radius={0} />
      <View style={sk.body}>
        <SkeletonBox w="78%" h={16} />
        <SkeletonBox w="50%" h={12} />
        <SkeletonBox w={60} h={22} radius={4} />
      </View>
    </View>
  );
}
const sk = StyleSheet.create({
  card: { width: CARD_W, borderRadius: 14, overflow: 'hidden' },
  body: { backgroundColor: colors.parchment, padding: 10, gap: 7 },
});

// ─── Regional flavour card ────────────────────────────────────────────────────
function RegionalCard({
  item,
  onPress,
}: {
  item: (typeof REGIONAL_FLAVOURS)[number];
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.rCard} onPress={onPress} activeOpacity={0.85}>
      <LinearGradient
        colors={[item.color, item.color + 'BB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.rGrad}
      >
        <Text style={styles.rRegion}>{item.flavor.toUpperCase()}</Text>
        <Text style={styles.rTitle}>{item.title}</Text>
        <View style={styles.rDishes}>
          {item.dishes.map((d) => (
            <Text key={d} style={styles.rDish}>
              · {d}
            </Text>
          ))}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ─── Dish grid card ───────────────────────────────────────────────────────────
function DishGridCard({ item }: { item: DishItem }) {
  return (
    <TouchableOpacity
      style={styles.dishCard}
      onPress={() => router.push(`/cuisine/${item.slug}`)}
      activeOpacity={0.88}
    >
      {/* Image */}
      <View style={styles.dishImg}>
        <ImageWithFallback
          uri={item.cover_image_url}
          style={StyleSheet.absoluteFill as any}
          fallbackSlug={item.slug}
        />
        <LinearGradient
          colors={['transparent', 'rgba(13,5,0,0.45)']}
          style={StyleSheet.absoluteFill as any}
        />
        {/* Veg indicator */}
        <View style={styles.vegBox}>
          <View
            style={[
              styles.vegDot,
              { backgroundColor: item.is_vegetarian ? '#2D6A4F' : '#8B1A1A' },
            ]}
          />
        </View>
      </View>

      {/* Content */}
      <View style={styles.dishContent}>
        <Text style={styles.dishName} numberOfLines={1}>{item.name}</Text>
        {item.state && (
          <Text style={styles.dishState} numberOfLines={1}>{item.state}</Text>
        )}
        <View
          style={[
            styles.mealBadge,
            { backgroundColor: colors.saffron + '18', borderColor: colors.saffron + '44' },
          ]}
        >
          <Text style={styles.mealText}>{item.meal_type}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function CuisineScreen() {
  const [stateFilter, setStateFilter] = useState('');
  const [mealType, setMealType] = useState('All');
  const [vegFilter, setVegFilter] = useState<VegFilter>('all');
  const insets = useSafeAreaInsets();

  const isVegetarian =
    vegFilter === 'veg' ? true : vegFilter === 'nonveg' ? false : undefined;

  const { data, isLoading, isError, refetch, isRefetching } = useCuisine({
    state: stateFilter || undefined,
    meal_type: mealType === 'All' ? undefined : mealType,
    is_vegetarian: isVegetarian,
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

  const dishes: DishItem[] = data?.data ?? [];

  if (isError) return <ErrorState onRetry={refetch} />;

  const displayData: any[] = isLoading
    ? Array.from({ length: 8 }, (_, i) => ({ _sk: true, id: `sk-${i}` }))
    : dishes;

  const ListHeader = (
    <>
      {/* ── Hero */}
      <LinearGradient
        colors={['#5C2800', '#C9601A', '#E8A84A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={[styles.hero, { paddingTop: insets.top + 16 }]}
      >
        <Text style={styles.heroEye}>✦ TASTE OF INDIA ✦</Text>
        <Text style={styles.heroTitle}>A Billion Flavours,{'\n'}One Table</Text>
        <Text style={styles.heroSub}>
          Every state a cuisine, every cuisine a story
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
          style={{ maxWidth: 140 }}
        />

        {/* Veg toggle */}
        <View style={styles.vegToggle}>
          {(['all', 'veg', 'nonveg'] as VegFilter[]).map((v) => (
            <TouchableOpacity
              key={v}
              style={[styles.vegBtn, vegFilter === v && styles.vegBtnActive]}
              onPress={() => setVegFilter(v)}
              activeOpacity={0.8}
            >
              <Text style={[styles.vegBtnText, vegFilter === v && styles.vegBtnTextActive]}>
                {v === 'all' ? 'All' : v === 'veg' ? '🌿 Veg' : '🍖 Non-veg'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Meal type pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.mealPills}
        style={styles.mealPillsWrap}
      >
        {MEAL_TYPES.map((mt) => (
          <TouchableOpacity
            key={mt}
            style={[styles.mealPill, mealType === mt && styles.mealPillActive]}
            onPress={() => setMealType(mt)}
            activeOpacity={0.75}
          >
            <Text style={[styles.mealPillText, mealType === mt && styles.mealPillTextActive]}>
              {mt}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Regional flavours */}
      <View style={styles.regionalSection}>
        <Text style={styles.regionalTitle}>Regional Flavours</Text>
        <FlatList
          horizontal
          data={REGIONAL_FLAVOURS as any}
          keyExtractor={(item) => item.region}
          renderItem={({ item }) => (
            <RegionalCard
              item={item}
              onPress={() => setStateFilter('')}
            />
          )}
          contentContainerStyle={styles.regionalList}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      {/* ── All dishes header */}
      <View style={styles.dishesHeader}>
        <Text style={styles.dishesTitle}>
          {mealType === 'All' ? 'All Dishes' : mealType}
        </Text>
        {data?.meta && (
          <Text style={styles.dishesCount}>{data.meta.total} recipes</Text>
        )}
      </View>
    </>
  );

  return (
    <FlatList
      data={displayData}
      numColumns={2}
      keyExtractor={(item) => item.id?.toString() ?? item.slug}
      ListHeaderComponent={ListHeader}
      renderItem={({ item }) =>
        item._sk ? <DishSkeleton /> : <DishGridCard item={item} />
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
            <Text style={styles.emptyIcon}>🍽️</Text>
            <Text style={styles.emptyText}>No dishes found for your filters</Text>
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
    color: 'rgba(255,240,200,0.8)',
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
    color: 'rgba(255,240,200,0.75)',
    lineHeight: 20,
    marginBottom: 14,
  },
  heroDivider: { width: 48, height: 2, backgroundColor: 'rgba(255,240,200,0.6)', borderRadius: 2 },

  // Filter bar
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: colors.parchment,
    flexWrap: 'nowrap',
  },

  // Veg toggle
  vegToggle: {
    flexDirection: 'row',
    backgroundColor: colors.parchment,
    borderRadius: 8,
    overflow: 'hidden',
    flex: 1,
  },
  vegBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
  },
  vegBtnActive: { backgroundColor: colors.saffron + '20' },
  vegBtnText: {
    fontFamily: fontFamily.dmSans,
    fontSize: 11,
    color: colors.ink + '88',
  },
  vegBtnTextActive: {
    color: colors.saffron,
    fontFamily: fontFamily.dmSansMedium,
  },

  // Meal type pills
  mealPillsWrap: {
    backgroundColor: colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: colors.parchment,
  },
  mealPills: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  mealPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.parchment,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  mealPillActive: {
    backgroundColor: colors.saffron + '15',
    borderColor: colors.saffron,
  },
  mealPillText: {
    fontFamily: fontFamily.dmSansMedium,
    fontSize: 12,
    color: colors.ink + 'AA',
  },
  mealPillTextActive: { color: colors.saffron },

  // Regional section
  regionalSection: {
    backgroundColor: colors.ink,
    paddingVertical: 20,
  },
  regionalTitle: {
    fontFamily: fontFamily.cormorantBold,
    fontSize: 26,
    color: '#FFFFFF',
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  regionalList: { paddingHorizontal: 16, gap: 12 },

  // Regional card
  rCard: {
    width: 160,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  rGrad: {
    padding: 16,
    minHeight: 160,
    justifyContent: 'flex-end',
    gap: 4,
  },
  rRegion: {
    fontFamily: fontFamily.dmSans,
    fontSize: 9,
    color: 'rgba(255,255,255,0.75)',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  rTitle: {
    fontFamily: fontFamily.cormorantBold,
    fontSize: 20,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  rDishes: { marginTop: 8, gap: 2 },
  rDish: {
    fontFamily: fontFamily.dmSansLight,
    fontSize: 11,
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 16,
  },

  // Dishes header
  dishesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 20,
    paddingBottom: 8,
    backgroundColor: colors.cream,
  },
  dishesTitle: {
    fontFamily: fontFamily.cormorantBold,
    fontSize: 26,
    color: colors.ink,
  },
  dishesCount: {
    fontFamily: fontFamily.dmSans,
    fontSize: 12,
    color: colors.ink + '66',
  },

  // List
  list: { paddingHorizontal: 12, paddingBottom: 80 },
  row: { gap: 12, marginBottom: 12 },

  // Dish card
  dishCard: {
    width: CARD_W,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.parchment,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  dishImg: { height: 130, overflow: 'hidden' },
  vegBox: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFFFFFEE',
    borderRadius: 8,
    padding: 3,
  },
  vegDot: { width: 10, height: 10, borderRadius: 5 },
  dishContent: { padding: 10, gap: 4 },
  dishName: {
    fontFamily: fontFamily.cormorantBold,
    fontSize: 17,
    color: colors.ink,
    lineHeight: 19,
  },
  dishState: {
    fontFamily: fontFamily.dmSans,
    fontSize: 11,
    color: colors.saffron,
    fontWeight: '500',
  },
  mealBadge: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginTop: 2,
  },
  mealText: {
    fontFamily: fontFamily.dmSans,
    fontSize: 10,
    color: colors.saffron,
    fontWeight: '600',
  },

  // Empty
  empty: {
    alignItems: 'center',
    paddingTop: 48,
    gap: 12,
  },
  emptyIcon: { fontSize: 40 },
  emptyText: {
    fontFamily: fontFamily.dmSans,
    fontSize: 15,
    color: colors.ink + '88',
  },
});
