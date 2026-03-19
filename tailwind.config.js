/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#6366F1',
          dark: '#818CF8',
        },
        background: {
          light: '#FFFFFF',
          dark: '#0F172A',
        },
        surface: {
          light: '#F8FAFC',
          dark: '#1E293B',
        },
        income: {
          light: '#10B981',
          dark: '#34D399',
        },
        expense: {
          light: '#EF4444',
          dark: '#F87171',
        },
        muted: {
          light: '#64748B',
          dark: '#94A3B8',
        },
      },
    },
  },
  plugins: [],
};