import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Dimensions, Platform, Modal } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import { Wallet, TrendingUp, TrendingDown, Plus, Menu, X, Landmark, PieChart as PieIcon, Shield, Info, Target, Landmark as DebtIcon, ReceiptText, History, User, Calendar as CalIcon, Sparkles } from 'lucide-react-native';
import { dbService } from '../database/db';
import * as Haptics from 'expo-haptics';
import { format, subDays } from 'date-fns';
import GlassCard from '../components/GlassCard';

const { width } = Dimensions.get('window');

const Dashboard = ({ navigation }: any) => {
    const { theme, currency } = useTheme();
    const [balance, setBalance] = useState(0);
    const [income, setIncome] = useState(0);
    const [expense, setExpense] = useState(0);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [chartData, setChartData] = useState<any[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    };

    const isDark = theme === 'dark';

    const MenuItem = ({ icon: Icon, label, route, tab, alertText }: any) => (
        <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
                setIsMenuOpen(false);
                if (tab) navigation.navigate(tab);
                else if (route) navigation.navigate(route);
                else if (alertText) alert(alertText);
            }}
        >
            <View style={[styles.menuIconContainer, { backgroundColor: isDark ? '#2B2930' : '#F3EDF7' }]}>
                <Icon color={isDark ? '#D0BCFF' : '#6750A4'} size={22} />
            </View>
            <Text style={[styles.menuText, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>{label}</Text>
        </TouchableOpacity>
    );

    return (
        <View style={{ flex: 1, backgroundColor: isDark ? '#141218' : '#F8F9FA' }}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => setIsMenuOpen(true)} style={styles.menuTrigger}>
                        <Menu color={isDark ? '#E6E1E5' : '#1C1B1F'} size={28} />
                    </TouchableOpacity>
                    <Text style={[styles.userName, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>Budgeto Hub</Text>
                    <TouchableOpacity
                        style={styles.profileBox}
                        onPress={() => navigation.navigate('Profile')}
                    >
                        <View style={[styles.avatar, { backgroundColor: isDark ? '#D0BCFF' : '#6750A4' }]}>
                            <Text style={{ color: isDark ? '#381E72' : '#FFFFFF', fontWeight: 'bold' }}>JD</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Balance Card */}
                <View style={[styles.assetCard, { backgroundColor: '#6750A4' }]}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardTag, { color: 'rgba(255,255,255,0.7)' }]}>NET LIQUIDITY</Text>
                        <Wallet color="#FFFFFF" size={20} />
                    </View>
                    <Text style={[styles.balanceText, { color: '#FFFFFF' }]}>
                        {symbol}{balance.toLocaleString()}
                    </Text>
                    <View style={styles.statsStrip}>
                        <View style={[styles.statPill, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                            <TrendingUp size={14} color="#A5D6A7" />
                            <Text style={[styles.statValue, { color: '#A5D6A7' }]}>+{symbol}{income.toLocaleString()}</Text>
                        </View>
                        <View style={[styles.statPill, { backgroundColor: 'rgba(255,255,255,0.1)' }]}>
                            <TrendingDown size={14} color="#EF9A9A" />
                            <Text style={[styles.statValue, { color: '#EF9A9A' }]}>-{symbol}{expense.toLocaleString()}</Text>
                        </View>
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.shortcuts}>
                    <TouchableOpacity style={styles.shortcutItem} onPress={() => navigation.navigate('AddTransaction')}>
                        <View style={[styles.shortcutIcon, { backgroundColor: isDark ? '#381E72' : '#EADDFF' }]}>
                            <Plus color={isDark ? '#D0BCFF' : '#21005D'} size={24} />
                        </View>
                        <Text style={[styles.shortcutLabel, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>Flow</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.shortcutItem} onPress={() => navigation.navigate('DebtTab')}>
                        <View style={[styles.shortcutIcon, { backgroundColor: isDark ? '#1D1B20' : '#F3EDF7' }]}>
                            <DebtIcon color={isDark ? '#D0BCFF' : '#6750A4'} size={24} />
                        </View>
                        <Text style={[styles.shortcutLabel, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>Debts</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.shortcutItem} onPress={() => navigation.navigate('Calendar')}>
                        <View style={[styles.shortcutIcon, { backgroundColor: isDark ? '#1D1B20' : '#F3EDF7' }]}>
                            <CalIcon color={isDark ? '#D0BCFF' : '#6750A4'} size={24} />
                        </View>
                        <Text style={[styles.shortcutLabel, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>Calendar</Text>
                    </TouchableOpacity>
                </View>

                {/* Analytics Snapshot */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>Expense Analytics</Text>
                    <View style={[styles.timeChip, { backgroundColor: isDark ? '#2B2930' : '#F3EDF7' }]}>
                        <Text style={[styles.timeText, { color: isDark ? '#D0BCFF' : '#6750A4' }]}>WEEK</Text>
                    </View>
                </View>

                <GlassCard style={styles.chartWrapper} cornerRadius={32}>
                    <LineChart
                        data={chartData}
                        height={160}
                        width={width - 80}
                        spacing={44}
                        initialSpacing={24}
                        color={isDark ? '#D0BCFF' : '#6750A4'}
                        thickness={4}
                        hideRules
                        hideYAxisText
                        yAxisThickness={0}
                        xAxisThickness={0}
                        showValuesAsDataPointsText={true}
                        textColor={isDark ? '#CAC4D0' : '#49454F'}
                        textShiftY={-12}
                        textShiftX={-4}
                        dataPointsColor={isDark ? '#D0BCFF' : '#6750A4'}
                        dataPointsRadius={4}
                        xAxisLabelTextStyle={{ color: isDark ? '#938F99' : '#79747E', fontSize: 10 }}
                    />
                </GlassCard>

                {/* Recent Activity */}
                <View style={styles.recentHeader}>
                    <Text style={[styles.sectionTitle, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>Recent Streams</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('TransactionsTab')}>
                        <Text style={{ color: isDark ? '#D0BCFF' : '#6750A4', fontWeight: 'bold' }}>See All</Text>
                    </TouchableOpacity>
                </View>

                {transactions.map((t, i) => (
                    <GlassCard key={i} style={styles.txCard} cornerRadius={20}>
                        <View style={styles.txInner}>
                            <View style={[styles.txIconBox, { backgroundColor: t.category_color + '20' }]}>
                                <Target color={t.category_color} size={20} />
                            </View>
                            <View style={styles.txInfo}>
                                <Text style={[styles.txTitle, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>{t.category_name}</Text>
                                <Text style={[styles.txDate, { color: isDark ? '#CAC4D0' : '#49454F' }]}>{format(new Date(t.date), 'MMM dd')}</Text>
                            </View>
                            <Text style={[styles.txValue, { color: t.type === 'income' ? '#146C2E' : (isDark ? '#E6E1E5' : '#1C1B1F') }]}>
                                {t.type === 'income' ? '+' : '-'}{symbol}{t.amount.toLocaleString()}
                            </Text>
                        </View>
                    </GlassCard>
                ))}
            </ScrollView>

            <TouchableOpacity
                style={[styles.mainFab, { backgroundColor: isDark ? '#D0BCFF' : '#6750A4' }]}
                onPress={() => navigation.navigate('AddTransaction')}
            >
                <Plus color={isDark ? '#381E72' : '#FFFFFF'} size={32} />
            </TouchableOpacity>

            <Modal visible={isMenuOpen} transparent animationType="slide">
                <View style={styles.modalBackdrop}>
                    <View style={[styles.sidebar, { backgroundColor: isDark ? '#141218' : '#FFFFFF' }]}>
                        <View style={styles.sidebarHeader}>
                            <Text style={[styles.brand, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>Budgeto</Text>
                            <TouchableOpacity onPress={() => setIsMenuOpen(false)}>
                                <X color={isDark ? '#E6E1E5' : '#1C1B1F'} size={28} />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.sidebarMenu}>
                            <MenuItem icon={User} label="My Profile" route="Profile" />
                            <MenuItem icon={CalIcon} label="Calendar View" route="Calendar" />
                            <MenuItem icon={DebtIcon} label="Debt Center" tab="DebtTab" />
                            <MenuItem icon={PieIcon} label="Visual Reports" tab="ReportsTab" />
                            <MenuItem icon={ReceiptText} label="History Log" tab="TransactionsTab" />
                            <MenuItem icon={Shield} label="Security Center" tab="SettingsTab" />
                        </View>

                        <View style={styles.sidebarFooter}>
                            <View style={[styles.proBanner, { backgroundColor: isDark ? '#2B2930' : '#EADDFF' }]}>
                                <Sparkles color={isDark ? '#D0BCFF' : '#6750A4'} size={20} />
                                <Text style={{ color: isDark ? '#E6E1E5' : '#1C1B1F', fontSize: 13, fontWeight: 'bold' }}>Stable V2.2</Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => setIsMenuOpen(false)} />
                </View>
            </Modal>
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
    assetCard: { margin: 20, padding: 32, borderRadius: 36, elevation: 8 },
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
