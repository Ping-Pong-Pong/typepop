/* Expo Router root layout — entry point (package.json "main": "expo-router/entry").
 * Fonts + splash live here; tabs are Pal and Journey. Screens render their own headers.
 */
import React, { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { Tabs } from 'expo-router';
import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import { palette } from '../src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    if (loaded || error) SplashScreen.hideAsync().catch(() => {});
  }, [loaded, error]);

  if (!loaded && !error) return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: palette.terracottaDeep,
        tabBarInactiveTintColor: palette.inkSoft,
        tabBarStyle: { backgroundColor: palette.card, borderTopColor: palette.line },
        tabBarLabelStyle: { fontFamily: 'Nunito_700Bold', fontSize: 12 },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Pal', tabBarIcon: () => null }} />
      <Tabs.Screen name="journey" options={{ title: 'Journey', tabBarIcon: () => null }} />
    </Tabs>
  );
}
