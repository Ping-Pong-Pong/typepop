/* TypePop Pals — art direction tokens (cozy storybook).
 * Warm cream walls, terracotta + sage accents, honey highlights.
 * No pure primaries, no neon. Rounded everything.
 */
import { ViewStyle } from 'react-native';

export const palette = {
  cream: '#FFF8EC', // light text on dark, warm base
  card: '#FFFDF7', // cards, bubbles, sheets
  ink: '#4A3B2E', // primary text (warm espresso)
  inkSoft: '#93816C', // secondary text
  line: '#EDDFC9', // hairlines, borders
  terracotta: '#D9794B', // primary accent
  terracottaDeep: '#B85C33',
  sage: '#8FA98F', // secondary accent
  honey: '#E9B44C', // highlights, bond, sparks
  night: '#33406B', // night-mode accents
  shade: 'rgba(46,36,24,0.35)', // scrim base
} as const;

export const font = {
  regular: 'Nunito_400Regular',
  medium: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  black: 'Nunito_800ExtraBold',
} as const;

export const radius = {
  pill: 999,
  card: 22,
  bubble: 18,
  chip: 16,
} as const;

const SHADOW_COLOR = '#4A3B2E';
export const shadow = {
  soft: {
    shadowColor: SHADOW_COLOR,
    shadowOpacity: 0.14,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 5,
  } as ViewStyle,
  lift: {
    shadowColor: SHADOW_COLOR,
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 9 },
    elevation: 9,
  } as ViewStyle,
};
