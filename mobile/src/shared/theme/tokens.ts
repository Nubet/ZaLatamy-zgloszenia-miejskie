export type ThemeName = 'dark' | 'light';

export const themes = {
  dark: {
    background: '#111114', surface: '#1b1b1d', raised: '#202022', navigation: '#0c0c0f',
    text: '#f0f0f3', secondary: '#c3c3cb', muted: '#99999f', border: '#2b2b2e',
    accent: '#4124fb', accentText: '#d8cdf0', selected: '#252039', error: '#efbeb1', success: '#a1d1b4',
    new: '#e6bf72', accepted: '#88b4e2', progress: '#af96e5', resolved: '#78c59c', rejected: '#efbeb1', duplicate: '#99999f',
  },
  light: {
    background: '#f6f6f9', surface: '#ffffff', raised: '#ffffff', navigation: '#efeff4',
    text: '#202027', secondary: '#50505f', muted: '#686878', border: '#d8d8e2',
    accent: '#4124fb', accentText: '#5133b8', selected: '#efebff', error: '#a33748', success: '#286342',
    new: '#805800', accepted: '#245b98', progress: '#6440ab', resolved: '#286342', rejected: '#a33748', duplicate: '#50505f',
  },
} satisfies Record<ThemeName, Record<string, string>>;

export type Theme = typeof themes.dark;
