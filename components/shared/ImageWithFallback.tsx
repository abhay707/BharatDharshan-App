import { useState } from 'react';
import { Image, ImageStyle, StyleProp, View, ViewStyle } from 'react-native';

import { colors } from '../../constants/colors';

interface Props {
  uri: string | null | undefined;
  style?: StyleProp<ImageStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  fallbackSlug?: string;
}

export function ImageWithFallback({ uri, style, containerStyle, fallbackSlug }: Props) {
  const [failed, setFailed] = useState(false);

  const fallback = fallbackSlug
    ? `https://picsum.photos/seed/${fallbackSlug}/800/600`
    : 'https://picsum.photos/seed/bharat/800/600';

  const source = { uri: failed || !uri ? fallback : uri };

  return (
    <View style={containerStyle}>
      <Image
        source={source}
        style={[{ backgroundColor: colors.parchment }, style]}
        onError={() => setFailed(true)}
        resizeMode="cover"
      />
    </View>
  );
}
