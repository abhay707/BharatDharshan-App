import { router } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { colors } from '../../constants/colors';
import { fontFamily, fontSize } from '../../constants/fonts';

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
}

interface Props {
  item: FestivalItem;
}

export function HomeFestivalCard({ item }: Props) {
  const religionColor =
    colors.religion[item.religion as keyof typeof colors.religion] ?? colors.gold;

  const location = item.is_national ? 'Pan India' : (item.state ?? '');

  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: religionColor }]}
      onPress={() => router.push(`/festivals/${item.slug}`)}
      activeOpacity={0.88}
    >
      {/* Religion colour accent dot */}
      <View style={[styles.dot, { backgroundColor: religionColor }]} />

      <View style={styles.body}>
        <Text style={styles.month}>{item.month_name}</Text>
        <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
        {location ? (
          <Text style={styles.location} numberOfLines={1}>{location}</Text>
        ) : null}
        {item.duration_days ? (
          <Text style={styles.duration}>{item.duration_days} days</Text>
        ) : null}
      </View>

      {/* Religion label pill */}
      <View style={[styles.religionPill, { backgroundColor: religionColor + '22', borderColor: religionColor + '55' }]}>
        <Text style={[styles.religionText, { color: religionColor }]}>{item.religion}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderLeftWidth: 4,
    marginRight: 12,
    padding: 16,
    paddingLeft: 14,
    justifyContent: 'space-between',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  body: {
    flex: 1,
    gap: 3,
  },
  month: {
    fontFamily: fontFamily.dmSans,
    fontSize: 10,
    color: colors.ink + '66',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  name: {
    fontFamily: fontFamily.cormorantBold,
    fontSize: 22,
    color: colors.ink,
    lineHeight: 24,
  },
  location: {
    fontFamily: fontFamily.dmSans,
    fontSize: 12,
    color: colors.saffron,
    fontWeight: '500',
    marginTop: 2,
  },
  duration: {
    fontFamily: fontFamily.dmSans,
    fontSize: 11,
    color: colors.ink + '66',
  },
  religionPill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 3,
    marginTop: 10,
  },
  religionText: {
    fontFamily: fontFamily.dmSans,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
