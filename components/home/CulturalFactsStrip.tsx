import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { fontFamily } from '../../constants/fonts';

const FACTS = [
  { value: '22', label: 'Languages' },
  { value: '40', label: 'UNESCO Sites' },
  { value: '1,600+', label: 'Dialects' },
  { value: '5,000+', label: 'Years' },
] as const;

export function CulturalFactsStrip() {
  return (
    <LinearGradient
      colors={['#E8580A', '#8B1A1A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradient}
    >
      {FACTS.map(({ value, label }, i) => (
        <View key={label} style={[styles.fact, i < FACTS.length - 1 && styles.factBorder]}>
          <Text style={styles.value}>{value}</Text>
          <Text style={styles.label}>{label}</Text>
        </View>
      ))}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flexDirection: 'row',
    paddingVertical: 24,
    paddingHorizontal: 8,
  },
  fact: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  factBorder: {
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.25)',
  },
  value: {
    fontFamily: fontFamily.cormorantSemiBold,
    fontSize: 22,
    color: '#FFFFFF',
    lineHeight: 26,
  },
  label: {
    fontFamily: fontFamily.dmSans,
    fontSize: 10,
    color: 'rgba(255,255,255,0.80)',
    letterSpacing: 0.6,
    textAlign: 'center',
  },
});
