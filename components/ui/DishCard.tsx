import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ImageWithFallback } from '../shared/ImageWithFallback';
import { colors } from '../../constants/colors';
import { fontSize } from '../../constants/fonts';

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

interface Props {
  item: DishItem;
}

export function DishCard({ item }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/cuisine/${item.slug}`)}
      activeOpacity={0.88}
    >
      <ImageWithFallback uri={item.cover_image_url} style={styles.image} fallbackSlug={item.slug} />
      <View style={styles.dot}>
        <View
          style={[
            styles.vegDot,
            { backgroundColor: item.is_vegetarian ? '#2D6A4F' : '#8B1A1A' },
          ]}
        />
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        {item.state && <Text style={styles.state} numberOfLines={1}>{item.state}</Text>}
        <Text style={styles.meal}>{item.meal_type}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: colors.parchment,
    marginBottom: 8,
    elevation: 2,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },
  image: { width: '100%', height: 130 },
  dot: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 3,
  },
  vegDot: { width: 10, height: 10, borderRadius: 5 },
  content: { padding: 10, gap: 2 },
  name: { fontSize: fontSize.sm, fontWeight: '700', color: colors.ink },
  state: { fontSize: fontSize.xs, color: colors.saffron, fontWeight: '500' },
  meal: { fontSize: fontSize.xs, color: colors.ink + '88' },
});
