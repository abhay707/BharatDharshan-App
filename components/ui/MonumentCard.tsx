import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ImageWithFallback } from '../shared/ImageWithFallback';
import { Badge } from './Badge';
import { colors } from '../../constants/colors';
import { fontSize } from '../../constants/fonts';

interface MonumentItem {
  id: number;
  name: string;
  slug: string;
  state?: string;
  type: string;
  category?: string;
  short_description?: string;
  best_time_to_visit?: string;
  is_featured?: boolean;
  cover_image_url: string;
}

interface Props {
  item: MonumentItem;
}

export function MonumentCard({ item }: Props) {
  const typeColor =
    colors.monument[item.type as keyof typeof colors.monument] ?? colors.gold;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/heritage/${item.slug}`)}
      activeOpacity={0.88}
    >
      <ImageWithFallback uri={item.cover_image_url} style={styles.image} fallbackSlug={item.slug} />
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Badge text={item.type} color={typeColor} />
          {item.is_featured && <Badge text="Featured" color={colors.gold} />}
        </View>
        <Text style={styles.name}>{item.name}</Text>
        {item.state && <Text style={styles.state}>{item.state}</Text>}
        {item.short_description && (
          <Text style={styles.desc} numberOfLines={2}>
            {item.short_description}
          </Text>
        )}
        {item.best_time_to_visit && (
          <Text style={styles.meta}>Best time: {item.best_time_to_visit}</Text>
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
  image: { width: '100%', height: 200 },
  content: { padding: 14, gap: 6 },
  topRow: { flexDirection: 'row', gap: 8 },
  name: { fontSize: fontSize.lg, fontWeight: '700', color: colors.ink },
  state: { fontSize: fontSize.sm, color: colors.saffron, fontWeight: '500' },
  desc: { fontSize: fontSize.sm, color: colors.ink + 'AA', lineHeight: 20 },
  meta: { fontSize: fontSize.xs, color: colors.gold, fontWeight: '600' },
});
