/** FitTrack Progress UI tokens for the dark appearance. */
const darkColors = {
  background: '#051424',
  surface: '#051424',
  surfaceContainerLowest: '#010f1f',
  surfaceContainerLow: '#0d1c2d',
  surfaceContainer: '#122131',
  surfaceContainerHigh: '#1c2b3c',
  surfaceContainerHighest: '#273647',
  surfaceVariant: '#273647',
  onBackground: '#d4e4fa',
  onSurface: '#d4e4fa',
  onSurfaceVariant: '#c3c9b2',
  outline: '#8d937e',
  outlineVariant: '#434938',
  primaryContainer: '#bef264',
  onPrimaryContainer: '#131f00',
  primaryContainerMuted: 'rgba(190, 242, 100, 0.1)',
  primaryContainerBorder: 'rgba(190, 242, 100, 0.2)',
  secondaryContainer: '#3c4a5e',
  onSecondaryContainer: '#abb9d2',
  glassFill: 'rgba(51, 65, 85, 0.4)',
  glassFillActive: 'rgba(51, 65, 85, 0.6)',
  glassBorder: 'rgba(51, 65, 85, 0.2)',
  glassBorderHighlight: 'rgba(255, 255, 255, 0.1)',
  fabGlow: 'rgba(190, 242, 100, 0.3)',
  error: '#ffb4ab',
  deleteButton: '#93000a',
  barBackground: '#051424',
  tabBarBackground: '#0d1c2d',
} as const;

/** Companion palette that keeps the same brand accent in a readable light UI. */
const lightColors = {
  background: '#F5F7F2',
  surface: '#FFFFFF',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerLow: '#F0F3EC',
  surfaceContainer: '#E9EEE4',
  surfaceContainerHigh: '#E1E8DA',
  surfaceContainerHighest: '#D6DFCE',
  surfaceVariant: '#E1E8DA',
  onBackground: '#17231A',
  onSurface: '#17231A',
  onSurfaceVariant: '#596650',
  outline: '#7C8875',
  outlineVariant: '#CCD6C5',
  primaryContainer: '#416B17',
  onPrimaryContainer: '#FFFFFF',
  primaryContainerMuted: 'rgba(65, 107, 23, 0.10)',
  primaryContainerBorder: 'rgba(65, 107, 23, 0.22)',
  secondaryContainer: '#E2E9DC',
  onSecondaryContainer: '#43503D',
  glassFill: 'rgba(255, 255, 255, 0.82)',
  glassFillActive: 'rgba(255, 255, 255, 0.96)',
  glassBorder: 'rgba(33, 53, 29, 0.10)',
  glassBorderHighlight: 'rgba(255, 255, 255, 0.95)',
  fabGlow: 'rgba(65, 107, 23, 0.18)',
  error: '#B42318',
  deleteButton: '#B42318',
  barBackground: '#F5F7F2',
  tabBarBackground: '#FFFFFF',
} as const;

export const FitTrackColors = darkColors;
export const FitTrackPalettes = { dark: darkColors, light: lightColors } as const;
export type FitTrackPalette = (typeof FitTrackPalettes)[keyof typeof FitTrackPalettes];

export const FitTrackRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  fab: 12,
} as const;

export const FitTrackFonts = {
  display: 'Anybody_700Bold',
  displaySemi: 'Anybody_600SemiBold',
  body: 'HankenGrotesk_400Regular',
  bodySemi: 'HankenGrotesk_600SemiBold',
  mono: 'JetBrainsMono_500Medium',
} as const;

export const CategoryColorPalette = [
  '#EF4444',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
  '#F97316',
  '#22C55E',
  '#06B6D4',
] as const;
