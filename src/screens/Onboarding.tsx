import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import Background from '../components/Background';
import { ArrowRight, Lock, Shield, Sparkles } from 'lucide-react-native';
import PasscodeScreen from './PasscodeScreen';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const Onboarding = ({ onFinish, onSetPasscode }: { onFinish: () => void, onSetPasscode: (code: string) => void }) => {
    const { theme } = useTheme();
    const [step, setStep] = useState(0);
    const [settingPasscode, setSettingPasscode] = useState(false);
    const isDark = theme === 'dark';

    const steps = [
        {
            title: 'Welcome to Antigravity',
            desc: 'A modern, private way to track your finances. 100% offline and secure.',
            icon: Sparkles
        },
        {
            title: 'Material You Design',
            desc: 'A clean, adaptive interface inspired by Google Pixel design language.',
            icon: Shield
        },
        {
            title: 'Secure by Default',
            desc: 'Your financial data is encrypted and never leaves your device.',
            icon: Lock
        }
    ];

    const next = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => { });
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            setSettingPasscode(true);
        }
    };

    if (settingPasscode) {
        return (
            <PasscodeScreen
                title="Create a Passcode"
                onComplete={(code) => {
                    onSetPasscode(code);
                    onFinish();
                }}
            />
        );
    }

    const Icon = steps[step].icon;

    return (
        <View style={[styles.container, { backgroundColor: isDark ? '#141218' : '#FFFBFE' }]}>
            <View style={styles.header}>
                <View style={[styles.iconBox, { backgroundColor: isDark ? '#4F378B' : '#EADDFF' }]}>
                    <Icon color={isDark ? '#D0BCFF' : '#6750A4'} size={64} />
                </View>
            </View>

            <View style={styles.textContainer}>
                <Text style={[styles.title, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>{steps[step].title}</Text>
                <Text style={[styles.desc, { color: isDark ? '#CAC4D0' : '#49454F' }]}>{steps[step].desc}</Text>
            </View>

            <View style={styles.footer}>
                <View style={styles.dotContainer}>
                    {steps.map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                {
                                    backgroundColor: step === i ? (isDark ? '#D0BCFF' : '#6750A4') : (isDark ? '#49454F' : '#E7E0EC'),
                                    width: step === i ? 24 : 8
                                }
                            ]}
                        />
                    ))}
                </View>

                <TouchableOpacity
                    style={[styles.nextBtn, { backgroundColor: isDark ? '#D0BCFF' : '#6750A4' }]}
                    onPress={next}
                    activeOpacity={0.8}
                >
                    <Text style={[styles.nextText, { color: isDark ? '#381E72' : '#FFFFFF' }]}>
                        {step === steps.length - 1 ? 'Start Flow' : 'Next'}
                    </Text>
                    <ArrowRight color={isDark ? '#381E72' : '#FFFFFF'} size={24} />
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 40,
        justifyContent: 'space-between'
    },
    header: {
        alignItems: 'center',
        marginTop: 60,
    },
    iconBox: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textContainer: {
        alignItems: 'center',
    },
    title: {
        fontSize: 32,
        fontWeight: '400',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: -1
    },
    desc: {
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    footer: {
        marginBottom: 40,
        alignItems: 'center'
    },
    dotContainer: {
        flexDirection: 'row',
        marginBottom: 40,
        gap: 8
    },
    dot: {
        height: 8,
        borderRadius: 4,
    },
    nextBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingVertical: 20,
        borderRadius: 40,
        width: '100%',
        justifyContent: 'center',
        gap: 12
    },
    nextText: {
        fontSize: 18,
        fontWeight: '500',
    }
});

export default Onboarding;
