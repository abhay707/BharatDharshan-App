import { useEffect } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../constants/colors';
import { fontFamily } from '../../constants/fonts';

// ─── Tab configuration ────────────────────────────────────────────────────────
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface TabConfig {
  name: string;
  label: string;
  iconOutline: IoniconName;
  iconFilled: IoniconName;
}

const TAB_CONFIG: TabConfig[] = [
  {
    name: 'index',
    label: 'HOME',
    iconOutline: 'home-outline',
    iconFilled: 'home',
  },
  {
    name: 'states',
    label: 'STATES',
    iconOutline: 'map-outline',
    iconFilled: 'map',
  },
  {
    name: 'heritage',
    label: 'HERITAGE',
    iconOutline: 'business-outline',
    iconFilled: 'business',
  },
  {
    name: 'festivals',
    label: 'FESTIVALS',
    iconOutline: 'sparkles-outline',
    iconFilled: 'sparkles',
  },
  {
    name: 'cuisine',
    label: 'CUISINE',
    iconOutline: 'restaurant-outline',
    iconFilled: 'restaurant',
  },
];

const ACTIVE_COLOR = colors.saffron;
const INACTIVE_COLOR = 'rgba(245,237,216,0.40)';
const TAB_BAR_HEIGHT = 64;

// ─── Animated single tab ──────────────────────────────────────────────────────
interface TabItemProps {
  config: TabConfig;
  active: boolean;
  onPress: () => void;
}

function TabItem({ config, active, onPress }: TabItemProps) {
  const scale = useSharedValue(active ? 1.12 : 1.0);

  useEffect(() => {
    scale.value = withSpring(active ? 1.12 : 1.0, {
      damping: 16,
      stiffness: 240,
      mass: 0.8,
    });
  }, [active]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconColor = active ? ACTIVE_COLOR : INACTIVE_COLOR;
  const labelColor = active ? ACTIVE_COLOR : INACTIVE_COLOR;

  return (
    <TouchableOpacity
      style={s.tabItem}
      onPress={onPress}
      activeOpacity={0.75}
      hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
    >
      <Animated.View style={[s.iconWrap, animStyle]}>
        <Ionicons
          name={active ? config.iconFilled : config.iconOutline}
          size={22}
          color={iconColor}
        />
        {/* Active indicator dot directly below icon */}
        <View style={[s.dot, { opacity: active ? 1 : 0 }]} />
      </Animated.View>
      <Text style={[s.tabLabel, { color: labelColor }]}>{config.label}</Text>
    </TouchableOpacity>
  );
}

// ─── Custom tab bar ───────────────────────────────────────────────────────────
interface TabBarProps {
  state: {
    routes: Array<{ key: string; name: string }>;
    index: number;
  };
  navigation: {
    emit: (event: {
      type: string;
      target: string;
      canPreventDefault: boolean;
    }) => { defaultPrevented: boolean };
    navigate: (name: string) => void;
  };
}

function CustomTabBar({ state, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 8);

  return (
    <View style={[s.container, { paddingBottom: bottomPad }]}>
      {/* Frosted glass background — BlurView on iOS/Android */}
      {Platform.OS !== 'web' ? (
        <BlurView
          intensity={22}
          tint="dark"
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      {/* Dark overlay to ensure contrast on all platforms */}
      <View style={[StyleSheet.absoluteFill, s.overlay]} />
      {/* Top border line */}
      <View style={s.topBorder} />

      {/* Tab buttons */}
      <View style={s.row}>
        {state.routes.map((route, idx) => {
          const config =
            TAB_CONFIG.find((t) => t.name === route.name) ?? TAB_CONFIG[idx];
          if (!config) return null;

          const active = state.index === idx;

          return (
            <TabItem
              key={route.key}
              config={config}
              active={active}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!active && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              }}
            />
          );
        })}
      </View>
    </View>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────
export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props: any) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    />
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  // Tab bar container — sits at the very bottom of the screen
  container: {
    overflow: 'hidden',
    // backgroundColor fallback for platforms where BlurView is unavailable
    backgroundColor: 'rgba(13,5,0,0.97)',
  },
  overlay: {
    // Additional darkening on top of the blur
    backgroundColor: 'rgba(13,5,0,0.72)',
  },
  topBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(201,144,26,0.3)', // subtle gold line
  },
  row: {
    flexDirection: 'row',
    height: TAB_BAR_HEIGHT,
    alignItems: 'center',
  },

  // Individual tab
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 2,
  },
  iconWrap: {
    alignItems: 'center',
    gap: 3,
  },

  // Active indicator dot
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ACTIVE_COLOR,
  },

  // Tab label
  tabLabel: {
    fontFamily: fontFamily.dmSansMedium,
    fontSize: 9,
    letterSpacing: 1.2,
    lineHeight: 11,
  },
});
