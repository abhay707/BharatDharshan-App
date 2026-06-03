import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '../../constants/colors';
import { fontSize } from '../../constants/fonts';

interface Props {
  title: string;
  subtitle?: string;
  filters?: string[];
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
}

export function SectionHeader({ title, subtitle, filters, activeFilter, onFilterChange }: Props) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.textRow}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {filters && filters.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {filters.map((f) => {
            const active = f === activeFilter;
            return (
              <TouchableOpacity
                key={f}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => onFilterChange?.(f)}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.cream,
    borderBottomWidth: 1,
    borderBottomColor: colors.parchment,
    paddingBottom: 0,
  },
  textRow: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: fontSize.xl, fontWeight: '700', color: colors.ink },
  subtitle: { fontSize: fontSize.sm, color: colors.ink + '88', marginTop: 2 },
  filters: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: colors.parchment,
    borderWidth: 1,
    borderColor: colors.parchment,
  },
  chipActive: {
    backgroundColor: colors.saffron + '18',
    borderColor: colors.saffron,
  },
  chipText: { fontSize: fontSize.sm, color: colors.ink + 'AA', fontWeight: '500' },
  chipTextActive: { color: colors.saffron, fontWeight: '700' },
});
