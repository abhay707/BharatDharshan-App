import { Platform, TextStyle } from 'react-native';

// System font fallbacks used while/if custom fonts are unavailable.
// When @expo-google-fonts are loaded (see app/_layout.tsx), prefer
// fontFamily values from constants/fonts.ts instead.
const serifFamily = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });
const sansFamily = Platform.select({ ios: 'System', android: 'sans-serif', default: 'sans-serif' });

export const typography: Record<string, TextStyle> = {
  heroTitle: {
    fontFamily: serifFamily,
    fontSize: 64,
    fontWeight: '700',
    fontStyle: 'italic',
    color: '#FFFFFF',
    lineHeight: 68,
  },
  displayTitle: {
    fontFamily: serifFamily,
    fontSize: 40,
    fontWeight: '600',
    color: '#1A0A00',
    lineHeight: 44,
  },
  sectionLabel: {
    fontFamily: sansFamily,
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    color: '#C9901A',
  },
  body: {
    fontFamily: sansFamily,
    fontSize: 15,
    fontWeight: '300',
    color: 'rgba(13,5,0,0.82)',
    lineHeight: 24,
  },
  cardTitle: {
    fontFamily: serifFamily,
    fontSize: 20,
    fontWeight: '600',
    color: '#1A0A00',
  },
  caption: {
    fontFamily: sansFamily,
    fontSize: 12,
    fontWeight: '400',
    color: 'rgba(13,5,0,0.55)',
    lineHeight: 18,
  },
  tabLabel: {
    fontFamily: sansFamily,
    fontSize: 9,
    fontWeight: '500',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
};
