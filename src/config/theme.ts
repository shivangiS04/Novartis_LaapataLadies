/**
 * Theme Configuration - Black & Orange Theme
 * Font: Roboto, Black 900 Italic for headings
 */

export const theme = {
  colors: {
    primary: '#FF8C00', // Orange
    primaryDark: '#E67E00',
    primaryLight: '#FFB84D',
    background: '#000000', // Black
    backgroundLight: '#1A1A1A',
    backgroundLighter: '#2D2D2D',
    text: '#FFFFFF',
    textSecondary: '#B0B0B0',
    textTertiary: '#808080',
    accent: '#FF8C00',
    accentDark: '#E67E00',
    success: '#4CAF50',
    warning: '#FFC107',
    error: '#F44336',
    info: '#2196F3',
    border: '#404040',
    borderLight: '#505050',
  },
  fonts: {
    primary: 'Roboto, sans-serif',
    heading: 'Roboto, sans-serif',
    mono: 'Roboto Mono, monospace',
  },
  fontWeights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900,
  },
  fontStyles: {
    headingBlackItalic: {
      fontFamily: 'Roboto, sans-serif',
      fontWeight: 900,
      fontStyle: 'italic',
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    headingBold: {
      fontFamily: 'Roboto, sans-serif',
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    subheading: {
      fontFamily: 'Roboto, sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    body: {
      fontFamily: 'Roboto, sans-serif',
      fontWeight: 400,
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    bodySmall: {
      fontFamily: 'Roboto, sans-serif',
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    caption: {
      fontFamily: 'Roboto, sans-serif',
      fontWeight: 500,
      fontSize: '0.75rem',
      lineHeight: 1.4,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '1rem',
    xl: '1.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px rgba(255, 140, 0, 0.1)',
    md: '0 4px 6px rgba(255, 140, 0, 0.15)',
    lg: '0 10px 15px rgba(255, 140, 0, 0.2)',
    xl: '0 20px 25px rgba(255, 140, 0, 0.25)',
  },
  transitions: {
    fast: '150ms ease-in-out',
    normal: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  },
};

export type Theme = typeof theme;
