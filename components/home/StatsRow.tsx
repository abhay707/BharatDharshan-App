import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';
import { fontSize } from '../../constants/fonts';

interface Stats {
  states: number;
  monuments: number;
  festivals: number;
  foods: number;
}

interface Props {
  stats: Stats;
}

const ITEMS = [
  { key: 'states', label: 'States' },
  { key: 'monuments', label: 'Monuments' },
  { key: 'festivals', label: 'Festivals' },
  { key: 'foods', label: 'Dishes' },
] as const;

export function StatsRow({ stats }: Props) {
  return (
    <View style={styles.row}>
      {ITEMS.map(({ key, label }, i) => (
        <View key={key} style={[styles.item, i < ITEMS.length - 1 && styles.itemBorder]}>
          <Text style={styles.value}>{stats[key]}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: colors.parchment,
    borderRadius: 14,
    paddingVertical: 14,
  },
  item: { flex: 1, alignItems: 'center' },
  itemBorder: {
    borderRightWidth: 1,
    borderRightColor: colors.ink + '15',
  },
  value: {
    fontSize: fontSize.xl,
    fontWeight: '800',
    color: colors.saffron,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.ink + '88',
    marginTop: 2,
    fontWeight: '500',
  },
});
