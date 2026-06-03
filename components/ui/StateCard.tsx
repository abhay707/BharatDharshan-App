import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ImageWithFallback } from '../shared/ImageWithFallback';
import { Badge } from './Badge';
import { colors } from '../../constants/colors';
import { fontSize } from '../../constants/fonts';

interface StateItem {
  id: number;
  name: string;
  slug: string;
  region: string;
  capital: string;
  language?: string;
  cover_image_url: string;
  monuments_count?: number;
  festivals_count?: number;
}

interface Props {
  item: StateItem;
}

export function StateCard({ item }: Props) {
  const regionColor =
    colors.region[item.region as keyof typeof colors.region] ?? colors.saffron;

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => router.push(`/states/${item.slug}`)}
      activeOpacity={0.88}
    >
      <ImageWithFallback
        uri={item.cover_image_url}
        style={styles.image}
        fallbackSlug={item.slug}
      />
      <View style={styles.content}>
        <Badge text={item.region} color={regionColor} />
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.capital}>{item.capital}</Text>
        {(item.monuments_count !== undefined || item.festivals_count !== undefined) && (
          <View style={styles.stats}>
            {item.monuments_count !== undefined && (
              <Text style={styles.stat}>{item.monuments_count} monuments</Text>
            )}
            {item.festivals_count !== undefined && (
              <Text style={styles.stat}>{item.festivals_count} festivals</Text>
            )}
          </View>
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
  content: {
    padding: 14,
    gap: 4,
  },
  name: { fontSize: fontSize.xl, fontWeight: '700', color: colors.ink },
  capital: { fontSize: fontSize.sm, color: colors.ink + 'AA' },
  stats: { flexDirection: 'row', gap: 12, marginTop: 4 },
  stat: { fontSize: fontSize.xs, color: colors.saffron, fontWeight: '600' },
});
