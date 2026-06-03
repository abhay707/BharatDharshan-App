import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { HeroSection } from '../../components/home/HeroSection';
import { HomeStateCard } from '../../components/home/HomeStateCard';
import { HomeMonumentCard } from '../../components/home/HomeMonumentCard';
import { HomeFestivalCard } from '../../components/home/HomeFestivalCard';
import { CulturalFactsStrip } from '../../components/home/CulturalFactsStrip';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { api, endpoints } from '../../lib/api';
import { colors } from '../../constants/colors';
import { fontFamily, fontSize } from '../../constants/fonts';

// ─── Section header with "See All →" link ────────────────────────────────────
function SectionHead({
  title,
  linkTo,
  light = false,
}: {
  title: string;
  linkTo: string;
  light?: boolean;
}) {
  return (
    <View style={styles.sectionHead}>
      <Text style={[styles.sectionTitle, light && styles.sectionTitleLight]}>
        {title}
      </Text>
      <TouchableOpacity onPress={() => router.push(linkTo as any)}>
        <Text style={[styles.seeAll, light && styles.seeAllLight]}>See All →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['home'],
    queryFn: () => api.get(endpoints.home) as Promise<any>,
  });

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;

  const featuredStates: any[] = data?.featured_states ?? [];
  const featuredMonuments: any[] = data?.featured_monuments ?? [];
  const upcomingFestivals: any[] = data?.upcoming_festivals ?? [];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scroll}
      showsVerticalScrollIndicator={false}
      bounces
    >
      {/* ① Hero */}
      <HeroSection stats={data?.stats} />

      {/* ② Explore States — horizontal scroll */}
      {featuredStates.length > 0 && (
        <View style={styles.section}>
          <SectionHead title="Explore States" linkTo="/(tabs)/states" />
          <FlatList
            horizontal
            data={featuredStates}
            keyExtractor={(item) => item.slug}
            renderItem={({ item }) => <HomeStateCard item={item} />}
            contentContainerStyle={styles.hList}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      {/* ③ Heritage Spotlight — dark section, 2×2 grid */}
      {featuredMonuments.length > 0 && (
        <View style={[styles.section, styles.darkSection]}>
          <SectionHead
            title="Heritage Spotlight"
            linkTo="/(tabs)/heritage"
            light
          />
          <View style={styles.grid}>
            {featuredMonuments.slice(0, 4).map((item: any) => (
              <HomeMonumentCard key={item.slug} item={item} />
            ))}
          </View>
        </View>
      )}

      {/* ④ Upcoming Festivals — parchment section, horizontal */}
      {upcomingFestivals.length > 0 && (
        <View style={[styles.section, styles.parchmentSection]}>
          <SectionHead title="Upcoming Festivals" linkTo="/(tabs)/festivals" />
          <FlatList
            horizontal
            data={upcomingFestivals}
            keyExtractor={(item) => item.slug}
            renderItem={({ item }) => <HomeFestivalCard item={item} />}
            contentContainerStyle={styles.hList}
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}

      {/* ⑤ Cultural Facts Strip */}
      <CulturalFactsStrip />

      <View style={styles.bottomPad} />
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.ink,
  },
  scroll: {
    flexGrow: 1,
  },

  // ── Section wrappers
  section: {
    backgroundColor: colors.cream,
    paddingVertical: 24,
  },
  darkSection: {
    backgroundColor: colors.ink,
  },
  parchmentSection: {
    backgroundColor: colors.parchment,
  },

  // ── Section header row
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: fontFamily.cormorantBold,
    fontSize: fontSize['3xl'],
    color: colors.ink,
    lineHeight: 34,
  },
  sectionTitleLight: {
    color: '#FFFFFF',
  },
  seeAll: {
    fontFamily: fontFamily.dmSansMedium,
    fontSize: fontSize.sm,
    color: colors.saffron,
  },
  seeAllLight: {
    color: colors.gold,
  },

  // ── Horizontal list
  hList: {
    paddingHorizontal: 20,
    paddingBottom: 4,
  },

  // ── Heritage 2×2 grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 10,
  },

  bottomPad: {
    height: 32,
    backgroundColor: colors.cream,
  },
});
