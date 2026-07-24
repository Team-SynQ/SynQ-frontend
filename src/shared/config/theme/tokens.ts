const primary = {
  100: '#ebf6ff',
  200: '#cae8ff',
  300: '#9ed5ff',
  400: '#57b6ff',
  500: '#0090ff',
  600: '#1975de',
  700: '#1458b7',
  800: '#003a7d',
  900: '#103167',
} as const

const gray = {
  100: '#fcfcfc',
  200: '#f6f6f8',
  300: '#dbdbdd',
  400: '#c2c2c2',
  500: '#9e9e9e',
  600: '#767676',
  700: '#424242',
  800: '#242424',
  900: '#1a1a1a',
} as const

const semantic = {
  error: '#d82d2d',
  success: '#2dd852',
} as const

const overlay = {
  dark02: 'rgb(26 26 26 / 0.02)',
  dark08: 'rgb(26 26 26 / 0.08)',
  dark60: 'rgb(26 26 26 / 0.6)',
} as const

export const colors = {
  primary,
  gray,
  semantic,
  overlay,
  role: {
    fg: {
      primary: gray[900],
      secondary: gray[600],
      inverse: '#ffffff',
    },
    surface: {
      default: gray[100],
      muted: gray[200],
      elevated: '#ffffff',
    },
    line: {
      default: gray[300],
      strong: gray[400],
    },
    brand: {
      primary: primary[500],
      primaryHover: primary[600],
      primaryActive: primary[700],
    },
  },
} as const

export const spacing = {
  xs: '8px',
  s: '16px',
  m: '24px',
  l: '32px',
  xl: '60px',
} as const

export const stroke = {
  md: '1px',
  lg: '2px',
} as const

export const radius = {
  xs: '4px',
  s: '8px',
  m: '12px',
  l: '20px',
  full: '9999px',
} as const

export const shadow = {
  panel: '12px 0 16px rgb(0 0 0 / 0.02)',
  floating: '0 4px 24px rgb(0 0 0 / 0.08)',
  toast: '8px 8px 24px rgb(0 0 0 / 0.08)',
  aiChatFloating: '0 0 12.5px rgb(0 0 0 / 0.15)',
  aiChatLauncher: '0 0 25px rgb(0 0 0 / 0.15)',
} as const

const fontFamily = {
  sans: "'Pretendard', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  pretendard: "'Pretendard', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
} as const

const fontWeight = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const

export const typography = {
  fontFamily,
  fontWeight,
  textStyles: {
    heading: {
      fontFamily: 'Pretendard',
      fontSize: '28px',
      fontWeight: fontWeight.bold,
      lineHeight: '1.4',
      letterSpacing: '0',
    },
    title01: {
      fontFamily: 'Pretendard',
      fontSize: '24px',
      fontWeight: fontWeight.semibold,
      lineHeight: '1.4',
      letterSpacing: '0',
    },
    title02: {
      fontFamily: 'Pretendard',
      fontSize: '20px',
      fontWeight: fontWeight.semibold,
      lineHeight: '1.4',
      letterSpacing: '0',
    },
    body01: {
      fontFamily: 'Pretendard',
      fontSize: '16px',
      fontWeight: fontWeight.medium,
      lineHeight: '1.5',
      letterSpacing: '0',
    },
    body02: {
      fontFamily: 'Pretendard',
      fontSize: '14px',
      fontWeight: fontWeight.medium,
      lineHeight: '1.5',
      letterSpacing: '0',
    },
    caption: {
      fontFamily: 'Pretendard',
      fontSize: '13px',
      fontWeight: fontWeight.medium,
      lineHeight: '1.5',
      letterSpacing: '0',
    },
    transcriptionBody01: {
      fontFamily: 'Pretendard',
      fontSize: '16px',
      fontWeight: fontWeight.regular,
      lineHeight: '1.6',
      letterSpacing: '0',
    },
    transcriptionBody02: {
      fontFamily: 'Pretendard',
      fontSize: '14px',
      fontWeight: fontWeight.regular,
      lineHeight: '1.6',
      letterSpacing: '0',
    },
  },
} as const

export const theme = {
  colors,
  spacing,
  stroke,
  radius,
  shadow,
  typography,
} as const

export type ColorTokens = typeof colors
export type SpacingTokens = typeof spacing
export type StrokeTokens = typeof stroke
export type RadiusTokens = typeof radius
export type ShadowTokens = typeof shadow
export type TypographyTokens = typeof typography
export type Theme = typeof theme
