export const Colors = {
    // Dynamic Material You Palette - Vibrancy Focus
    primary: '#6750A4', // Royal Purple
    primaryContainer: '#EADDFF',
    secondary: '#36618E', // Sky Blue Tone
    secondaryContainer: '#D1E4FF',
    tertiary: '#7D5260',
    success: '#146C2E',
    error: '#B3261E',

    dark: {
        primary: '#D0BCFF',
        onPrimary: '#381E72',
        primaryContainer: '#4F378B',
        background: '#141218', // True Pixel Night
        surface: '#1D1B20',
        surfaceVariant: '#49454F',
        onSurface: '#E6E1E5',
        onSurfaceVariant: '#CAC4D0',
        outline: '#938F99',
        card: '#242229',
        accent: '#D0BCFF',
    },

    light: {
        primary: '#6750A4',
        onPrimary: '#FFFFFF',
        primaryContainer: '#EADDFF',
        background: '#FFFBFE',
        surface: '#FFFFFF',
        surfaceVariant: '#E7E0EC',
        onSurface: '#1C1B1F',
        onSurfaceVariant: '#49454F',
        outline: '#79747E',
        card: '#F3EDF7',
        accent: '#6750A4',
    }
};

export type ThemeType = 'light' | 'dark';
