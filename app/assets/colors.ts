const colors = {
  primary: {
    50: '#e5f5f3',
    100: '#bde6e1',
    200: '#94d6cf',
    300: '#6ac6bc',
    400: '#40b6a9',
    500: '#10857b',
    600: '#0e6e65',
    700: '#0b5750',
    800: '#093f3a',
    900: '#062825',
    get DEFAULT() {
      return this[500];
    },
  },

  secondary: {
    50: '#f4f5f7',
    100: '#e5e7eb',
    200: '#d2d6dc',
    300: '#9ca3af',
    400: '#6b7281',
    500: '#4b5563',
    600: '#374151',
    700: '#1f2937',
    800: '#111827',
    900: '#0b0f16',
    get DEFAULT() {
      return this[500];
    },
  },

  background: {
    DEFAULT: '#13161d',
    light: '#1c212b',
    dark: '#0b0e13',
  },

  cardBackground: {
    DEFAULT: '#262f3c',
    light: '#2e3947',
    dark: '#1d242e',
  },

  cardBackgroundSecondary: {
    DEFAULT: '#4f627d',
    light: '#5f7494',
    dark: '#3e5065',
  },

  buttonBackground: {
    DEFAULT: '#191c21',
    hover: '#21252c',
    active: '#1d232b',
  },

  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    get DEFAULT() {
      return this[500];
    },
  },

  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',

  red: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    get DEFAULT() {
      return this[500];
    },
  },

  green: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    get DEFAULT() {
      return this[500];
    },
  },

  blue: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    get DEFAULT() {
      return this[500];
    },
  },

  yellow: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
    get DEFAULT() {
      return this[500];
    },
  },

  // other accent colors
  orange: '#f97316',
  purple: '#8b5cf6',
  pink: '#ec4899',
  brown: '#a16207',
  cyan: '#06b6d4',
  magenta: '#d946ef',
  lime: '#84cc16',
  teal: '#14b8a6',
  navy: '#1e3a8a',
  maroon: '#7f1d1d',
  olive: '#78716c',
  silver: '#c0c0c0',
  gold: '#facc15',
};

export default colors;
