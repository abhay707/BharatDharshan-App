import { useEffect, useRef } from 'react';
import { Animated, DimensionValue, StyleSheet, View } from 'react-native';

// ─── Single shimmer bar ───────────────────────────────────────────────────────
function Bar({ w = '100%' as DimensionValue, h = 16, radius = 8, mt = 0 }) {
  const opacity = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.65, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.25, duration: 800, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        { width: w, height: h, borderRadius: radius, marginTop: mt, opacity },
        s.box,
      ]}
    />
  );
}

// ─── Full-screen skeleton matching Home layout ────────────────────────────────
export function LoadingState() {
  return (
    <View style={s.screen}>
      {/* Hero skeleton */}
      <View style={s.hero}>
        <Bar w="55%" h={14} radius={20} />
        <Bar w="82%" h={50} radius={8} mt={14} />
        <Bar w="68%" h={34} radius={8} mt={10} />
        <Bar w="50%" h={26} radius={8} mt={10} />
        <Bar w={60} h={2} radius={2} mt={18} />
        <Bar w="88%" h={14} radius={8} mt={16} />
        <View style={s.statsRow}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={s.statItem}>
              <Bar w="55%" h={22} radius={4} />
              <Bar w="75%" h={10} radius={4} mt={6} />
            </View>
          ))}
        </View>
      </View>

      {/* Cards skeleton */}
      <View style={s.section}>
        <View style={s.sectionHead}>
          <Bar w="42%" h={26} radius={6} />
          <Bar w={58} h={14} radius={6} />
        </View>
        <View style={s.cardRow}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={s.card}>
              <Bar w="100%" h={120} radius={12} />
              <Bar w="72%" h={14} radius={6} mt={10} />
              <Bar w="52%" h={12} radius={6} mt={6} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FAF6EE' },
  box: { backgroundColor: '#C8BBAA' },
  hero: {
    backgroundColor: '#180A02',
    paddingHorizontal: 28,
    paddingTop: 60,
    paddingBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 22,
    borderTopWidth: 1,
    borderTopColor: 'rgba(201,144,26,0.15)',
    paddingTop: 18,
  },
  statItem: { flex: 1, alignItems: 'center', gap: 4 },
  section: { padding: 20 },
  sectionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  cardRow: { flexDirection: 'row', gap: 10 },
  card: { flex: 1 },
});
