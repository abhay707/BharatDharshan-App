import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { ImageWithFallback } from '../shared/ImageWithFallback';
import { colors } from '../../constants/colors';
import { fontFamily, fontSize } from '../../constants/fonts';

interface StateItem {
  id: number;
  name: string;
  slug: string;
  region: string;
  capital: string;
  cover_image_url: string;
  monuments_count?: number;
  festivals_count?: number;
}

interface Props {
  item: StateItem;
}

export function HomeStateCard({ item }: Props) {
  const regionColor =
    colors.region[item.region as keyof typeof colors.region] ?? colors.saffron;
  const initial = item.name.charAt(0).toUpperCase();

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/states/${item.slug}`)}
      activeOpacity={0.88}
    >
      {/* ── Top: image + region-tinted gradient + faded initial ── */}
      <View style={styles.top}>
        <ImageWithFallback
          uri={item.cover_image_url}
          style={StyleSheet.absoluteFill as any}
          fallbackSlug={item.slug}
        />
        {/* Region-colour gradient overlay */}
        <LinearGradient
          colors={[regionColor + 'BB', regionColor + '44']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill as any}
        />
        {/* Darkening gradient toward bottom so text is readable */}
        <LinearGradient
          colors={['transparent', 'rgba(13,5,0,0.55)']}
          style={StyleSheet.absoluteFill as any}
        />
        {/* Faded initial watermark */}
        <Text style={styles.initial}>{initial}</Text>
        {/* Region badge bottom-left */}
        <View style={[styles.regionBadge, { backgroundColor: regionColor + 'DD' }]}>
          <Text style={styles.regionText}>{item.region}</Text>
        </View>
      </View>

      {/* ── Bottom: white content ── */}
      <View style={styles.bottom}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.capital} numberOfLines={1}>{item.capital}</Text>
        {(item.monuments_count !== undefined) && (
          <Text style={styles.meta}>{item.monuments_count} monuments</Text>
        )}
        <View style={styles.exploreBtn}>
          <Text style={styles.exploreTxt}>Explore  →</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 200,
    height: 280,
    borderRadius: 18,
    overflow: 'hidden',
    marginRight: 14,
    backgroundColor: colors.parchment,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  top: {
    flex: 1.6,
    overflow: 'hidden',
  },
  initial: {
    position: 'absolute',
    bottom: -8,
    right: 6,
    fontFamily: fontFamily.cormorantBold,
    fontSize: 100,
    color: 'rgba(255,255,255,0.18)',
    lineHeight: 100,
  },
  regionBadge: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  regionText: {
    fontFamily: fontFamily.dmSans,
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 0.8,
  },
  bottom: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    gap: 3,
  },
  name: {
    fontFamily: fontFamily.cormorantBold,
    fontSize: 20,
    color: colors.ink,
    lineHeight: 22,
  },
  capital: {
    fontFamily: fontFamily.dmSans,
    fontSize: 12,
    color: colors.ink + '88',
  },
  meta: {
    fontFamily: fontFamily.dmSans,
    fontSize: 11,
    color: colors.saffron,
    fontWeight: '600',
  },
  exploreBtn: {
    marginTop: 6,
    alignSelf: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: colors.saffron,
    paddingBottom: 1,
  },
  exploreTxt: {
    fontFamily: fontFamily.dmSansMedium,
    fontSize: 12,
    color: colors.saffron,
    letterSpacing: 0.3,
  },
});
