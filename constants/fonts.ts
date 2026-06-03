// Family names match the keys passed to useFonts() in app/_layout.tsx
export const fontFamily = {
  cormorant: 'CormorantGaramond_400Regular',
  cormorantItalic: 'CormorantGaramond_400Regular_Italic',
  cormorantSemiBold: 'CormorantGaramond_600SemiBold',
  cormorantSemiBoldItalic: 'CormorantGaramond_600SemiBold_Italic',
  cormorantBold: 'CormorantGaramond_700Bold',
  cormorantBoldItalic: 'CormorantGaramond_700Bold_Italic',
  dmSansLight: 'DMSans_300Light',
  dmSans: 'DMSans_400Regular',
  dmSansMedium: 'DMSans_500Medium',
  dmSansBold: 'DMSans_700Bold',
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
  '6xl': 64,
} as const;

export const lineHeight = {
  tight: 1.2,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
} as const;
