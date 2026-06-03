import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../constants/colors';

interface Props {
  message?: string;
}

export function LoadingState({ message = 'Loading…' }: Props) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.saffron} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cream,
    gap: 12,
  },
  text: { fontSize: 14, color: colors.ink + '88' },
});
