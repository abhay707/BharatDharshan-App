import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ImageWithFallback } from '../shared/ImageWithFallback';
import { colors } from '../../constants/colors';
import { fontFamily, fontSize } from '../../constants/fonts';

interface MonumentItem {
  id: number;
  name: string;
  slug: string;
  state?: string;
  type: string;
  category?: string;
  cover_image_url: string;
}

interface Props {
  item: MonumentItem;
}

export function HomeMonumentCard({ item }: Props) {
  const typeColor =
    colors.monument[item.type as keyof typeof colors.monument] ?? colors.gold;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/heritage/${item.slug}`)}
      activeOpacity={0.86}
    >
      {/* Full-bleed image */}
      <ImageWithFallback
        uri={item.cover_image_url}
        style={StyleSheet.absoluteFill as any}
        fallbackSlug={item.slug}
      />

      {/* Gradient scrim: transparent at top, dark+type-colour at bottom */}
      <LinearGradient
        colors={['rgba(13,5,0,0.05)', typeColor + 'EE']}
        start={{ x: 0, y: 0.3 }}
        end={{ x: 0, y: 1 }}
        style={[StyleSheet.absoluteFill as any, styles.gradient]}
      >
        <View style={styles.content}>
          {/* Category badge */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.category ?? item.type}</Text>
          </View>
          <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
          {item.state && (
            <Text style={styles.state} numberOfLines={1}>{item.state}</Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    height: 180,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.ink,
  },
  gradient: {
    justifyContent: 'flex-end',
  },
  content: {
    padding: 12,
    gap: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
    marginBottom: 4,
  },
  badgeText: {
    fontFamily: fontFamily.dmSans,
    fontSize: fontSize.xs,
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  name: {
    fontFamily: fontFamily.cormorantBold,
    fontSize: 18,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  state: {
    fontFamily: fontFamily.dmSans,
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
  },
});
