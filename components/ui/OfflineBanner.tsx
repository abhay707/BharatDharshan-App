import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';
import { fontFamily } from '../../constants/fonts';
import { getOfflineState, subscribeOffline } from '../../lib/offlineState';

export function OfflineBanner() {
  const [offline, setOffline] = useState(getOfflineState());
  const insets = useSafeAreaInsets();

  useEffect(() => subscribeOffline(setOffline), []);

  if (!offline) return null;

  return (
    <View style={[s.banner, { paddingTop: insets.top + 6 }]}>
      <Text style={s.text}>📡  Viewing cached content</Text>
    </View>
  );
}

const s = StyleSheet.create({
  banner: {
    backgroundColor: colors.gold,
    paddingBottom: 7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: fontFamily.dmSansMedium,
    fontSize: 12,
    color: colors.ink,
    letterSpacing: 0.3,
  },
});
