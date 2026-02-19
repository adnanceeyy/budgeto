import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform, Switch } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import Background from '../components/Background';
import { ChevronLeft, Bell, Clock, Check } from 'lucide-react-native';
import { notificationService } from '../utils/notificationService';
import * as Haptics from 'expo-haptics';
import ModalAlert from '../components/ModalAlert';

const ReminderSettings = ({ navigation }: any) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [enabled, setEnabled] = useState(false);
    const [hour, setHour] = useState(20);
    const [minute, setMinute] = useState(0);
    const [loading, setLoading] = useState(true);

    const [alertConfig, setAlertConfig] = useState({
        visible: false, title: '', message: '', type: 'info' as any
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const settings = await notificationService.getSettings();
        setEnabled(settings.enabled);
        setHour(settings.hour);
        setMinute(settings.minute);
        setLoading(false);
    };

    const handleToggle = async (value: boolean) => {
        if (value) {
            const granted = await notificationService.requestPermissions();
            if (!granted) {
                setAlertConfig({
                    visible: true,
                    title: 'Permission Denied',
                    message: 'Please enable notifications in your phone settings to use reminders.',
                    type: 'error'
                });
                return;
            }
            await notificationService.scheduleDailyReminder(hour, minute);
        } else {
            await notificationService.disableReminder();
        }
        setEnabled(value);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
    };

    const updateTime = async (h: number, m: number) => {
        setHour(h);
        setMinute(m);
        if (enabled) {
            await notificationService.scheduleDailyReminder(h, m);
        }
    };

    if (loading) return null;

    return (
        <Background>
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ChevronLeft color={isDark ? '#E6E1E5' : '#1C1B1F'} size={24} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>Reminders</Text>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={[styles.card, { backgroundColor: isDark ? '#1D1B20' : '#F7F2FA' }]}>
                        <View style={styles.row}>
                            <View style={styles.rowLead}>
                                <Bell color={isDark ? '#D0BCFF' : '#6750A4'} size={24} />
                                <View style={styles.rowTexts}>
                                    <Text style={[styles.rowTitle, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>Daily Reminder</Text>
                                    <Text style={[styles.rowSub, { color: isDark ? '#CAC4D0' : '#49454F' }]}>Get notified to log your flows</Text>
                                </View>
                            </View>
                            <Switch
                                value={enabled}
                                onValueChange={handleToggle}
                                trackColor={{ false: '#767577', true: isDark ? '#4F378B' : '#EADDFF' }}
                                thumbColor={enabled ? (isDark ? '#D0BCFF' : '#6750A4') : '#f4f3f4'}
                            />
                        </View>
                    </View>

                    {enabled && (
                        <View style={styles.timeSection}>
                            <Text style={[styles.sectionHeader, { color: isDark ? '#D0BCFF' : '#6750A4' }]}>Set Reminder Time</Text>

                            <View style={styles.timeGrid}>
                                <View style={styles.timeColumn}>
                                    <Text style={[styles.timeLabel, { color: isDark ? '#CAC4D0' : '#49454F' }]}>Hour</Text>
                                    <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                                        {Array.from({ length: 24 }).map((_, i) => (
                                            <TouchableOpacity
                                                key={i}
                                                style={[styles.timeItem, hour === i && { backgroundColor: isDark ? '#4F378B' : '#EADDFF' }]}
                                                onPress={() => updateTime(i, minute)}
                                            >
                                                <Text style={[styles.timeText, { color: isDark ? '#E6E1E5' : '#1C1B1F' }, hour === i && { fontWeight: 'bold' }]}>
                                                    {i.toString().padStart(2, '0')}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                <Text style={[styles.timeSeparator, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>:</Text>

                                <View style={styles.timeColumn}>
                                    <Text style={[styles.timeLabel, { color: isDark ? '#CAC4D0' : '#49454F' }]}>Minute</Text>
                                    <ScrollView style={styles.pickerScroll} showsVerticalScrollIndicator={false}>
                                        {[0, 15, 30, 45].map((m) => (
                                            <TouchableOpacity
                                                key={m}
                                                style={[styles.timeItem, minute === m && { backgroundColor: isDark ? '#4F378B' : '#EADDFF' }]}
                                                onPress={() => updateTime(hour, m)}
                                            >
                                                <Text style={[styles.timeText, { color: isDark ? '#E6E1E5' : '#1C1B1F' }, minute === m && { fontWeight: 'bold' }]}>
                                                    {m.toString().padStart(2, '0')}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>
                            </View>

                            <View style={[styles.infoBox, { backgroundColor: isDark ? '#2B2930' : '#EADDFF' }]}>
                                <Clock size={20} color={isDark ? '#D0BCFF' : '#6750A4'} />
                                <Text style={[styles.infoText, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>
                                    Next reminder: Today at {hour.toString().padStart(2, '0')}:{minute.toString().padStart(2, '0')}
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={[styles.testBtn, { borderColor: isDark ? '#D0BCFF' : '#6750A4' }]}
                                onPress={async () => {
                                    await notificationService.sendTestNotification();
                                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
                                }}
                            >
                                <Text style={{ color: isDark ? '#D0BCFF' : '#6750A4', fontWeight: 'bold' }}>Send Test Notification</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>

                <ModalAlert
                    visible={alertConfig.visible}
                    title={alertConfig.title}
                    message={alertConfig.message}
                    type={alertConfig.type}
                    onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
                />
            </View>
        </Background>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 60 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 24, gap: 16 },
    backBtn: { padding: 4 },
    title: { fontSize: 24, fontWeight: '400' },
    content: { padding: 20 },
    card: { borderRadius: 24, padding: 20, marginBottom: 24 },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    rowLead: { flexDirection: 'row', alignItems: 'center', gap: 16, flex: 1 },
    rowTexts: { flex: 1 },
    rowTitle: { fontSize: 16, fontWeight: '600' },
    rowSub: { fontSize: 13, marginTop: 2 },
    timeSection: { gap: 16 },
    sectionHeader: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
    timeGrid: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20, height: 200 },
    timeColumn: { alignItems: 'center', width: 80 },
    timeLabel: { fontSize: 12, fontWeight: '700', marginBottom: 12, textTransform: 'uppercase' },
    pickerScroll: { width: '100%', borderRadius: 16, borderWidth: 1, borderColor: 'rgba(0,0,0,0.1)' },
    timeItem: { paddingVertical: 12, alignItems: 'center' },
    timeText: { fontSize: 20 },
    timeSeparator: { fontSize: 32, fontWeight: '300', marginTop: 25 },
    infoBox: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 16, marginTop: 20 },
    infoText: { fontSize: 14, fontWeight: '500' },
    testBtn: { marginTop: 24, padding: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center' }
});

export default ReminderSettings;
