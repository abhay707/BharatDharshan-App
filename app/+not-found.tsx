import { Link, Stack } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../constants/colors';
import { fontSize } from '../constants/fonts';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Page not found</Text>
        <Text style={styles.body}>This screen doesn't exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to Home</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cream,
    padding: 24,
  },
  title: { fontSize: fontSize['2xl'], fontWeight: '700', color: colors.ink, marginBottom: 8 },
  body: { fontSize: fontSize.base, color: colors.ink + '88', marginBottom: 24 },
  link: { paddingVertical: 12, paddingHorizontal: 24 },
  linkText: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.saffron,
  },
});
