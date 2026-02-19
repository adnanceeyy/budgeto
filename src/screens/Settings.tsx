import React, { useState } from 'react';
import { StyleSheet, View, Text, Switch, TouchableOpacity, ScrollView, Platform, Modal, Image } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ColorThemeType, BaseThemeColors } from '../theme/colors';
import Background from '../components/Background';
import { ChevronRight, Shield, Database, Palette, Info, Moon, Sun, Trash2, Key, Bell, Phone, Check, Globe, Sparkles } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { dbService } from '../database/db';
import { useNavigation } from '@react-navigation/native';
import ModalAlert from '../components/ModalAlert';

const Settings = () => {
    const { theme, setTheme, colorTheme, setColorTheme, colors, currency, setCurrency } = useTheme();
    const isDark = theme === 'dark';
    const navigation = useNavigation<any>();

    const [alertConfig, setAlertConfig] = useState<{ visible: boolean; title: string; message: string; type: any; onConfirm?: () => void }>({
        visible: false,
        title: '',
        message: '',
        type: 'info'
    });

    const [showThemeModal, setShowThemeModal] = useState(false);
    const [showCurrencyModal, setShowCurrencyModal] = useState(false);

    const currencies = [
        { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
        { code: 'USD', symbol: '$', name: 'US Dollar' },
        { code: 'EUR', symbol: '€', name: 'Euro' },
        { code: 'GBP', symbol: '£', name: 'British Pound' },
        { code: 'JPY', symbol: '¥', name: 'Japanese Yen' }
    ];

    const themes = [
        { id: 'light', name: 'Light Flow', icon: Sun },
        { id: 'dark', name: 'Deep Space', icon: Moon }
    ];

    const colorPresets = [
        { id: 'purple', name: 'Royal Purple', color: BaseThemeColors.purple },
        { id: 'ocean', name: 'Ocean Breeze', color: BaseThemeColors.ocean },
        { id: 'emerald', name: 'Emerald City', color: BaseThemeColors.emerald },
        { id: 'crimson', name: 'Crimson Tide', color: BaseThemeColors.crimson }
    ];

    const handleWipeRequest = () => {
        setAlertConfig({
            visible: true,
            title: 'Nuke Everything?',
            message: 'This will permanently delete all your financial flows and categories. This action is irreversible.',
            type: 'confirm',
            onConfirm: async () => {
                await dbService.wipeData();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
                setAlertConfig({
                    visible: true,
                    title: 'System Reset',
                    message: 'Flow data has been cleared. The system will now refresh.',
                    type: 'success',
                    onConfirm: () => {
                        if (Platform.OS === 'web') window.location.reload();
                        else setAlertConfig({ ...alertConfig, visible: false });
                    }
                });
            }
        });
    };

    const SettingItem = ({ icon: Icon, title, subtitle, value, onPress, danger }: any) => (
        <TouchableOpacity
            style={styles.item}
            onPress={onPress}
        >
            <View style={[styles.itemIcon, { backgroundColor: danger ? 'rgba(179, 38, 30, 0.1)' : (isDark ? '#2B2930' : '#F3EDF7') }]}>
                <Icon size={20} color={danger ? '#B3261E' : (isDark ? '#D0BCFF' : '#6750A4')} />
            </View>
            <View style={styles.itemText}>
                <Text style={[styles.itemTitle, { color: danger ? '#B3261E' : (isDark ? '#E6E1E5' : '#1C1B1F') }]}>{title}</Text>
                {subtitle && <Text style={[styles.itemSubtitle, { color: isDark ? '#CAC4D0' : '#49454F' }]}>{subtitle}</Text>}
            </View>
            <View style={styles.itemRight}>
                {value && <Text style={[styles.itemValue, { color: isDark ? '#D0BCFF' : '#6750A4' }]}>{value}</Text>}
                <ChevronRight size={18} color={isDark ? '#CAC4D0' : '#49454F'} />
            </View>
        </TouchableOpacity>
    );

    return (
        <Background>
            <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={[styles.title, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>Settings</Text>

                <View style={styles.section}>
                    <Text style={[styles.sectionHeader, { color: colors.primary }]}>Appearance</Text>
                    <SettingItem
                        icon={isDark ? Moon : Sun}
                        title="App Theme"
                        subtitle="Change the visual style"
                        value={isDark ? 'Deep Space' : 'Light Flow'}
                        onPress={() => setShowThemeModal(true)}
                    />
                    <SettingItem
                        icon={Palette}
                        title="Manage Categories"
                        subtitle="Customize icons and colors"
                        onPress={() => navigation.navigate('ManageCategories')}
                    />
                    <SettingItem
                        icon={Globe}
                        title="Currency"
                        subtitle="Default trading currency"
                        value={currency}
                        onPress={() => setShowCurrencyModal(true)}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionHeader, { color: colors.primary }]}>Security & Privacy</Text>
                    <SettingItem
                        icon={Key}
                        title="Change Passcode"
                        subtitle="Update your security PIN"
                        onPress={() => navigation.navigate('ChangePasscode')}
                    />
                    <SettingItem
                        icon={Shield}
                        title="Biometric Lock"
                        subtitle="Unlock using fingerprint or face"
                        onPress={() => setAlertConfig({
                            visible: true,
                            title: 'Coming Soon',
                            message: 'Biometric authentication will be available in the next system update.',
                            type: 'info'
                        })}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionHeader, { color: colors.primary }]}>General</Text>
                    <SettingItem
                        icon={Bell}
                        title="Notifications"
                        subtitle="Manage alerts and reminders"
                        onPress={() => navigation.navigate('Reminders')}
                    />
                    <SettingItem
                        icon={Info}
                        title="About Budgeto"
                        subtitle="Version 2.3.0 - Image Hub Update"
                        onPress={() => { }}
                    />
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionHeader, { color: colors.primary }]}>Danger Zone</Text>
                    <SettingItem
                        icon={Trash2}
                        title="Wipe Data"
                        subtitle="Clear all transactions and history"
                        onPress={handleWipeRequest}
                        danger
                    />
                </View>
                <View style={styles.aboutSection}>
                    <View style={[styles.aboutLogoContainer, { backgroundColor: colors.card }]}>
                        <Image
                            source={require('../../assets/icon.png')}
                            style={styles.aboutLogo}
                        />
                    </View>
                    <Text style={[styles.aboutTitle, { color: colors.onSurface }]}>Budgeto Hub</Text>
                    <Text style={[styles.aboutVersion, { color: colors.onSurfaceVariant }]}>Stable Release V2.2.0</Text>
                    <View style={[styles.proBadge, { backgroundColor: colors.primary + '20' }]}>
                        <Sparkles size={14} color={colors.primary} />
                        <Text style={[styles.proBadgeText, { color: colors.primary }]}>PREMIUM SYSTEM</Text>
                    </View>
                    <Text style={[styles.aboutCopyright, { color: colors.onSurfaceVariant }]}>
                        &copy; 2024 Budgeto. Open Source. Private. Secure.
                    </Text>
                </View>
            </ScrollView>

            {/* Theme Modal */}
            <Modal visible={showThemeModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.modalTitle, { color: colors.onSurface }]}>Select Theme</Text>
                        {themes.map((t) => (
                            <TouchableOpacity
                                key={t.id}
                                style={[styles.selectBox, { borderBottomColor: colors.outline }]}
                                onPress={() => { setTheme(t.id as any); setShowThemeModal(false); }}
                            >
                                <t.icon size={20} color={colors.primary} />
                                <Text style={[styles.selectText, { color: colors.onSurface }]}>{t.name}</Text>
                                {(theme === t.id) && <Check color={colors.primary} size={20} />}
                            </TouchableOpacity>
                        ))}
                        <Text style={[styles.modalTitle, { color: colors.onSurface, marginTop: 24 }]}>Accent Color</Text>
                        <View style={styles.colorGrid}>
                            {colorPresets.map((p) => (
                                <TouchableOpacity
                                    key={p.id}
                                    style={[
                                        styles.colorCircle,
                                        { backgroundColor: p.color },
                                        colorTheme === p.id && { borderWidth: 3, borderColor: colors.onSurface }
                                    ]}
                                    onPress={() => setColorTheme(p.id as any)}
                                />
                            ))}
                        </View>

                        <TouchableOpacity style={styles.modalClose} onPress={() => setShowThemeModal(false)}>
                            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Currency Modal */}
            <Modal visible={showCurrencyModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
                        <Text style={[styles.modalTitle, { color: colors.onSurface }]}>Select Currency</Text>
                        <ScrollView style={{ maxHeight: 400 }}>
                            {currencies.map((c) => (
                                <TouchableOpacity
                                    key={c.code}
                                    style={[styles.selectBox, { borderBottomColor: colors.outline }]}
                                    onPress={() => { setCurrency(c.code); setShowCurrencyModal(false); }}
                                >
                                    <View style={[styles.currencyIcon, { backgroundColor: colors.card }]}>
                                        <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{c.symbol}</Text>
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.selectText, { color: colors.onSurface }]}>{c.code}</Text>
                                        <Text style={{ color: colors.onSurfaceVariant, fontSize: 12 }}>{c.name}</Text>
                                    </View>
                                    {currency === c.code && <Check color={colors.primary} size={20} />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                        <TouchableOpacity style={styles.modalClose} onPress={() => setShowCurrencyModal(false)}>
                            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <ModalAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                confirmText={alertConfig.type === 'confirm' ? 'Confirm' : 'OK'}
                onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
                onConfirm={alertConfig.onConfirm}
            />
        </Background>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingBottom: 120 },
    title: { fontSize: 32, fontWeight: '400', padding: 24, paddingTop: 60, letterSpacing: -0.5 },
    section: { marginBottom: 32 },
    sectionHeader: { fontSize: 13, fontWeight: '700', paddingHorizontal: 24, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1.5 },
    item: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 18 },
    itemIcon: { width: 44, height: 44, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    itemText: { flex: 1 },
    itemTitle: { fontSize: 16, fontWeight: '500' },
    itemSubtitle: { fontSize: 13, marginTop: 2, fontWeight: '400' },
    itemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    itemValue: { fontSize: 14, fontWeight: '500' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalCard: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, elevation: 12 },
    modalTitle: { fontSize: 20, fontWeight: '600', marginBottom: 24 },
    selectBox: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, gap: 16 },
    selectText: { fontSize: 16, flex: 1 },
    modalClose: { marginTop: 24, alignItems: 'center' },
    currencyIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
    colorGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 },
    colorCircle: { width: 48, height: 48, borderRadius: 24, elevation: 2 },
    aboutSection: { alignItems: 'center', paddingVertical: 40, marginTop: 24 },
    aboutLogoContainer: { width: 80, height: 80, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16, elevation: 4 },
    aboutLogo: { width: 60, height: 60, borderRadius: 12 },
    aboutTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
    aboutVersion: { fontSize: 13, marginBottom: 12 },
    proBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginBottom: 16 },
    proBadgeText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
    aboutCopyright: { fontSize: 11, textAlign: 'center', opacity: 0.7 }
});

export default Settings;
