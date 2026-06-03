import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ImageWithFallback } from '../shared/ImageWithFallback';
import { Badge } from './Badge';
import { colors } from '../../constants/colors';
import { fontSize } from '../../constants/fonts';

interface FestivalItem {
  id: number;
  name: string;
  slug: string;
  religion: string;
  month_name: string;
  duration_days?: number;
  tagline?: string;
  is_national?: boolean;
  state?: string;
  cover_image_url: string;
}

interface Props {
  item: FestivalItem;
}

export function FestivalCard({ item }: Props) {
  const religionColor =
    colors.religion[item.religion as keyof typeof colors.religion] ?? colors.gold;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/festivals/${item.slug}`)}
      activeOpacity={0.88}
    >
      <ImageWithFallback uri={item.cover_image_url} style={styles.image} fallbackSlug={item.slug} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Badge text={item.religion} color={religionColor} />
          <Badge text={item.month_name} color={colors.gold} />
        </View>
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.location}>
          {item.is_national ? 'Pan India' : (item.state ?? '')}
        </Text>
        {item.tagline && (
          <Text style={styles.tagline} numberOfLines={2}>
            {item.tagline}
          </Text>
        )}
        {item.duration_days && (
          <Text style={styles.meta}>{item.duration_days}-day celebration</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 14,
    backgroundColor: colors.parchment,
    elevation: 2,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  image: { width: '100%', height: 180 },
  content: { padding: 14, gap: 6 },
  topRow: { flexDirection: 'row', gap: 8 },
  name: { fontSize: fontSize.lg, fontWeight: '700', color: colors.ink },
  location: { fontSize: fontSize.sm, color: colors.saffron, fontWeight: '500' },
  tagline: { fontSize: fontSize.sm, color: colors.ink + 'AA', lineHeight: 20, fontStyle: 'italic' },
  meta: { fontSize: fontSize.xs, color: colors.gold, fontWeight: '600' },
});
