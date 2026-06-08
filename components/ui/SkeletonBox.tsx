import { useEffect, useRef } from 'react';
import { Animated, DimensionValue, StyleProp, ViewStyle } from 'react-native';

interface SkeletonBoxProps {
  // Old prop names kept for backward compat with existing callers
  w?: DimensionValue;
  h?: number;
  radius?: number;
  // New prop names (also accepted)
  width?: DimensionValue;
  height?: DimensionValue;
  style?: StyleProp<ViewStyle>;
}

export function SkeletonBox({
  w,
  h = 20,
  radius = 4,
  width,
  height,
  style,
}: SkeletonBoxProps) {
  const finalWidth = width ?? w ?? '100%';
  const finalHeight = height ?? h;

  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width: finalWidth,
          height: finalHeight,
          backgroundColor: 'rgba(201,144,26,0.2)',
          borderRadius: radius,
          opacity,
        },
        style,
      ]}
    />
  );
}

export default SkeletonBox;
