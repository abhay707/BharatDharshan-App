import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';

import { ImageWithFallback } from '../../components/shared/ImageWithFallback';
import { Badge } from '../../components/ui/Badge';
import { LoadingState } from '../../components/ui/LoadingState';
import { ErrorState } from '../../components/ui/ErrorState';
import { api, endpoints } from '../../lib/api';
import { colors } from '../../constants/colors';
import { fontSize } from '../../constants/fonts';

export default function DishDetailScreen() {
  const { 'dish-slug': slug } = useLocalSearchParams<{ 'dish-slug': string }>();
  const navigation = useNavigation();

  // Cuisine detail reuses the list endpoint filtered by state—
  // individual dish detail is served by the cuisine list for now.
  const { data: listData, isLoading, isError, refetch } = useQuery({
    queryKey: ['dish', slug],
    queryFn: () => api.get(endpoints.cuisine, { params: { per_page: 100 } }) as Promise<any>,
    enabled: !!slug,
  });

  const dish = listData?.data?.find((d: any) => d.slug === slug);

  useEffect(() => {
    if (dish?.name) navigation.setOptions({ title: dish.name });
  }, [dish?.name]);

  if (isLoading) return <LoadingState />;
  if (isError) return <ErrorState onRetry={refetch} />;
  if (!dish) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ImageWithFallback uri={dish.cover_image_url} style={styles.hero} />

      <View style={styles.header}>
        <View style={styles.badges}>
          <Badge text={dish.meal_type} color={colors.gold} />
          <Badge
            text={dish.is_vegetarian ? 'Vegetarian' : 'Non-Veg'}
            color={dish.is_vegetarian ? '#2D6A4F' : '#8B1A1A'}
          />
          {dish.state && <Badge text={dish.state} color={colors.saffron} />}
        </View>
        <Text style={styles.name}>{dish.name}</Text>
      </View>

      {dish.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.body}>{dish.description}</Text>
        </View>
      )}

      {dish.ingredients && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          <Text style={styles.body}>{dish.ingredients}</Text>
        </View>
      )}

      <View style={styles.bottomPad} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.cream },
  content: { paddingBottom: 40 },
  hero: { width: '100%', height: 260 },
  header: { padding: 20, gap: 8 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  name: { fontSize: fontSize['3xl'], fontWeight: '700', color: colors.ink },
  section: { paddingHorizontal: 20, paddingTop: 20 },
  sectionTitle: { fontSize: fontSize.lg, fontWeight: '700', color: colors.ink, marginBottom: 8 },
  body: { fontSize: fontSize.base, lineHeight: 24, color: colors.ink + 'CC' },
  bottomPad: { height: 32 },
});
