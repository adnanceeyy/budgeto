import React from 'react';
import { StyleSheet, View, Platform, StatusBar } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface BackgroundProps {
    children: React.ReactNode;
}

/**
 * Material 3 Surface Background Component
 */
const Background = ({ children }: BackgroundProps) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#141218' : '#FFFBFE' }]}>
            <StatusBar
                barStyle={isDark ? 'light-content' : 'dark-content'}
                backgroundColor="transparent"
                translucent
            />
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default Background;
