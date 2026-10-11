/* Expo Router route: the companion pal screen.
 * Supports a `?type=` query param (web deep-link), e.g. /typepop/?type=intj
 * loads that companion directly. Invalid values are ignored.
 */
import { useLocalSearchParams } from 'expo-router';
import CompanionScreen from '../src/screens/CompanionScreen';

export default function PalRoute() {
  const { type } = useLocalSearchParams<{ type?: string | string[] }>();
  const initialType = Array.isArray(type) ? type[0] : type;
  return <CompanionScreen initialType={initialType} />;
}
