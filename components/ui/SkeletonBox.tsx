import { useEffect } from 'react';
import { DimensionValue, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

interface Props {
  w?: DimensionValue;
  h?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export function SkeletonBox({ w = '100%', h = 16, radius = 8, style }: Props) {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.72, { duration: 700 }),
        withTiming(0.3, { duration: 700 }),
      ),
      -1,
    );
  }, []);

  const anim = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        { width: w, height: h, borderRadius: radius, backgroundColor: '#D4C9B6' },
        anim,
        style,
      ]}
    />
  );
}
