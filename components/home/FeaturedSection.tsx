import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { StateCard } from '../ui/StateCard';
import { MonumentCard } from '../ui/MonumentCard';
import { FestivalCard } from '../ui/FestivalCard';
import { colors } from '../../constants/colors';
import { fontSize } from '../../constants/fonts';

type SectionType = 'state' | 'monument' | 'festival';

interface Props {
  title: string;
  subtitle?: string;
  items: any[];
  type: SectionType;
}

export function FeaturedSection({ title, subtitle, items, type }: Props) {
  if (!items || items.length === 0) return null;

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {items.map((item) => (
          <View key={item.id ?? item.slug} style={styles.cardWrap}>
            {type === 'state' && <StateCard item={item} />}
            {type === 'monument' && <MonumentCard item={item} />}
            {type === 'festival' && <FestivalCard item={item} />}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { marginTop: 24 },
  header: { paddingHorizontal: 16, marginBottom: 12 },
  title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.ink },
  subtitle: { fontSize: fontSize.sm, color: colors.ink + '88', marginTop: 2 },
  scroll: { paddingHorizontal: 16, paddingBottom: 4, gap: 12 },
  cardWrap: { width: 280 },
});
