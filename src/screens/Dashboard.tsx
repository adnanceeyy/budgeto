import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, Platform, Modal } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useTheme } from '../theme/ThemeContext';
import { ColorPresets } from '../theme/colors';
import { Wallet, TrendingUp, TrendingDown, Plus, Menu, X, Landmark, PieChart as PieIcon, Shield, Info, Target, Landmark as DebtIcon, ReceiptText, History, User, Calendar as CalIcon, Sparkles, DollarSign, Palette } from 'lucide-react-native';
import { dbService } from '../database/db';
import { CATEGORY_ICONS } from '../utils/iconLibrary';
import * as Haptics from 'expo-haptics';
import { format, subDays } from 'date-fns';
import GlassCard from '../components/GlassCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'react-native';
import Animated, { FadeInDown, FadeInUp, Layout, FadeIn, FadeOut, SlideInLeft, SlideOutLeft } from 'react-native-reanimated';
import ModalAlert from '../components/ModalAlert';

const { width } = Dimensions.get('window');

const AnimatedValue = ({ value, symbol, style }: { value: number, symbol: string, style: any }) => {
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        let startValue = displayValue === value ? 0 : displayValue;
        const duration = 1500;
        const frames = 60;
        const frameTime = duration / frames;
        let frame = 0;

        const timer = setInterval(() => {
            frame++;
            const progress = frame / frames;
            const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const current = Math.floor(startValue + (value - startValue) * easeOutExpo);

            setDisplayValue(current);
            if (frame === frames) clearInterval(timer);
        }, frameTime);

        return () => clearInterval(timer);
    }, [value]);

    return <Text style={style}>{symbol}{displayValue.toLocaleString()}</Text>;
};

const Dashboard = ({ navigation }: any) => {
    const { theme, colors, currency } = useTheme();
    const [balance, setBalance] = useState(0);
    const [income, setIncome] = useState(0);
    const [expense, setExpense] = useState(0);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [alertConfig, setAlertConfig] = useState({
        visible: false, title: '', message: '', type: 'info' as any
    });

    const currencySymbols: { [key: string]: string } = {
        'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥'
    };
    const symbol = currencySymbols[currency] || '₹';

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', loadData);
        loadData();
        return unsubscribe;
    }, [navigation]);

    const loadData = async () => {
        const txs = await dbService.getTransactions();
        setTransactions(txs.slice(0, 5));

        let totalIn = 0;
        let totalOut = 0;
        txs.forEach((t: any) => {
            if (t.type === 'income') totalIn += t.amount;
            else totalOut += t.amount;
        });
        setIncome(totalIn);
        setExpense(totalOut);
        setBalance(totalIn - totalOut);

        const dailyData: { [key: string]: number } = {};
        for (let i = 6; i >= 0; i--) {
            const dateStr = format(subDays(new Date(), i), 'yyyy-MM-dd');
            dailyData[dateStr] = 0;
        }

        txs.forEach((t: any) => {
            const dateStr = format(new Date(t.date), 'yyyy-MM-dd');
            if (dailyData[dateStr] !== undefined && t.type === 'expense') {
                dailyData[dateStr] += t.amount;
            }
        });

        const formattedChart = Object.keys(dailyData).map(date => ({
            value: dailyData[date],
            label: format(new Date(date), 'dd'),
            dataPointText: dailyData[date] > 0 ? (dailyData[date] > 999 ? `${(dailyData[date] / 1000).toFixed(1)}k` : `${Math.round(dailyData[date])}`) : '',
        }));

        if (formattedChart.length === 0) {
            setChartData([{ value: 0, label: '' }, { value: 0, label: '' }]);
        } else {
            setChartData(formattedChart);
        }

        const profileStr = await AsyncStorage.getItem('user_profile');
        if (profileStr) {
            setUser(JSON.parse(profileStr));
        }
    };

    const isDark = theme === 'dark';

    const MenuItem = ({ icon: Icon, label, route, tab, alertText }: any) => (
        <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
                setIsMenuOpen(false);
                if (tab) navigation.navigate(tab);
                else if (route) navigation.navigate(route);
                else if (alertText) setAlertConfig({
                    visible: true,
                    title: label,
                    message: alertText,
                    type: 'info'
                });
            }}
        >
            <View style={[styles.menuIconContainer, { backgroundColor: colors.card }]}>
                <Icon color={colors.primary} size={22} />
            </View>
            <Text style={[styles.menuText, { color: colors.onSurface }]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <Animated.View entering={FadeInUp.delay(100).duration(600)} style={styles.header}>
                    <TouchableOpacity onPress={() => setIsMenuOpen(true)} style={styles.menuTrigger}>
                        <Menu color={colors.onSurface} size={28} />
                    </TouchableOpacity>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Image
                            source={require('../../assets/icon.png')}
                            style={{ width: 28, height: 28, marginRight: 10, borderRadius: 6 }}
                        />
                        <Text style={[styles.userName, { color: colors.onSurface }]}>Budgeto Hub</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.profileBox}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                            {user?.avatar ? (
                                <Image source={{ uri: user.avatar }} style={{ width: 44, height: 44 }} />
                            ) : (
                                <Text style={{ color: colors.onPrimary, fontWeight: 'bold' }}>
                                    {user?.name ? user.name.split(' ').map((n: string) => n[0]).join('') : 'JD'}
                                </Text>
                            )}
                        </View>
                    </TouchableOpacity>
                </Animated.View>

                {/* Balance Card */}
                <Animated.View entering={FadeInDown.delay(200).duration(800)} style={[styles.assetCard, { backgroundColor: colors.primary }]}>
                    <View style={styles.cardHeader}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <Text style={[styles.cardTag, { color: 'rgba(255,255,255,0.7)' }]}>NET LIQUIDITY</Text>
                            <Sparkles size={14} color="rgba(255,255,255,0.8)" />
                        </View>
                        <Wallet color="#FFFFFF" size={20} />
                    </View>
                    <AnimatedValue
                        value={balance}
                        symbol={symbol}
                        style={[styles.balanceText, { color: '#FFFFFF' }]}
                    />
                    <View style={styles.statsStrip}>
                        <View style={[styles.statPill, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                            <TrendingUp size={14} color="#66BB6A" />
                            <AnimatedValue
                                value={income}
                                symbol={"+" + symbol}
                                style={[styles.statValue, { color: '#66BB6A' }]}
                            />
                        </View>
                        <View style={[styles.statPill, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                            <TrendingDown size={14} color="#F44336" />
                            <AnimatedValue
                                value={expense}
                                symbol={"-" + symbol}
                                style={[styles.statValue, { color: '#F44336' }]}
                            />
                        </View>
                    </View>
                    <View style={styles.accentMoney}>
                        <DollarSign size={80} color="rgba(255,255,255,0.05)" style={{ transform: [{ rotate: '15deg' }] }} />
                    </View>
                </Animated.View>

                {/* Quick Actions */}
                <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.shortcuts}>
                    <TouchableOpacity style={styles.shortcutItem} onPress={() => navigation.navigate('AddTransaction')}>
                        <View style={[styles.shortcutIcon, { backgroundColor: colors.primaryContainer }]}>
                            <Plus color={colors.primary} size={24} />
                        </View>
                        <Text style={[styles.shortcutLabel, { color: colors.onSurface }]}>Flow</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.shortcutItem} onPress={() => navigation.navigate('DebtTab')}>
                        <View style={[styles.shortcutIcon, { backgroundColor: colors.card }]}>
                            <DebtIcon color={colors.primary} size={24} />
                        </View>
                        <Text style={[styles.shortcutLabel, { color: colors.onSurface }]}>Debt</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.shortcutItem} onPress={() => navigation.navigate('ReportsTab')}>
                        <View style={[styles.shortcutIcon, { backgroundColor: colors.card }]}>
                            <PieIcon color={colors.primary} size={24} />
                        </View>
                        <Text style={[styles.shortcutLabel, { color: colors.onSurface }]}>Report</Text>
                    </TouchableOpacity>
                </Animated.View>

                {/* Analytics Snapshot */}
                <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Expense Analytics</Text>
                    <View style={[styles.timeChip, { backgroundColor: colors.card }]}>
                        <Text style={[styles.timeText, { color: colors.primary }]}>WEEK</Text>
                    </View>
                </Animated.View>

                <Animated.View entering={FadeInUp.delay(500).duration(800)}>
                    <GlassCard style={styles.chartWrapper} cornerRadius={32}>
                        <LineChart
                            data={chartData}
                            height={160}
                            width={width - 80}
                            spacing={44}
                            initialSpacing={24}
                            color={colors.primary}
                            thickness={4}
                            hideRules
                            hideYAxisText
                            yAxisThickness={0}
                            xAxisThickness={0}
                            showValuesAsDataPointsText={true}
                            textColor={colors.onSurfaceVariant}
                            textShiftY={-12}
                            textShiftX={-4}
                            dataPointsColor={colors.primary}
                            dataPointsRadius={4}
                            xAxisLabelTextStyle={{ color: colors.outline, fontSize: 10 }}
                        />
                    </GlassCard>
                </Animated.View>

                {/* Recent Activity */}
                <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.recentHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>Recent Streams</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('TransactionsTab')}>
                        <Text style={{ color: colors.primary, fontWeight: 'bold' }}>See All</Text>
                    </TouchableOpacity>
                </Animated.View>

                <View style={styles.recentFlows}>
                    {transactions.map((t, i) => {
                        const IconComp = CATEGORY_ICONS[t.icon] || CATEGORY_ICONS.tag || Target;
                        return (
                            <View key={i}>
                                <GlassCard style={styles.txCard} cornerRadius={20}>
                                    <View style={styles.txInner}>
                                        <View style={[styles.txIconBox, { backgroundColor: t.category_color + '20' }]}>
                                            <IconComp color={t.category_color} size={20} />
                                        </View>
                                        <View style={styles.txInfo}>
                                            <Text style={[styles.txTitle, { color: colors.onSurface }]}>{t.category_name}</Text>
                                            <Text style={[styles.txDate, { color: colors.onSurfaceVariant }]}>{format(new Date(t.date), 'MMM dd')}</Text>
                                        </View>
                                        <Text style={[styles.txValue, { color: t.type === 'income' ? '#146C2E' : colors.onSurface }]}>
                                            {t.type === 'income' ? '+' : '-'}{symbol}{t.amount.toLocaleString()}
                                        </Text>
                                    </View>
                                </GlassCard>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>

            <TouchableOpacity
                style={[styles.mainFab, { backgroundColor: colors.primary }]}
                onPress={() => navigation.navigate('AddTransaction')}
            >
                <Plus color={colors.onPrimary} size={32} />
            </TouchableOpacity>

            <Modal visible={isMenuOpen} transparent onRequestClose={() => setIsMenuOpen(false)}>
                <View style={styles.modalBackdrop}>
                    <Animated.View
                        entering={FadeIn.duration(300)}
                        exiting={FadeOut.duration(300)}
                        style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.6)' }]}
                    />
                    <Animated.View
                        entering={SlideInLeft.duration(300)}
                        exiting={SlideOutLeft.duration(300)}
                        style={[styles.sidebar, { backgroundColor: colors.background }]}
                    >
                        <View style={styles.sidebarHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Image
                                    source={require('../../assets/icon.png')}
                                    style={{ width: 32, height: 32, marginRight: 12, borderRadius: 8 }}
                                />
                                <Text style={[styles.brand, { color: colors.onSurface }]}>Budgeto</Text>
                            </View>
                            <TouchableOpacity onPress={() => setIsMenuOpen(false)}>
                                <X color={colors.onSurface} size={28} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.sidebarMenu}>
                            <MenuItem icon={User} label="My Profile" route="Profile" />
                            <MenuItem icon={CalIcon} label="Calendar View" route="Calendar" />
                            <MenuItem icon={DebtIcon} label="Debt Center" tab="DebtTab" />
                            <MenuItem icon={PieIcon} label="Visual Reports" tab="ReportsTab" />
                            <MenuItem icon={ReceiptText} label="All Flows" tab="TransactionsTab" />
                            <MenuItem icon={Palette} label="Category Hub" route="ManageCategories" />
                            <MenuItem icon={Shield} label="Security Center" tab="SettingsTab" />
                        </View>

                        <View style={styles.sidebarFooter}>
                            <View style={[styles.proBanner, { backgroundColor: colors.card }]}>
                                <Sparkles color={colors.primary} size={20} />
                                <Text style={{ color: colors.onSurface, fontSize: 13, fontWeight: 'bold' }}>Stable V2.2</Text>
                            </View>
                        </View>
                    </Animated.View>
                    <TouchableOpacity
                        style={{ flex: 1 }}
                        activeOpacity={1}
                        onPress={() => setIsMenuOpen(false)}
                    />
                </View>
            </Modal>

            <ModalAlert
                visible={alertConfig.visible}
                title={alertConfig.title}
                message={alertConfig.message}
                type={alertConfig.type}
                onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingBottom: 120 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 60 },
    menuTrigger: { padding: 4 },
    userName: { fontSize: 24, fontWeight: '400', letterSpacing: -0.8 },
    profileBox: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
    avatar: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
    assetCard: { margin: 20, padding: 32, borderRadius: 36, elevation: 8, overflow: 'hidden' },
    accentMoney: { position: 'absolute', right: -20, bottom: -20, opacity: 0.1 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    cardTag: { fontSize: 12, fontWeight: '700', letterSpacing: 1.5 },
    balanceText: { fontSize: 42, fontWeight: '500', marginBottom: 28, letterSpacing: -1 },
    statsStrip: { flexDirection: 'row', gap: 12 },
    statPill: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    statValue: { fontSize: 14, fontWeight: '600' },
    shortcuts: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, marginBottom: 40 },
    shortcutItem: { alignItems: 'center', gap: 8 },
    shortcutIcon: { width: 66, height: 66, borderRadius: 33, justifyContent: 'center', alignItems: 'center' },
    shortcutLabel: { fontSize: 12, fontWeight: '500' },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, marginBottom: 16 },
    sectionTitle: { fontSize: 20, fontWeight: '400' },
    timeChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
    timeText: { fontSize: 12, fontWeight: '700' },
    chartWrapper: { marginHorizontal: 20, padding: 0 },
    recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginHorizontal: 24, marginTop: 32, marginBottom: 16 },
    recentFlows: { gap: 0 },
    txCard: { marginHorizontal: 20, marginBottom: 12, padding: 0 },
    txInner: { flexDirection: 'row', alignItems: 'center' },
    txIconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    txInfo: { flex: 1 },
    txTitle: { fontSize: 16, fontWeight: '500' },
    txDate: { fontSize: 13, marginTop: 2 },
    txValue: { fontSize: 16, fontWeight: '600' },
    mainFab: { position: 'absolute', bottom: 30, right: 20, width: 64, height: 64, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 8 },
    modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'row' },
    sidebar: { width: '80%', height: '100%', padding: 24, paddingTop: 64 },
    sidebarHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 48 },
    brand: { fontSize: 28, fontWeight: '400', letterSpacing: -1 },
    sidebarMenu: { gap: 8 },
    menuItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 20 },
    menuIconContainer: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 18 },
    menuText: { fontSize: 18, fontWeight: '400' },
    sidebarFooter: { position: 'absolute', bottom: 40, left: 24, right: 24 },
    proBanner: { padding: 20, borderRadius: 24, flexDirection: 'row', gap: 12, alignItems: 'center' }
});

export default Dashboard;
