/**
 * Roame color tokens.
 *
 * Premium, restrained palette: white / off-white / neutral grays / charcoal,
 * with emerald (primary brand accent) and blue (secondary/info) accents.
 * Orange = warnings only. Red = destructive only. Green = success only.
 * NO purple, NO neon gradients — per the Roame design guidelines.
 *
 * These are platform-neutral hex values consumed by the web Tailwind preset
 * and (later) the mobile NativeWind config, so both surfaces share one language.
 */

export const palette = {
  white: '#FFFFFF',
  offwhite: '#FAFAFA',
  black: '#111111',

  // Neutral gray ramp (slate-tinted, calm)
  neutral: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
    950: '#0C0C0E',
  },

  // Primary brand — emerald
  emerald: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  // Secondary / info — blue
  blue: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Warning — orange (only)
  orange: {
    50: '#FFF7ED',
    100: '#FFEDD5',
    400: '#FB923C',
    500: '#F97316',
    600: '#EA580C',
    700: '#C2410C',
  },

  // Destructive — red (only)
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
  },

  // Success — green (only)
  green: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
  },
} as const;

/**
 * Semantic tokens expressed as HSL channel strings ("H S% L%") so they can be
 * dropped into CSS variables and referenced by Tailwind via hsl(var(--token)).
 * This is what powers light/dark theming in the web design system.
 */
export const semanticLight = {
  background: '0 0% 100%',
  foreground: '240 6% 10%',
  card: '0 0% 100%',
  cardForeground: '240 6% 10%',
  popover: '0 0% 100%',
  popoverForeground: '240 6% 10%',
  primary: '160 84% 39%', // emerald-600
  primaryForeground: '0 0% 100%',
  secondary: '240 5% 96%',
  secondaryForeground: '240 6% 10%',
  muted: '240 5% 96%',
  mutedForeground: '240 4% 46%',
  accent: '217 91% 60%', // blue-500
  accentForeground: '0 0% 100%',
  destructive: '0 72% 51%', // red-600
  destructiveForeground: '0 0% 100%',
  warning: '25 95% 53%', // orange-500
  warningForeground: '0 0% 100%',
  success: '142 71% 45%', // green-500
  successForeground: '0 0% 100%',
  border: '240 6% 90%',
  input: '240 6% 90%',
  ring: '160 84% 39%',
} as const;

export const semanticDark = {
  background: '240 6% 7%',
  foreground: '0 0% 98%',
  card: '240 5% 10%',
  cardForeground: '0 0% 98%',
  popover: '240 5% 10%',
  popoverForeground: '0 0% 98%',
  primary: '158 64% 52%', // emerald-400/500 for contrast on dark
  primaryForeground: '240 6% 7%',
  secondary: '240 4% 16%',
  secondaryForeground: '0 0% 98%',
  muted: '240 4% 16%',
  mutedForeground: '240 5% 65%',
  accent: '213 94% 68%', // blue-400
  accentForeground: '240 6% 7%',
  destructive: '0 72% 51%',
  destructiveForeground: '0 0% 98%',
  warning: '25 95% 53%',
  warningForeground: '240 6% 7%',
  success: '142 71% 45%',
  successForeground: '240 6% 7%',
  border: '240 4% 18%',
  input: '240 4% 18%',
  ring: '158 64% 52%',
} as const;

export type SemanticTokens = typeof semanticLight;
