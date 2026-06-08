import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import {
  CormorantGaramond_400Regular,
  CormorantGaramond_400Regular_Italic,
  CormorantGaramond_600SemiBold,
  CormorantGaramond_600SemiBold_Italic,
  CormorantGaramond_700Bold,
  CormorantGaramond_700Bold_Italic,
} from '@expo-google-fonts/cormorant-garamond';
import {
  DMSans_300Light,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClientProvider } from '@tanstack/react-query';

import { queryClient } from '../lib/queryClient';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    CormorantGaramond_400Regular,
    CormorantGaramond_400Regular_Italic,
    CormorantGaramond_600SemiBold,
    CormorantGaramond_600SemiBold_Italic,
    CormorantGaramond_700Bold,
    CormorantGaramond_700Bold_Italic,
    DMSans_300Light,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#0D0500' },
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="states/[slug]"
          options={{ headerShown: true, title: '', headerBackTitle: 'States' }}
        />
        <Stack.Screen
          name="heritage/[slug]"
          options={{ headerShown: true, title: '', headerBackTitle: 'Heritage' }}
        />
        <Stack.Screen
          name="festivals/[slug]"
          options={{ headerShown: true, title: '', headerBackTitle: 'Festivals' }}
        />
        <Stack.Screen
          name="cuisine/[dish-slug]"
          options={{ headerShown: true, title: '', headerBackTitle: 'Cuisine' }}
        />
        <Stack.Screen name="search" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </QueryClientProvider>
  );
}
