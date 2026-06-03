import { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  FlatList,
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

import { SkeletonBox } from '../../components/ui/SkeletonBox';
import { ErrorState } from '../../components/ui/ErrorState';
import { useFestivalDetail } from '../../hooks/useFestivals';
import { colors } from '../../constants/colors';
import { fontFamily, fontSize } from '../../constants/fonts';

// ─── Constants ────────────────────────────────────────────────────────────────
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const HERO_H = SCREEN_H * 0.55;
const PARTICLE_COUNT = 20;

const TIP_CAT_COLORS: Record<string, string> = {
  What_to_Wear: '#8B1A1A',
  What_to_Eat: '#2D6A4F',
  What_to_Carry: '#1B4F8A',
  Photography: '#C9901A',
  Safety: '#E8580A',
  Transport: '#1B4F8A',
  Etiquette: '#4A0404',
  Best_Spots: '#C9901A',
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface Ritual {
  id: number;
  name: string;
  description?: string;
  timing?: string;
}

interface FestivalTip {
  id: number;
  title: string;
  body: string;
}

interface CelebratingState {
  id: number;
  name: string;
  slug: string;
  local_name?: string;
  local_significance?: string;
}

interface RelatedFestival {
  id: number;
  name: string;
  slug: string;
  religion: string;
  month_name: string;
  cover_image_url: string;
  tagline?: string;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function FestivalSkeleton() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.crimson }}>
      <SkeletonBox w="100%" h={HERO_H} radius={0} />
      <View style={{ padding: 20, gap: 14, backgroundColor: colors.cream }}>
        <SkeletonBox w="80%" h={44} />
        <SkeletonBox w="55%" h={18} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {[0, 1, 2, 3].map((i) => (
            <SkeletonBox key={i} w={SCREEN_W / 4 - 16} h={72} radius={12} />
          ))}
        </View>
        {[0, 1, 2, 3, 4].map((i) => (
          <SkeletonBox key={i} w={i % 3 === 0 ? '100%' : i % 3 === 1 ? '85%' : '70%'} h={14} />
        ))}
        <SkeletonBox w="100%" h={120} radius={14} />
        {[0, 1, 2].map((i) => (
          <SkeletonBox key={`r${i}`} w="100%" h={90} radius={10} />
        ))}
      </View>
    </ScrollView>
  );
}

// ─── Floating particles (Animated API) ───────────────────────────────────────
function FloatingParticles({ height }: { height: number }) {
  const particles = useRef(
    Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      y: new Animated.Value(height),
      opacity: new Animated.Value(0),
      x: (i * (SCREEN_W / PARTICLE_COUNT)) + (i % 5) * 8,
      size: 2 + (i % 4),
      duration: 3800 + i * 320,
    })),
  ).current;

  useEffect(() => {
    particles.forEach((p, i) => {
      const loop = () => {
        p.y.setValue(height + 10);
        p.opacity.setValue(0);
        Animated.parallel([
          Animated.timing(p.y, {
            toValue: -20,
            duration: p.duration,
            easing: Easing.linear,
            useNativeDriver: true,
            delay: i * 130,
          }),
          Animated.sequence([
            Animated.timing(p.opacity, {
              toValue: 0.75,
              duration: 400,
              useNativeDriver: true,
              delay: i * 130,
            }),
            Animated.timing(p.opacity, {
              toValue: 0.75,
              duration: p.duration - 600,
              useNativeDriver: true,
            }),
            Animated.timing(p.opacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => loop());
      };
      loop();
    });
    return () => {
      particles.forEach((p) => {
        p.y.stopAnimation();
        p.opacity.stopAnimation();
      });
    };
  }, [height]);

  return (
    <>
      {particles.map((p, i) => (
        <Animated.View
          key={i}
          pointerEvents="none"
          style={{
            position: 'absolute',
            left: p.x,
            width: p.size,
            height: p.size,
            borderRadius: p.size / 2,
            backgroundColor: '#C9901A',
            transform: [{ translateY: p.y }],
            opacity: p.opacity,
          }}
        />
      ))}
    </>
  );
}

// ─── Quick Fact Block ─────────────────────────────────────────────────────────
function FactBlock({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <View style={s.factBlock}>
      <Text style={[s.factValue, accent ? { color: accent } : null]}>{value}</Text>
      <Text style={s.factLabel}>{label}</Text>
    </View>
  );
}

// ─── Significance Pull-Quote ──────────────────────────────────────────────────
function SignificanceQuote({ text }: { text: string }) {
  return (
    <View style={s.quoteCard}>
      <Text style={s.quoteMark}>"</Text>
      <Text style={s.quoteText}>{text}</Text>
    </View>
  );
}

// ─── Ritual Timeline Entry ────────────────────────────────────────────────────
function RitualEntry({ item, isLast }: { item: Ritual; isLast: boolean }) {
  return (
    <View style={s.ritualRow}>
      {/* Gold timeline line + dot */}
      <View style={s.ritualTimeline}>
        <View style={s.ritualDot} />
        {!isLast && <View style={s.ritualLine} />}
      </View>
      {/* Content */}
      <View style={s.ritualContent}>
        {item.timing ? (
          <Text style={s.ritualTiming}>{item.timing}</Text>
        ) : null}
        <Text style={s.ritualName}>{item.name}</Text>
        {item.description ? (
          <Text style={s.ritualDesc}>{item.description}</Text>
        ) : null}
      </View>
    </View>
  );
}

// ─── Festival Tip Card ────────────────────────────────────────────────────────
function TipCard({ category, tip }: { category: string; tip: FestivalTip }) {
  const barColor = TIP_CAT_COLORS[category] ?? colors.gold;
  const label = category.replace(/_/g, ' ');
  return (
    <View style={[s.tipCard, { borderLeftColor: barColor }]}>
      <Text style={[s.tipCategory, { color: barColor }]}>{label}</Text>
      <Text style={s.tipTitle}>{tip.title}</Text>
      <Text style={s.tipBody}>{tip.body}</Text>
    </View>
  );
}

// ─── Celebrating State Row ────────────────────────────────────────────────────
function CelebStateRow({ item }: { item: CelebratingState }) {
  return (
    <TouchableOpacity
      style={s.celebRow}
      onPress={() => router.push(`/states/${item.slug}`)}
      activeOpacity={0.8}
    >
      <View style={s.celebLeft}>
        <Text style={s.celebName}>{item.name}</Text>
        {item.local_name ? (
          <Text style={s.celebLocalName}>{item.local_name}</Text>
        ) : null}
        {item.local_significance ? (
          <Text style={s.celebSig} numberOfLines={2}>{item.local_significance}</Text>
        ) : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.gold} />
    </TouchableOpacity>
  );
}

// ─── Related Festival Card ────────────────────────────────────────────────────
function RelatedCard({ item }: { item: RelatedFestival }) {
  const religionColor =
    colors.religion[item.religion as keyof typeof colors.religion] ?? colors.gold;
  return (
    <TouchableOpacity
      style={s.relCard}
      onPress={() => router.push(`/festivals/${item.slug}`)}
      activeOpacity={0.88}
    >
      <LinearGradient
        colors={[religionColor, religionColor + '88']}
        style={s.relGrad}
      >
        <Text style={s.relMonth}>{item.month_name}</Text>
        <Text style={s.relName} numberOfLines={2}>{item.name}</Text>
        {item.tagline ? (
          <Text style={s.relTagline} numberOfLines={1}>{item.tagline}</Text>
        ) : null}
      </LinearGradient>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function FestivalDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const insets = useSafeAreaInsets();
  const { data, isLoading, isError, refetch } = useFestivalDetail(slug);

  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [HERO_H - 90, HERO_H - 20],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleShare = async () => {
    if (!data) return;
    try {
      await Share.share({ title: data.name, message: `Celebrate ${data.name} with BharatDarshan!` });
    } catch (_) {}
  };

  if (isLoading) return <FestivalSkeleton />;
  if (isError) return <ErrorState onRetry={refetch} />;
  if (!data) return null;

  const religionColor =
    colors.religion[data.religion as keyof typeof colors.religion] ?? colors.gold;

  const allTips: Array<{ category: string; tip: FestivalTip }> = [];
  if (data.tips && typeof data.tips === 'object') {
    Object.entries(data.tips).forEach(([cat, tips]) => {
      (tips as FestivalTip[]).forEach((tip) => {
        allTips.push({ category: cat, tip });
      });
    });
  }

  // Pair tips for 2-column grid
  const tipPairs: Array<[{ category: string; tip: FestivalTip }, { category: string; tip: FestivalTip } | null]> = [];
  for (let i = 0; i < allTips.length; i += 2) {
    tipPairs.push([allTips[i], allTips[i + 1] ?? null]);
  }

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
        <View style={{ height: HERO_H, overflow: 'hidden' }}>
          <LinearGradient
            colors={['#1A0404', '#8B1A1A', religionColor + 'BB']}
            start={{ x: 0.1, y: 0 }}
            end={{ x: 0.9, y: 1 }}
            style={StyleSheet.absoluteFill as any}
          />
          {/* Floating particles */}
          <FloatingParticles height={HERO_H} />
          {/* Hero content */}
          <View style={[s.heroContent, { paddingTop: insets.top + 44 }]}>
            {/* Religion badge */}
            <View style={[s.religionBadge, { backgroundColor: religionColor + 'EE' }]}>
              <Text style={s.religionBadgeText}>{data.religion}</Text>
            </View>
            {/* Festival name */}
            <Text style={s.heroName}>{data.name}</Text>
            {/* Tagline */}
            {data.tagline ? (
              <Text style={s.heroTagline}>{data.tagline}</Text>
            ) : null}
            {/* Info pills */}
            <View style={s.heroPills}>
              <View style={s.heroPill}>
                <Text style={s.heroPillText}>{data.month_name}</Text>
              </View>
              {data.duration_days ? (
                <View style={s.heroPill}>
                  <Text style={s.heroPillText}>{data.duration_days} days</Text>
                </View>
              ) : null}
              {data.is_national ? (
                <View style={[s.heroPill, { backgroundColor: colors.gold + '44' }]}>
                  <Text style={[s.heroPillText, { color: colors.gold + 'EE' }]}>
                    Pan India
                  </Text>
                </View>
              ) : data.state?.name ? (
                <View style={s.heroPill}>
                  <Text style={s.heroPillText}>{data.state.name}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {/* ── QUICK FACTS */}
        <View style={s.factsRow}>
          {data.month_name ? (
            <FactBlock label="Month" value={data.month_name} accent={religionColor} />
          ) : null}
          {data.duration_days ? (
            <FactBlock label="Duration" value={`${data.duration_days} days`} />
          ) : null}
          {data.start_day ? (
            <FactBlock
              label="Period"
              value={data.end_day ? `${data.start_day}–${data.end_day}` : String(data.start_day)}
            />
          ) : null}
          <FactBlock
            label="Reach"
            value={data.is_national ? 'National' : 'Regional'}
            accent={colors.gold}
          />
        </View>

        {/* ── SHORT DESCRIPTION */}
        {data.short_description ? (
          <View style={s.section}>
            <Text style={s.body}>{data.short_description}</Text>
          </View>
        ) : null}

        {/* ── FULL DESCRIPTION */}
        {data.full_description ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>About</Text>
            <Text style={s.body}>{data.full_description}</Text>
          </View>
        ) : null}

        {/* ── HOW CELEBRATED */}
        {data.how_celebrated ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>How It's Celebrated</Text>
            <Text style={s.body}>{data.how_celebrated}</Text>
          </View>
        ) : null}

        {/* ── SIGNIFICANCE PULL-QUOTE */}
        {data.significance ? (
          <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
            <SignificanceQuote text={data.significance} />
          </View>
        ) : null}

        {/* ── RITUALS TIMELINE */}
        {data.rituals?.length > 0 ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Rituals & Ceremonies</Text>
            {(data.rituals as Ritual[]).map((ritual, i) => (
              <RitualEntry
                key={ritual.id}
                item={ritual}
                isLast={i === data.rituals.length - 1}
              />
            ))}
          </View>
        ) : null}

        {/* ── FESTIVAL GUIDE TIPS (2-col grid) */}
        {allTips.length > 0 ? (
          <View style={[s.section, s.darkSection]}>
            <Text style={[s.sectionTitle, { color: '#FFFFFF' }]}>
              Festival Guide
            </Text>
            {tipPairs.map(([a, b], i) => (
              <View key={i} style={s.tipRow}>
                <View style={{ flex: 1 }}>
                  <TipCard category={a.category} tip={a.tip} />
                </View>
                {b ? (
                  <View style={{ flex: 1 }}>
                    <TipCard category={b.category} tip={b.tip} />
                  </View>
                ) : (
                  <View style={{ flex: 1 }} />
                )}
              </View>
            ))}
          </View>
        ) : null}

        {/* ── CELEBRATING STATES */}
        {data.celebrating_states?.length > 0 ? (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Celebrated Across India</Text>
            <View style={s.celebList}>
              {(data.celebrating_states as CelebratingState[]).map((state) => (
                <CelebStateRow key={state.id} item={state} />
              ))}
            </View>
          </View>
        ) : null}

        {/* ── RELATED FESTIVALS */}
        {data.related_festivals?.length > 0 ? (
          <View style={[s.section, s.relatedSection]}>
            <Text style={[s.sectionTitle, { color: '#FFFFFF' }]}>
              More {data.religion} Festivals
            </Text>
            <FlatList
              horizontal
              data={data.related_festivals as RelatedFestival[]}
              keyExtractor={(f) => f.slug}
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
        <Animated.Text
          style={[s.headerTitle, { opacity: headerOpacity }]}
          numberOfLines={1}
        >
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
  root: { flex: 1, backgroundColor: colors.ink },
  scroll: { flex: 1 },
  scrollContent: { flexGrow: 1, backgroundColor: colors.cream },

  // Hero
  heroContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 28,
    alignItems: 'center',
    gap: 10,
  },
  religionBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  religionBadgeText: {
    fontFamily: fontFamily.dmSansBold,
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  heroName: {
    fontFamily: fontFamily.cormorantBold,
    fontSize: 72,
    color: '#FFFFFF',
    lineHeight: 74,
    textAlign: 'center',
  },
  heroTagline: {
    fontFamily: fontFamily.cormorantSemiBoldItalic,
    fontSize: 18,
    color: colors.gold,
    textAlign: 'center',
    lineHeight: 22,
  },
  heroPills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
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

  // Significance pull-quote
  quoteCard: {
    backgroundColor: colors.ink,
    borderRadius: 16,
    padding: 20,
    paddingTop: 12,
    gap: 8,
  },
  quoteMark: {
    fontFamily: fontFamily.cormorantBold,
    fontSize: 72,
    color: colors.gold,
    lineHeight: 64,
  },
  quoteText: {
    fontFamily: fontFamily.cormorantSemiBoldItalic,
    fontSize: 20,
    color: '#FFFFFF',
    lineHeight: 28,
  },

  // Ritual timeline
  ritualRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 20,
  },
  ritualTimeline: {
    alignItems: 'center',
    width: 16,
  },
  ritualDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.gold,
    marginTop: 4,
  },
  ritualLine: {
    flex: 1,
    width: 2,
    backgroundColor: colors.gold + '44',
    marginTop: 4,
  },
  ritualContent: { flex: 1, gap: 4 },
  ritualTiming: {
    fontFamily: fontFamily.dmSansBold,
    fontSize: 11,
    color: colors.saffron,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  ritualName: {
    fontFamily: fontFamily.cormorantBold,
    fontSize: 20,
    color: colors.ink,
    lineHeight: 22,
  },
  ritualDesc: {
    fontFamily: fontFamily.dmSansLight,
    fontSize: 13,
    color: colors.ink + 'CC',
    lineHeight: 20,
  },

  // Tips 2-col grid
  tipRow: { flexDirection: 'row', gap: 8, marginBottom: 0 },
  tipCard: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    borderLeftWidth: 3,
    padding: 12,
    marginBottom: 8,
    gap: 3,
  },
  tipCategory: {
    fontFamily: fontFamily.dmSansBold,
    fontSize: 9,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  tipTitle: {
    fontFamily: fontFamily.dmSansMedium,
    fontSize: 13,
    color: '#FFFFFF',
    lineHeight: 18,
  },
  tipBody: {
    fontFamily: fontFamily.dmSansLight,
    fontSize: 12,
    color: 'rgba(255,255,255,0.72)',
    lineHeight: 18,
  },

  // Celebrating states
  celebList: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.parchment,
  },
  celebRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.parchment,
    gap: 12,
  },
  celebLeft: { flex: 1, gap: 2 },
  celebName: {
    fontFamily: fontFamily.cormorantBold,
    fontSize: 18,
    color: colors.ink,
  },
  celebLocalName: {
    fontFamily: fontFamily.dmSansMedium,
    fontSize: 12,
    color: colors.saffron,
  },
  celebSig: {
    fontFamily: fontFamily.dmSansLight,
    fontSize: 12,
    color: colors.ink + 'AA',
    lineHeight: 18,
  },

  // Related festivals
  relCard: {
    width: 200,
    borderRadius: 14,
    overflow: 'hidden',
  },
  relGrad: {
    padding: 16,
    minHeight: 140,
    justifyContent: 'flex-end',
    gap: 4,
  },
  relMonth: {
    fontFamily: fontFamily.dmSans,
    fontSize: 10,
    color: 'rgba(255,255,255,0.72)',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  relName: {
    fontFamily: fontFamily.cormorantBold,
    fontSize: 22,
    color: '#FFFFFF',
    lineHeight: 24,
  },
  relTagline: {
    fontFamily: fontFamily.cormorantItalic,
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
  },
});
