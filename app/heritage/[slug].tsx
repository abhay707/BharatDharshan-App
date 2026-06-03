import { useRef } from 'react';
import {
  Animated,
  Dimensions,
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
import MapView, { Marker } from 'react-native-maps';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ImageWithFallback } from '../../components/shared/ImageWithFallback';
import { SkeletonBox } from '../../components/ui/SkeletonBox';
import { ErrorState } from '../../components/ui/ErrorState';
import { useMonumentDetail } from '../../hooks/useMonuments';
import { colors } from '../../constants/colors';
import { fontFamily, fontSize } from '../../constants/fonts';

// ─── Constants ────────────────────────────────────────────────────────────────
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const HERO_H = SCREEN_H * 0.5;

const TIP_COLORS: Record<string, string> = {
  General: '#1B4F8A',
  Photography: '#C9901A',
  Transport: '#2D6A4F',
  Clothing: '#8B1A1A',
  Food: '#E8580A',
  Timing: '#4A0404',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface MonumentTip {
  id: number;
  tip: string;
}

interface RelatedMonument {
  id: number;
  name: string;
  slug: string;
  state?: string;
  type: string;
  cover_image_url: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function openInMaps(lat: number, lng: number, name: string) {
  const q = encodeURIComponent(name);
  const url =
    Platform.OS === 'ios'
      ? `http://maps.apple.com/?ll=${lat},${lng}&q=${q}`
      : `geo:${lat},${lng}?q=${q}`;
  Linking.openURL(url).catch(() =>
    Linking.openURL(`https://maps.google.com/?q=${lat},${lng}`),
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function MonumentSkeleton() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.ink }}>
      <SkeletonBox w="100%" h={HERO_H} radius={0} />
      <View style={{ padding: 20, gap: 14, backgroundColor: colors.cream }}>
        <SkeletonBox w="70%" h={34} />
        <SkeletonBox w="45%" h={16} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[0, 1, 2, 3].map((i) => (
            <SkeletonBox key={i} w={SCREEN_W / 4 - 16} h={72} radius={12} />
          ))}
        </View>
        {[0, 1, 2, 3].map((i) => (
          <SkeletonBox key={i} w={i % 2 === 0 ? '100%' : '75%'} h={14} />
        ))}
        <SkeletonBox w="100%" h={250} radius={16} />
      </View>
    </ScrollView>
  );
}

// ─── Quick Fact Block ─────────────────────────────────────────────────────────
function FactBlock({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <View style={s.factBlock}>
      <Text style={[s.factValue, accent ? { color: accent } : null]}>{value}</Text>
      <Text style={s.factLabel}>{label}</Text>
    </View>
  );
}

// ─── Highlight item (numbered) ────────────────────────────────────────────────
function HighlightItem({ text, index }: { text: string; index: number }) {
  const num = String(index + 1).padStart(2, '0');
  return (
    <View style={s.hlItem}>
      <Text style={s.hlNum}>{num}</Text>
      <Text style={s.hlText}>{text}</Text>
    </View>
  );
}

// ─── Tip Card ─────────────────────────────────────────────────────────────────
function TipCard({
  category,
  tip,
}: {
  category: string;
  tip: MonumentTip;
}) {
  const barColor = TIP_COLORS[category] ?? colors.gold;
  return (
    <View style={[s.tipCard, { borderLeftColor: barColor }]}>
      <Text style={[s.tipCategory, { color: barColor }]}>
        {category.replace('_', ' ')}
      </Text>
      <Text style={s.tipText}>{tip.tip}</Text>
    </View>
  );
}

// ─── Related Monument Card ────────────────────────────────────────────────────
function RelatedCard({ item }: { item: RelatedMonument }) {
  const typeColor =
    colors.monument[item.type as keyof typeof colors.monument] ?? colors.gold;
  return (
    <TouchableOpacity
      style={s.relCard}
      onPress={() => router.push(`/heritage/${item.slug}`)}
      activeOpacity={0.88}
    >
      <ImageWithFallback
        uri={item.cover_image_url}
        style={StyleSheet.absoluteFill as any}
        fallbackSlug={item.slug}
      />
      <LinearGradient
        colors={['transparent', typeColor + 'F0']}
        start={{ x: 0, y: 0.4 }}
        end={{ x: 0, y: 1 }}
        style={[StyleSheet.absoluteFill as any, { justifyContent: 'flex-end' }]}
      >
        <View style={{ padding: 10 }}>
          <View style={s.relTypePill}>
            <Text style={s.relTypeText}>{item.type}</Text>
          </View>
          <Text style={s.relName} numberOfLines={2}>{item.name}</Text>
          {item.state ? (
            <Text style={s.relState}>{item.state}</Text>
          ) : null}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function MonumentDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const { data, isLoading, isError, refetch } = useMonumentDetail(slug);

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [HERO_H - 90, HERO_H - 20],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleShare = async () => {
    if (!data) return;
    try {
      await Share.share({ title: data.name, message: `Explore ${data.name} on BharatDarshan!` });
    } catch (_) {}
  };

  if (isLoading) return <MonumentSkeleton />;
  if (isError) return <ErrorState onRetry={refetch} />;
  if (!data) return null;

  const typeColor =
    colors.monument[data.type as keyof typeof colors.monument] ?? colors.gold;
  const initial = data.name.charAt(0).toUpperCase();

  const allTips: Array<{ category: string; tip: MonumentTip }> = [];
  if (data.tips && typeof data.tips === 'object') {
    Object.entries(data.tips).forEach(([cat, tips]) => {
      (tips as MonumentTip[]).forEach((tip) => {
        allTips.push({ category: cat, tip });
      });
    });
  }

  const galleryImages: string[] =
    data.gallery_images?.length > 0
      ? data.gallery_images
      : [`https://picsum.photos/seed/${data.slug}/800/400`];

  return (
    <View style={s.root}>
      <Stack.Screen options={{ headerShown: false }} />

      <Animated.ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {/* ── HERO */}
        <View style={[s.hero, { height: HERO_H }]}>
          <ImageWithFallback
            uri={data.gallery_images?.[0] ?? data.cover_image_url}
            style={StyleSheet.absoluteFill as any}
            fallbackSlug={data.slug}
          />
          <LinearGradient
            colors={[typeColor + '44', 'transparent', 'rgba(13,5,0,0.9)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill as any}
          />
          {/* Large faded initial */}
          <Text style={[s.heroInitial, { paddingTop: insets.top }]} pointerEvents="none">
            {initial}
          </Text>
          <View style={[s.heroContent, { paddingTop: insets.top + 50 }]}>
            {/* Type + Category badges */}
            <View style={s.heroBadges}>
              <View style={[s.heroBadge, { backgroundColor: typeColor + 'EE' }]}>
                <Text style={s.heroBadgeText}>{data.type}</Text>
              </View>
              {data.category ? (
                <View style={[s.heroBadge, { backgroundColor: 'rgba(255,255,255,0.22)' }]}>
                  <Text style={s.heroBadgeText}>
                    {data.category.replace('_', ' ')}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={s.heroName}>{data.name}</Text>
            {/* State · Dynasty · Built info */}
            <View style={s.heroMeta}>
              {data.state?.name ? (
                <Text style={s.heroMetaItem}>{data.state.name}</Text>
              ) : null}
              {data.dynasty_or_period ? (
                <Text style={s.heroMetaDot}> · </Text>
              ) : null}
              {data.dynasty_or_period ? (
                <Text style={s.heroMetaItem}>{data.dynasty_or_period}</Text>
              ) : null}
              {data.built_in_year ? (
                <Text style={s.heroMetaDot}> · </Text>
              ) : null}
              {data.built_in_year ? (
                <Text style={s.heroMetaItem}>{data.built_in_year}</Text>
              ) : null}
            </View>
            {data.built_by ? (
              <Text style={s.heroBuiltBy}>Built by {data.built_by}</Text>
            ) : null}
          </View>
        </View>

        {/* ── QUICK FACTS */}
        <View style={s.factsRow}>
          {data.entry_fee_indian ? (
            <FactBlock
              label="Indian Entry"
              value={`₹${data.entry_fee_indian}`}
              accent={colors.saffron}
            />
          ) : null}
          {data.entry_fee_foreign ? (
            <FactBlock
              label="Foreign Entry"
              value={`₹${data.entry_fee_foreign}`}
            />
          ) : null}
          {data.best_time_to_visit ? (
            <FactBlock label="Best Time" value={data.best_time_to_visit} accent={colors.gold} />
          ) : null}
          {data.visiting_hours ? (
            <FactBlock label="Hours" value={data.visiting_hours} />
          ) : null}
        </View>

        {/* ── ABOUT */}
        {data.full_description ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>About</Text>
            <Text style={s.body}>{data.full_description}</Text>
          </View>
        ) : data.short_description ? (
          <View style={s.section}>
            <Text style={s.body}>{data.short_description}</Text>
          </View>
        ) : null}

        {/* ── ADDRESS */}
        {data.address ? (
          <View style={s.addressBlock}>
            <Ionicons name="location-outline" size={15} color={colors.saffron} />
            <Text style={s.addressText}>{data.address}</Text>
          </View>
        ) : null}

        {/* ── HIGHLIGHTS */}
        {data.highlights?.length > 0 ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Highlights</Text>
            {(data.highlights as string[]).slice(0, 6).map((h, i) => (
              <HighlightItem key={i} text={h} index={i} />
            ))}
          </View>
        ) : null}

        {/* ── VISITOR TIPS */}
        {allTips.length > 0 ? (
          <View style={[s.section, s.darkSection]}>
            <Text style={[s.sectionTitle, { color: '#FFFFFF' }]}>Visitor Tips</Text>
            {allTips.map(({ category, tip }) => (
              <TipCard key={tip.id} category={category} tip={tip} />
            ))}
          </View>
        ) : null}

        {/* ── MAP */}
        {typeof data.latitude === 'number' && typeof data.longitude === 'number' ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Location</Text>
            <View style={s.mapWrap}>
              <MapView
                style={s.map}
                initialRegion={{
                  latitude: data.latitude,
                  longitude: data.longitude,
                  latitudeDelta: 0.008,
                  longitudeDelta: 0.008,
                }}
                scrollEnabled={false}
                zoomEnabled={false}
                pitchEnabled={false}
                rotateEnabled={false}
              >
                <Marker
                  coordinate={{ latitude: data.latitude, longitude: data.longitude }}
                  title={data.name}
                  pinColor={colors.saffron}
                />
              </MapView>
            </View>
            <TouchableOpacity
              style={s.openMapsBtn}
              onPress={() => openInMaps(data.latitude!, data.longitude!, data.name)}
              activeOpacity={0.8}
            >
              <Ionicons name="navigate-outline" size={16} color={colors.saffron} />
              <Text style={s.openMapsBtnText}>Open in Maps</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* ── GALLERY */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Gallery</Text>
          <FlatList
            horizontal
            data={galleryImages}
            keyExtractor={(_, i) => String(i)}
            renderItem={({ item: imgUrl, index }) => (
              <View style={s.galleryImg}>
                <ImageWithFallback
                  uri={imgUrl}
                  style={StyleSheet.absoluteFill as any}
                  fallbackSlug={`${data.slug}-${index}`}
                />
              </View>
            )}
            contentContainerStyle={{ gap: 10 }}
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* ── RELATED MONUMENTS */}
        {data.related_monuments?.length > 0 ? (
          <View style={[s.section, s.relatedSection]}>
            <Text style={[s.sectionTitle, { color: '#FFFFFF' }]}>
              Nearby Monuments
            </Text>
            <FlatList
              horizontal
              data={data.related_monuments as RelatedMonument[]}
              keyExtractor={(m) => m.slug}
              renderItem={({ item }) => <RelatedCard item={item} />}
              contentContainerStyle={{ gap: 12 }}
              showsHorizontalScrollIndicator={false}
            />
          </View>
        ) : null}

        <View style={{ height: 80 }} />
      </Animated.ScrollView>

      {/* ── Floating header */}
      <View
        style={[s.floatingHeader, { paddingTop: insets.top }]}
        pointerEvents="box-none"
      >
        <Animated.View
          style={[StyleSheet.absoluteFill, { backgroundColor: colors.ink, opacity: headerOpacity }]}
          pointerEvents="none"
        />
        <TouchableOpacity
          style={s.iconBtn}
          onPress={() => router.back()}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Animated.Text style={[s.headerTitle, { opacity: headerOpacity }]} numberOfLines={1}>
          {data.name}
        </Animated.Text>
        <TouchableOpacity
          style={s.iconBtn}
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
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.cream },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1 },

  // Hero
  hero: { overflow: 'hidden' },
  heroInitial: {
    position: 'absolute',
    right: -6,
    top: 0,
    fontFamily: fontFamily.cormorantBold,
    fontSize: 220,
    color: 'rgba(255,255,255,0.06)',
    lineHeight: 220,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 8,
  },
  heroBadges: { flexDirection: 'row', gap: 8 },
  heroBadge: {
    paddingHorizontal: 11,
    paddingVertical: 4,
    borderRadius: 20,
  },
  heroBadgeText: {
    fontFamily: fontFamily.dmSansMedium,
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  heroName: {
    fontFamily: fontFamily.cormorantBold,
    fontSize: 42,
    color: '#FFFFFF',
    lineHeight: 44,
  },
  heroMeta: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' },
  heroMetaItem: {
    fontFamily: fontFamily.dmSansMedium,
    fontSize: 13,
    color: 'rgba(255,255,255,0.82)',
  },
  heroMetaDot: {
    fontFamily: fontFamily.dmSans,
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  heroBuiltBy: {
    fontFamily: fontFamily.dmSansLight,
    fontSize: 12,
    color: 'rgba(255,255,255,0.65)',
    fontStyle: 'italic',
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
  iconBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerTitle: {
    flex: 1,
    fontFamily: fontFamily.cormorantBold,
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginHorizontal: 8,
  },

  // Quick facts
  factsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
    backgroundColor: colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: colors.parchment,
  },
  factBlock: {
    flex: 1,
    backgroundColor: colors.parchment,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  factValue: {
    fontFamily: fontFamily.cormorantSemiBold,
    fontSize: 15,
    color: colors.ink,
    textAlign: 'center',
    lineHeight: 18,
  },
  factLabel: {
    fontFamily: fontFamily.dmSans,
    fontSize: 10,
    color: colors.ink + '77',
    textAlign: 'center',
    letterSpacing: 0.4,
  },

  // Sections
  section: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 4 },
  darkSection: {
    backgroundColor: colors.ink,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    marginTop: 16,
  },
  relatedSection: {
    backgroundColor: colors.ink,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
    marginTop: 16,
  },
  sectionTitle: {
    fontFamily: fontFamily.cormorantBold,
    fontSize: 26,
    color: colors.ink,
    marginBottom: 14,
    lineHeight: 28,
  },
  body: {
    fontFamily: fontFamily.dmSansLight,
    fontSize: fontSize.base,
    color: colors.ink + 'CC',
    lineHeight: 26,
  },
  addressBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  addressText: {
    fontFamily: fontFamily.dmSans,
    fontSize: 13,
    color: colors.ink + 'AA',
    flex: 1,
    lineHeight: 19,
  },

  // Highlights
  hlItem: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 14,
    alignItems: 'flex-start',
  },
  hlNum: {
    fontFamily: fontFamily.cormorantBold,
    fontSize: 32,
    color: colors.parchment,
    lineHeight: 34,
    width: 36,
    textAlign: 'right',
  },
  hlText: {
    flex: 1,
    fontFamily: fontFamily.dmSans,
    fontSize: 14,
    color: colors.ink,
    lineHeight: 22,
    paddingTop: 4,
  },

  // Tips
  tipCard: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
    borderLeftWidth: 3,
    padding: 12,
    marginBottom: 10,
    gap: 4,
  },
  tipCategory: {
    fontFamily: fontFamily.dmSansBold,
    fontSize: 10,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  tipText: {
    fontFamily: fontFamily.dmSans,
    fontSize: 13,
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 20,
  },

  // Map
  mapWrap: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
  },
  map: { height: 250 },
  openMapsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.saffron,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
  },
  openMapsBtnText: {
    fontFamily: fontFamily.dmSansMedium,
    fontSize: 13,
    color: colors.saffron,
  },

  // Gallery
  galleryImg: {
    width: 200,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.parchment,
  },

  // Related
  relCard: {
    width: 200,
    height: 150,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.ink,
  },
  relTypePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 4,
  },
  relTypeText: {
    fontFamily: fontFamily.dmSans,
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  relName: {
    fontFamily: fontFamily.cormorantBold,
    fontSize: 17,
    color: '#FFFFFF',
    lineHeight: 19,
  },
  relState: {
    fontFamily: fontFamily.dmSans,
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
});
