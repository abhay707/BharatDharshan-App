import { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fontFamily, fontSize } from '../../constants/fonts';

const { height } = Dimensions.get('window');

const HERO_HEIGHT = height * 0.55;

// ─── Animated wrapper: fade + slide-up on mount ──────────────────────────────
interface AnimatedEntryProps {
  delay: number;
  children: React.ReactNode;
  style?: object;
}

function AnimatedEntry({ delay, children, style }: AnimatedEntryProps) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(22);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 650 }));
    translateY.value = withDelay(delay, withTiming(0, { duration: 650 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return <Animated.View style={[animStyle, style]}>{children}</Animated.View>;
}

// ─── Stat pill ────────────────────────────────────────────────────────────────
function HeroStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Main hero ────────────────────────────────────────────────────────────────
interface HeroSectionProps {
  stats?: { states: number; monuments: number; festivals: number; foods: number };
}

export function HeroSection({ stats }: HeroSectionProps) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={['#0D0500', '#8B1A1A', '#E8580A']}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={[styles.gradient, { height: HERO_HEIGHT }]}
    >
      {/* Content anchored to the bottom of the hero */}
      <View style={[styles.content, { paddingTop: insets.top + 16 }]}>
        {/* ① Heritage pill */}
        <AnimatedEntry delay={0} style={styles.pillWrap}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>✦ CELEBRATING INDIA'S HERITAGE ✦</Text>
          </View>
        </AnimatedEntry>

        {/* ② "Discover" */}
        <AnimatedEntry delay={100}>
          <Text style={styles.discover}>Discover</Text>
        </AnimatedEntry>

        {/* ③ "Incredible" */}
        <AnimatedEntry delay={200}>
          <Text style={styles.incredible}>Incredible</Text>
        </AnimatedEntry>

        {/* ④ "India" */}
        <AnimatedEntry delay={300}>
          <Text style={styles.india}>India</Text>
        </AnimatedEntry>

        {/* ⑤ Gold divider */}
        <AnimatedEntry delay={400} style={styles.dividerWrap}>
          <View style={styles.divider} />
        </AnimatedEntry>

        {/* ⑥ Subtext */}
        <AnimatedEntry delay={500}>
          <Text style={styles.subtext}>
            Explore ancient wisdom, timeless monuments, living traditions
          </Text>
        </AnimatedEntry>

        {/* ⑦ Stats row */}
        <AnimatedEntry delay={600} style={styles.statsWrap}>
          <View style={styles.statsRow}>
            <HeroStat
              value={stats?.states ? String(stats.states) : '28'}
              label="STATES"
            />
            <View style={styles.statDivider} />
            <HeroStat value="3,691" label="MONUMENTS" />
            <View style={styles.statDivider} />
            <HeroStat value="5,000+" label="YEARS" />
          </View>
        </AnimatedEntry>
      </View>
    </LinearGradient>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  gradient: {
    justifyContent: 'flex-end',
  },
  content: {
    paddingHorizontal: 28,
    paddingBottom: 28,
  },

  // Pill
  pillWrap: { marginBottom: 14 },
  pill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#C9901A',
    borderRadius: 100,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
  pillText: {
    fontFamily: fontFamily.dmSans,
    fontSize: 10,
    letterSpacing: 1.8,
    color: '#C9901A',
  },

  // Headline stack
  discover: {
    fontFamily: fontFamily.cormorantSemiBoldItalic,
    fontSize: 48,
    lineHeight: 52,
    color: '#FFFFFF',
  },
  incredible: {
    fontFamily: fontFamily.cormorantBold,
    fontSize: 64,
    lineHeight: 68,
    color: '#C9901A',
  },
  india: {
    fontFamily: fontFamily.cormorantBoldItalic,
    fontSize: 52,
    lineHeight: 56,
    color: '#E8580A',
    marginBottom: 4,
  },

  // Divider
  dividerWrap: { marginVertical: 14 },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: '#C9901A',
    borderRadius: 2,
  },

  // Subtext
  subtext: {
    fontFamily: fontFamily.dmSansLight,
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(245,237,216,0.75)',
    marginBottom: 20,
  },

  // Stats row
  statsWrap: { marginTop: 4 },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(201,144,26,0.3)',
    paddingTop: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statValue: {
    fontFamily: fontFamily.cormorantSemiBold,
    fontSize: 22,
    color: '#C9901A',
    lineHeight: 26,
  },
  statLabel: {
    fontFamily: fontFamily.dmSans,
    fontSize: 9,
    color: '#FFFFFF',
    letterSpacing: 1.4,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(201,144,26,0.35)',
  },
});
