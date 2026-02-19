import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform, Switch, TextInput } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import Background from '../components/Background';
import { ChevronLeft, Bell, Clock, Check } from 'lucide-react-native';
import { notificationService } from '../utils/notificationService';
import * as Haptics from 'expo-haptics';
import ModalAlert from '../components/ModalAlert';
import { format, addDays, setHours, setMinutes } from 'date-fns';

const ReminderSettings = ({ navigation }: any) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [enabled, setEnabled] = useState(false);
    const [hour, setHour] = useState(20);
    const [minute, setMinute] = useState(0);
    const [message, setMessage] = useState("Keep your budget up to date. Did you spend or earn anything today?");
    const [loading, setLoading] = useState(true);

    const [alertConfig, setAlertConfig] = useState({
        visible: false, title: '', message: '', type: 'info' as any
    });

    const get12Hour = (h: number) => h === 0 ? 12 : (h > 12 ? h - 12 : h);
    const getPeriod = (h: number) => h >= 12 ? 'PM' : 'AM';

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        const settings = await notificationService.getSettings();
        setEnabled(settings.enabled);
        setHour(settings.hour);
        setMinute(settings.minute);
        setMessage(settings.body);
        setLoading(false);
    };

    const handleToggle = async (value: boolean) => {
        if (value) {
            const granted = await notificationService.requestPermissions();
            if (!granted) {
                setAlertConfig({
                    visible: true,
                    title: 'Permission Denied',
                    message: 'Budgeto needs notification access to send you reminders. Please enable them in your device settings.',
                    type: 'error'
                });
                setEnabled(false);
                return;
            }
            await notificationService.scheduleDailyReminder(hour, minute, message);
            const displayTime = `${get12Hour(hour).toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')} ${getPeriod(hour)}`;
            setAlertConfig({
                visible: true,
                title: 'Reminders Active',
                message: `Perfect! We'll notify you daily at ${displayTime} to log your flows.`,
                type: 'success'
            });
        } else {
            await notificationService.disableReminder();
        }
        setEnabled(value);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => { });
    };

    const updateTime = async (h: number, m: number, p?: 'AM' | 'PM') => {
        let finalHour = h;
        if (p) {
            if (p === 'AM' && h === 12) finalHour = 0;
            else if (p === 'PM' && h !== 12) finalHour = h + 12;
            else finalHour = h;
        } else {
            // If just changing minutes, keep existing period logic
            const currentPeriod = getPeriod(hour);
            if (currentPeriod === 'AM' && h === 12) finalHour = 0;
            else if (currentPeriod === 'PM' && h !== 12) finalHour = h + 12;
            else finalHour = h;
        }

        setHour(finalHour);
        setMinute(m);
        if (enabled) {
            await notificationService.scheduleDailyReminder(finalHour, m, message);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => { });
        }
    };

    const updateMessage = async (text: string) => {
        setMessage(text);
        if (enabled) {
            // debounce or update on Blur? let's do simple for now
            await notificationService.scheduleDailyReminder(hour, minute, text);
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
                    <Text style={[styles.title, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>System Alerts</Text>
                </View>

                <ScrollView contentContainerStyle={styles.content}>
                    <View style={[styles.card, { backgroundColor: isDark ? '#1D1B20' : '#F7F2FA' }]}>
                        <View style={styles.row}>
                            <View style={styles.rowLead}>
                                <View style={[styles.iconCircle, { backgroundColor: isDark ? '#4F378B' : '#EADDFF' }]}>
                                    <Bell color={isDark ? '#D0BCFF' : '#6750A4'} size={22} />
                                </View>
                                <View style={styles.rowTexts}>
                                    <Text style={[styles.rowTitle, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>Flow Reminders</Text>
                                    <Text style={[styles.rowSub, { color: isDark ? '#CAC4D0' : '#49454F' }]}>Daily ping to track your money</Text>
                                </View>
                            </View>
                            <Switch
                                value={enabled}
                                onValueChange={handleToggle}
                                trackColor={{ false: '#767577', true: isDark ? '#D0BCFF' : '#6750A4' }}
                                thumbColor={enabled ? (isDark ? '#E6E1E5' : '#FFFFFF') : '#f4f3f4'}
                            />
                        </View>
                    </View>

                    {enabled && (
                        <View style={styles.timeSection}>
                            <Text style={[styles.sectionHeader, { color: isDark ? '#D0BCFF' : '#6750A4' }]}>Alert Description</Text>
                            <View style={[styles.inputBox, { backgroundColor: isDark ? '#1D1B20' : '#F7F2FA' }]}>
                                <TextInput
                                    style={[styles.input, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}
                                    value={message}
                                    onChangeText={updateMessage}
                                    placeholder="What should we tell you?"
                                    placeholderTextColor={isDark ? '#49454F' : '#CAC4D0'}
                                    multiline
                                />
                            </View>

                            <View style={styles.divider} />

                            <Text style={[styles.sectionHeader, { color: isDark ? '#D0BCFF' : '#6750A4' }]}>Check-in Time</Text>

                            <View style={styles.timeGrid}>
                                <View style={styles.timeColumn}>
                                    <Text style={[styles.timeLabel, { color: isDark ? '#CAC4D0' : '#49454F' }]}>H</Text>
                                    <View style={[styles.pickerBox, { backgroundColor: isDark ? '#1D1B20' : '#F7F2FA' }]}>
                                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10 }}>
                                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((h) => (
                                                <TouchableOpacity
                                                    key={h}
                                                    style={[styles.timeItem, get12Hour(hour) === h && { backgroundColor: isDark ? '#D0BCFF' : '#6750A4' }]}
                                                    onPress={() => updateTime(h, minute, getPeriod(hour) as any)}
                                                >
                                                    <Text style={[styles.timeText, { color: get12Hour(hour) === h ? (isDark ? '#381E72' : '#FFFFFF') : (isDark ? '#E6E1E5' : '#1C1B1F') }]}>
                                                        {h.toString().padStart(2, '0')}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                </View>

                                <Text style={[styles.timeSeparator, { color: isDark ? '#49454F' : '#E7E0EC' }]}>:</Text>

                                <View style={styles.timeColumn}>
                                    <Text style={[styles.timeLabel, { color: isDark ? '#CAC4D0' : '#49454F' }]}>M</Text>
                                    <View style={[styles.pickerBox, { backgroundColor: isDark ? '#1D1B20' : '#F7F2FA' }]}>
                                        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 10 }}>
                                            {[0, 15, 30, 45].map((m) => (
                                                <TouchableOpacity
                                                    key={m}
                                                    style={[styles.timeItem, minute === m && { backgroundColor: isDark ? '#D0BCFF' : '#6750A4' }]}
                                                    onPress={() => updateTime(get12Hour(hour), m, getPeriod(hour) as any)}
                                                >
                                                    <Text style={[styles.timeText, { color: minute === m ? (isDark ? '#381E72' : '#FFFFFF') : (isDark ? '#E6E1E5' : '#1C1B1F') }]}>
                                                        {m.toString().padStart(2, '0')}
                                                    </Text>
                                                </TouchableOpacity>
                                            ))}
                                        </ScrollView>
                                    </View>
                                </View>

                                <View style={styles.periodColumn}>
                                    <TouchableOpacity
                                        style={[styles.periodBtn, getPeriod(hour) === 'AM' && { backgroundColor: isDark ? '#D0BCFF' : '#6750A4' }]}
                                        onPress={() => updateTime(get12Hour(hour), minute, 'AM')}
                                    >
                                        <Text style={[styles.periodText, { color: getPeriod(hour) === 'AM' ? (isDark ? '#381E72' : '#FFFFFF') : (isDark ? '#E6E1E5' : '#1C1B1F') }]}>AM</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.periodBtn, getPeriod(hour) === 'PM' && { backgroundColor: isDark ? '#D0BCFF' : '#6750A4' }]}
                                        onPress={() => updateTime(get12Hour(hour), minute, 'PM')}
                                    >
                                        <Text style={[styles.periodText, { color: getPeriod(hour) === 'PM' ? (isDark ? '#381E72' : '#FFFFFF') : (isDark ? '#E6E1E5' : '#1C1B1F') }]}>PM</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={[styles.infoBox, { backgroundColor: isDark ? '#1D1B20' : '#F3EDF7' }]}>
                                <Clock size={18} color={isDark ? '#D0BCFF' : '#6750A4'} />
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.infoText, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>
                                        Next alarm: {(() => {
                                            let next = setHours(setMinutes(new Date(), minute), hour);
                                            if (next < new Date()) next = addDays(next, 1);
                                            return format(next, 'EEEE, MMM dd @ hh:mm a');
                                        })()}
                                    </Text>
                                    <Text style={[styles.infoSub, { color: isDark ? '#CAC4D0' : '#49454F', fontSize: 12, marginTop: 2 }]}>
                                        Synchronized with system core
                                    </Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.testBtn, { backgroundColor: isDark ? '#2B2930' : '#F3EDF7', borderColor: isDark ? '#49454F' : '#E7E0EC' }]}
                                onPress={async () => {
                                    await notificationService.sendTestNotification();
                                    setAlertConfig({
                                        visible: true,
                                        title: 'Test Sent!',
                                        message: 'A test alert has been triggered. Check your device notifications!',
                                        type: 'success'
                                    });
                                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
                                }}
                            >
                                <Bell size={18} color={isDark ? '#D0BCFF' : '#6750A4'} />
                                <Text style={{ color: isDark ? '#E6E1E5' : '#1C1B1F', fontWeight: 'bold' }}>Send Test Alert</Text>
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
    rowSub: { fontSize: 13, marginTop: 2, opacity: 0.7 },
    iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    timeSection: { gap: 16 },
    sectionHeader: { fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 },
    timeGrid: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginVertical: 20 },
    timeColumn: { alignItems: 'center', width: 75 },
    periodColumn: { gap: 8, marginLeft: 10 },
    periodBtn: { width: 50, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
    periodText: { fontSize: 13, fontWeight: '700' },
    timeLabel: { fontSize: 12, fontWeight: '700', marginBottom: 12, opacity: 0.6 },
    pickerBox: { width: '100%', height: 160, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
    timeItem: { paddingVertical: 14, alignItems: 'center', marginHorizontal: 8, marginVertical: 4, borderRadius: 12 },
    timeText: { fontSize: 18, fontWeight: '600' },
    timeSeparator: { fontSize: 24, fontWeight: '300', marginTop: 15 },
    inputBox: { borderRadius: 20, padding: 16, minHeight: 80, borderWidth: 1, borderColor: 'rgba(0,0,0,0.05)' },
    input: { fontSize: 15, lineHeight: 22 },
    divider: { height: 1, backgroundColor: 'rgba(0,0,0,0.05)', marginVertical: 8 },
    infoBox: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderRadius: 20, marginTop: 10 },
    infoText: { fontSize: 14, fontWeight: '600' },
    infoSub: { fontSize: 12, opacity: 0.7 },
    testBtn: { marginTop: 24, padding: 18, borderRadius: 20, borderWidth: 1.5, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 }
});

export default ReminderSettings;
