const primary = {
  100: '#f3fffa',
  200: '#d0ffeb',
  300: '#9cffd6',
  400: '#69ffc0',
  500: '#3aeca2',
  600: '#11d684',
  700: '#13b16f',
  800: '#04854f',
}

const gray = {
  100: '#fcfcfc',
  200: '#f6f6fa',
  300: '#dbdbdd',
  400: '#c2c2c2',
  500: '#9e9e9e',
  600: '#767676',
  700: '#424242',
  800: '#242424',
  900: '#1a1a1a',
}

const fontFamily = [
  'Pretendard',
  'system-ui',
  '-apple-system',
  'BlinkMacSystemFont',
  'Segoe UI',
  'sans-serif',
]

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary,
        gray,
        semantic: {
          error: '#d82d2d',
          success: '#2dd852',
        },
        overlay: {
          'dark-02': 'rgb(26 26 26 / 0.02)',
          'dark-08': 'rgb(26 26 26 / 0.08)',
          'dark-60': 'rgb(26 26 26 / 0.6)',
        },
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
          'primary-hover': primary[600],
          'primary-active': primary[700],
        },
      },
      spacing: {
        xs: '8px',
        s: '16px',
        m: '24px',
        l: '32px',
        xl: '60px',
      },
      borderWidth: {
        'stroke-md': '1px',
        'stroke-lg': '2px',
      },
      fontFamily: {
        sans: fontFamily,
        pretendard: fontFamily,
      },
      fontSize: {
        heading: ['28px', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '700' }],
        'title-01': ['24px', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '600' }],
        'title-02': ['20px', { lineHeight: '1.4', letterSpacing: '0', fontWeight: '600' }],
        'body-01': ['16px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '500' }],
        'body-02': ['14px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '500' }],
        caption: ['13px', { lineHeight: '1.5', letterSpacing: '0', fontWeight: '500' }],
        'transcription-body-01': ['16px', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],
        'transcription-body-02': ['14px', { lineHeight: '1.6', letterSpacing: '0', fontWeight: '400' }],
      },
    },
  },
}