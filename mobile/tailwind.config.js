/** @type {import('tailwindcss').Config} */
// Emerald primary, blue accent, neutral ramp — matches the web system.
// No emoji, no gradients.
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#FAFAFA',
        surface: '#FFFFFF',
        foreground: '#111111',
        muted: '#71717A',
        subtle: '#F4F4F5',
        border: '#E4E4E7',
        primary: '#059669',
        'primary-foreground': '#FFFFFF',
        accent: '#2563EB',
        success: '#16A34A',
        destructive: '#DC2626',
      },
      borderRadius: { lg: '16px', xl: '20px', '2xl': '24px' },
    },
  },
  plugins: [],
};
