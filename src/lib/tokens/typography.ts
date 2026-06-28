/**
 * Roame typography scale. Premium UI font (Inter / Geist), with a deliberate
 * scale from Display down to Label. Sizes in rem for web; the mobile config
 * (later milestone) consumes the same numeric ramp.
 */

export const fontFamily = {
  sans: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Helvetica Neue',
    'Arial',
    'sans-serif',
  ],
  mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
} as const;

/** name → [fontSize, { lineHeight, letterSpacing, fontWeight }] */
export const typeScale = {
  display: ['3rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
  h1: ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.02em', fontWeight: '700' }],
  h2: ['1.875rem', { lineHeight: '1.2', letterSpacing: '-0.015em', fontWeight: '600' }],
  h3: ['1.5rem', { lineHeight: '1.25', letterSpacing: '-0.01em', fontWeight: '600' }],
  title: ['1.25rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
  body: ['1rem', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],
  caption: ['0.875rem', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '400' }],
  label: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.01em', fontWeight: '500' }],
} as const;

export type TypeScaleName = keyof typeof typeScale;
