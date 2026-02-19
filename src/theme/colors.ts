const BaseColors = {
    purple: '#6750A4',
    ocean: '#0061A4',
    emerald: '#006D3B',
    crimson: '#BA1A1A',
};

export const ColorPresets: any = {
    purple: {
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
        },
        dark: {
            primary: '#8B63D4',
            onPrimary: '#FFFFFF',
            primaryContainer: '#4F378B',
            background: '#0D0B0F',
            surface: '#121115',
            surfaceVariant: '#2A282D',
            onSurface: '#E6E1E5',
            onSurfaceVariant: '#CAC4D0',
            outline: '#938F99',
            card: '#18161E',
            accent: '#8B63D4',
        }
    },
    ocean: {
        light: {
            primary: '#0061A4',
            onPrimary: '#FFFFFF',
            primaryContainer: '#D1E4FF',
            background: '#F8FDFF',
            surface: '#F8FDFF',
            surfaceVariant: '#DFE2EB',
            onSurface: '#191C1E',
            onSurfaceVariant: '#43474E',
            outline: '#73777F',
            card: '#EAF5FF',
            accent: '#0061A4',
        },
        dark: {
            primary: '#3482F6',
            onPrimary: '#FFFFFF',
            primaryContainer: '#00497D',
            background: '#0B0D0F',
            surface: '#0F1113',
            surfaceVariant: '#2D3135',
            onSurface: '#E2E2E6',
            onSurfaceVariant: '#C3C7CF',
            outline: '#8D9199',
            card: '#141A21',
            accent: '#3482F6',
        }
    },
    emerald: {
        light: {
            primary: '#006D3B',
            onPrimary: '#FFFFFF',
            primaryContainer: '#98F7B5',
            background: '#FBFDF8',
            surface: '#FBFDF8',
            surfaceVariant: '#DDE5D9',
            onSurface: '#191C19',
            onSurfaceVariant: '#414941',
            outline: '#727970',
            card: '#ECF5ED',
            accent: '#006D3B',
        },
        dark: {
            primary: '#2B9E5A',
            onPrimary: '#FFFFFF',
            primaryContainer: '#00522E',
            background: '#0B0D0B',
            surface: '#0E110F',
            surfaceVariant: '#2B312B',
            onSurface: '#E1E3DE',
            onSurfaceVariant: '#C1C9BE',
            outline: '#8B9389',
            card: '#131D14',
            accent: '#2B9E5A',
        }
    },
    crimson: {
        light: {
            primary: '#BA1A1A',
            onPrimary: '#FFFFFF',
            primaryContainer: '#FFDAD6',
            background: '#FFF8F7',
            surface: '#FFF8F7',
            surfaceVariant: '#F5DDDA',
            onSurface: '#201A19',
            onSurfaceVariant: '#534341',
            outline: '#857371',
            card: '#FCEAE8',
            accent: '#BA1A1A',
        },
        dark: {
            primary: '#E53935',
            onPrimary: '#FFFFFF',
            primaryContainer: '#93000A',
            background: '#0F0908',
            surface: '#110D0C',
            surfaceVariant: '#352A28',
            onSurface: '#EDE0DE',
            onSurfaceVariant: '#D8C2BF',
            outline: '#A08C8A',
            card: '#1C1514',
            accent: '#E53935',
        }
    }
};

export type ThemeType = 'light' | 'dark';
export type ColorThemeType = 'purple' | 'ocean' | 'emerald' | 'crimson';
export const BaseThemeColors = BaseColors;
