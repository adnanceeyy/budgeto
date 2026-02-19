import React from 'react';
import { StyleSheet, View, ViewStyle, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface GlassCardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    cornerRadius?: number;
}

/**
 * Standard Material 3 / Pixel Style Card (Permanent Design)
 */
const GlassCard = ({ children, style, cornerRadius = 24 }: GlassCardProps) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <View style={[
            styles.card,
            {
                borderRadius: cornerRadius,
                backgroundColor: isDark ? '#211F26' : '#FFFFFF',
                borderColor: isDark ? '#353439' : '#F0F0F0',
                borderWidth: 1,
            },
            style
        ]}>
            <View style={styles.content}>
                {children}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        overflow: 'hidden',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
            },
            android: {
                elevation: 3,
            },
            web: {
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            }
        }),
    },
    content: {
        padding: 20,
    },
});

export default GlassCard;
