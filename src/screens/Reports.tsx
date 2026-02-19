import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions, Platform, TouchableOpacity, Modal } from 'react-native';
import { PieChart, BarChart } from 'react-native-gifted-charts';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import { dbService } from '../database/db';
import { Sparkles, ArrowLeft, TrendingUp, Filter, Calendar as CalIcon, ChevronDown, Check, TrendingDown } from 'lucide-react-native';
import Background from '../components/Background';
import GlassCard from '../components/GlassCard';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth, subMonths, isWithinInterval, startOfDay, endOfDay, startOfYear, endOfYear } from 'date-fns';

const { width } = Dimensions.get('window');

const Reports = ({ navigation }: any) => {
    const { theme, currency } = useTheme();
    const [pieData, setPieData] = useState<any[]>([]);
    const [barData, setBarData] = useState<any[]>([]);
    const [totalValue, setTotalValue] = useState(0);
    const [incomeTotal, setIncomeTotal] = useState(0);
    const [expenseTotal, setExpenseTotal] = useState(0);
    type FilterRangeType = 'Today' | 'This Week' | 'This Month' | 'Last Month' | 'This Year' | 'All Time';
    const [filterRange, setFilterRange] = useState<FilterRangeType>('This Month');
    const [reportType, setReportType] = useState<'expense' | 'income'>('expense');
    const [showFilterModal, setShowFilterModal] = useState(false);
    const isDark = theme === 'dark';

    const currencySymbols: { [key: string]: string } = {
        'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥'
    };
    const symbol = currencySymbols[currency] || '₹';

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', loadData);
        loadData();
        return unsubscribe;
    }, [navigation, theme, filterRange, reportType]);

    const loadData = async () => {
        let txs = await dbService.getTransactions();

        const now = new Date();
        let interval: { start: Date; end: Date } | null = null;

        if (filterRange === 'Today') {
            interval = { start: startOfDay(now), end: endOfDay(now) };
        } else if (filterRange === 'This Week') {
            interval = { start: startOfWeek(now), end: endOfWeek(now) };
        } else if (filterRange === 'This Month') {
            interval = { start: startOfMonth(now), end: endOfMonth(now) };
        } else if (filterRange === 'Last Month') {
            const lastMonth = subMonths(now, 1);
            interval = { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) };
        } else if (filterRange === 'This Year') {
            interval = { start: startOfYear(now), end: endOfYear(now) };
        }

        if (interval) {
            txs = txs.filter((t: any) => isWithinInterval(new Date(t.date), interval!));
        }

        const filteredTxs = txs.filter((t: any) => t.type === reportType);

        let total = 0;
        let incSum = 0;
        let expSum = 0;

        txs.forEach((t: any) => {
            if (t.type === 'income') incSum += t.amount;
            else expSum += t.amount;
        });

        setIncomeTotal(incSum);
        setExpenseTotal(expSum);

        const catMap: any = {};
        filteredTxs.forEach((t: any) => {
            total += t.amount;
            const name = t.category_name || 'Other';
            if (!catMap[name]) {
                catMap[name] = { value: 0, color: t.category_color || (isDark ? '#D0BCFF' : '#6750A4'), label: name };
            }
            catMap[name].value += t.amount;
        });
        setTotalValue(total);

        const pData = Object.values(catMap).sort((a: any, b: any) => b.value - a.value).map((item: any) => ({
            ...item,
            text: item.label,
        }));
        setPieData(pData.length > 0 ? pData : [{ value: 0, color: isDark ? '#2B2930' : '#E7E0EC', label: 'Empty' }]);

        // Generate Bar Chart Data based on Range
        let bData: any[] = [];
        if (filterRange === 'Today') {
            bData = [{
                value: filteredTxs.reduce((acc: number, t: any) => acc + t.amount, 0),
                label: format(now, 'MMM dd'),
                frontColor: reportType === 'income' ? '#A5D6A7' : (isDark ? '#F2B8B5' : '#B3261E')
            }];
        } else if (filterRange === 'This Year') {
            const months = Array.from({ length: 12 }, (_, i) => new Date(now.getFullYear(), i, 1));
            bData = months.map(m => {
                const monthTxs = txs.filter((t: any) => {
                    const d = new Date(t.date);
                    return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear() && t.type === reportType;
                });
                const sum = monthTxs.reduce((acc: number, t: any) => acc + t.amount, 0);
                return {
                    value: sum,
                    label: format(m, 'MMM')[0],
                    frontColor: reportType === 'income' ? '#A5D6A7' : (isDark ? '#F2B8B5' : '#B3261E'),
                    topLabelComponent: () => sum > 0 ? (
                        <Text style={{ color: isDark ? '#CAC4D0' : '#49454F', fontSize: 9, marginBottom: 4 }}>
                            {sum > 999 ? (sum / 1000).toFixed(0) + 'k' : sum.toFixed(0)}
                        </Text>
                    ) : null
                };
            });
        } else if (filterRange === 'All Time') {
            const months = Array.from({ length: 6 }, (_, i) => subMonths(now, 5 - i));
            bData = months.map(m => {
                const monthTxs = txs.filter((t: any) => {
                    const d = new Date(t.date);
                    return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear() && t.type === reportType;
                });
                const sum = monthTxs.reduce((acc: number, t: any) => acc + t.amount, 0);
                return {
                    value: sum,
                    label: format(m, 'MMM'),
                    frontColor: reportType === 'income' ? '#A5D6A7' : (isDark ? '#F2B8B5' : '#B3261E'),
                    topLabelComponent: () => sum > 0 ? (
                        <Text style={{ color: isDark ? '#CAC4D0' : '#49454F', fontSize: 9, marginBottom: 4 }}>
                            {sum > 999 ? (sum / 1000).toFixed(0) + 'k' : sum.toFixed(0)}
                        </Text>
                    ) : null
                };
            });
        } else {
            // Default to Daily view for Week/Month/Last Month
            const start = interval ? interval.start : subMonths(now, 1);
            const end = interval ? interval.end : now;
            const days = eachDayOfInterval({ start, end });

            // If too many days (e.g. Month), we might want to skip some labels or show every few days
            bData = days.map((day, index) => {
                const dayTxs = txs.filter((t: any) => isSameDay(new Date(t.date), day) && t.type === reportType);
                const sum = dayTxs.reduce((acc: number, t: any) => acc + t.amount, 0);
                const shouldShowLabel = days.length <= 7 || index % 5 === 0 || index === days.length - 1;

                return {
                    value: sum,
                    label: shouldShowLabel ? (days.length <= 7 ? format(day, 'E')[0] : format(day, 'd')) : '',
                    frontColor: reportType === 'income' ? '#A5D6A7' : (isDark ? '#F2B8B5' : '#B3261E'),
                    topLabelComponent: () => sum > 0 && days.length <= 15 ? (
                        <Text style={{ color: isDark ? '#CAC4D0' : '#49454F', fontSize: 9, marginBottom: 4 }}>
                            {sum > 999 ? (sum / 1000).toFixed(0) + 'k' : sum.toFixed(0)}
                        </Text>
                    ) : null
                };
            });
        }
        setBarData(bData);
    };

    const RangeOption = ({ label }: { label: any }) => (
        <TouchableOpacity
            style={[styles.filterOption, { borderBottomColor: isDark ? '#49454F' : '#E7E0EC' }]}
            onPress={() => {
                setFilterRange(label);
                setShowFilterModal(false);
            }}
        >
            <Text style={[styles.filterText, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>{label}</Text>
            {filterRange === label && <Check size={20} color={isDark ? '#D0BCFF' : '#6750A4'} />}
        </TouchableOpacity>
    );

    return (
        <Background>
            <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                        <ArrowLeft color={isDark ? '#E6E1E5' : '#1C1B1F'} size={24} />
                    </TouchableOpacity>
                    <Text style={[styles.title, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>Flow Analysis</Text>
                    <TouchableOpacity style={[styles.filterChip, { backgroundColor: isDark ? '#2B2930' : '#F3EDF7' }]} onPress={() => setShowFilterModal(true)}>
                        <Text style={[styles.filterChipText, { color: isDark ? '#D0BCFF' : '#6750A4' }]}>{filterRange}</Text>
                        <ChevronDown size={16} color={isDark ? '#D0BCFF' : '#6750A4'} />
                    </TouchableOpacity>
                </View>

                {/* Type Selector */}
                <View style={styles.typeSelector}>
                    <TouchableOpacity
                        style={[styles.typeBtn, reportType === 'expense' && { backgroundColor: isDark ? '#F2B8B5' : '#B3261E' }]}
                        onPress={() => setReportType('expense')}
                    >
                        <TrendingDown size={18} color={reportType === 'expense' ? (isDark ? '#601410' : '#FFFFFF') : (isDark ? '#F2B8B5' : '#B3261E')} />
                        <Text style={[styles.typeBtnText, { color: reportType === 'expense' ? (isDark ? '#601410' : '#FFFFFF') : (isDark ? '#F2B8B5' : '#B3261E') }]}>Expenses</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.typeBtn, reportType === 'income' && { backgroundColor: '#146C2E' }]}
                        onPress={() => setReportType('income')}
                    >
                        <TrendingUp size={18} color={reportType === 'income' ? '#FFFFFF' : '#146C2E'} />
                        <Text style={[styles.typeBtnText, { color: reportType === 'income' ? '#FFFFFF' : '#146C2E' }]}>Income</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.summaryRow}>
                    <GlassCard style={styles.sumCard}>
                        <Text style={[styles.sumLabel, { color: isDark ? '#CAC4D0' : '#49454F' }]}>
                            Net Balance • {filterRange}
                        </Text>
                        <Text style={[styles.sumValue, { color: (incomeTotal - expenseTotal) >= 0 ? '#146C2E' : '#B3261E' }]}>
                            {(incomeTotal - expenseTotal) >= 0 ? '+' : '-'}{symbol}{Math.abs(incomeTotal - expenseTotal).toLocaleString()}
                        </Text>
                    </GlassCard>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>
                        {reportType === 'income' ? 'Income' : 'Expense'} Composition
                    </Text>
                    <GlassCard style={styles.chartWrapper}>
                        <View style={styles.pieContainer}>
                            <PieChart
                                data={pieData}
                                donut
                                radius={width * 0.22}
                                innerRadius={width * 0.16}
                                innerCircleColor={'transparent'}
                                centerLabelComponent={() => (
                                    <View style={{ alignItems: 'center' }}>
                                        <Text style={{ color: isDark ? '#E6E1E5' : '#1C1B1F', fontSize: 20, fontWeight: '700' }}>
                                            {symbol}{totalValue > 999 ? (totalValue / 1000).toFixed(1) + 'k' : totalValue.toFixed(0)}
                                        </Text>
                                    </View>
                                )}
                            />
                        </View>
                        <View style={styles.legend}>
                            {pieData.map((d, i) => (
                                <View key={i} style={styles.legendRow}>
                                    <View style={[styles.dot, { backgroundColor: d.color }]} />
                                    <Text style={[styles.legendText, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>{d.label}</Text>
                                    <View style={styles.legendValueBox}>
                                        <Text style={[styles.legendValue, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>
                                            {totalValue > 0 ? ((d.value / totalValue) * 100).toFixed(0) : 0}%
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    </GlassCard>
                </View>

                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>Flow Density</Text>
                    <GlassCard style={styles.chartWrapper}>
                        <BarChart
                            data={barData}
                            barWidth={24}
                            spacing={20}
                            noOfSections={3}
                            barBorderRadius={8}
                            yAxisThickness={0}
                            xAxisThickness={0}
                            hideRules
                            hideYAxisText
                            yAxisTextStyle={{ color: isDark ? '#938F99' : '#79747E', fontSize: 10 }}
                            xAxisLabelTextStyle={{ color: isDark ? '#938F99' : '#79747E', fontSize: 10, fontWeight: '700' }}
                        />
                    </GlassCard>
                </View>
            </ScrollView>

            <Modal visible={showFilterModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalCard, { backgroundColor: isDark ? '#2B2930' : '#FFFFFF' }]}>
                        <Text style={[styles.modalTitle, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>Time Range</Text>
                        <RangeOption label="Today" />
                        <RangeOption label="This Week" />
                        <RangeOption label="This Month" />
                        <RangeOption label="Last Month" />
                        <RangeOption label="This Year" />
                        <RangeOption label="All Time" />
                        <TouchableOpacity style={styles.modalClose} onPress={() => setShowFilterModal(false)}>
                            <Text style={{ color: isDark ? '#D0BCFF' : '#6750A4', fontWeight: 'bold' }}>Close</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </Background>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingBottom: 110 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 60, gap: 16 },
    backBtn: { padding: 4 },
    title: { fontSize: 24, fontWeight: '400', flex: 1, letterSpacing: -0.5 },
    filterChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, gap: 8 },
    filterChipText: { fontSize: 14, fontWeight: '500' },
    typeSelector: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginBottom: 24 },
    typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 24, borderWidth: 1.5, borderColor: 'transparent' },
    typeBtnText: { fontSize: 14, fontWeight: '700' },
    summaryRow: { paddingHorizontal: 20, marginBottom: 32 },
    sumCard: { padding: 24 },
    sumLabel: { fontSize: 13, marginBottom: 4, fontWeight: '500' },
    sumValue: { fontSize: 32, fontWeight: '600' },
    section: { paddingHorizontal: 20, marginBottom: 32 },
    sectionTitle: { fontSize: 18, fontWeight: '500', marginBottom: 16, marginLeft: 4 },
    chartWrapper: { padding: 24, alignItems: 'center' },
    pieContainer: { alignItems: 'center', marginBottom: 28 },
    legend: { width: '100%', gap: 12 },
    legendRow: { flexDirection: 'row', alignItems: 'center' },
    dot: { width: 10, height: 10, borderRadius: 5, marginRight: 12 },
    legendText: { fontSize: 14, flex: 1, fontWeight: '400' },
    legendValueBox: { backgroundColor: 'rgba(0,0,0,0.05)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
    legendValue: { fontSize: 13, fontWeight: '700' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalCard: { borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 32, elevation: 12 },
    modalTitle: { fontSize: 20, fontWeight: '600', marginBottom: 24 },
    filterOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1 },
    filterText: { fontSize: 16 },
    modalClose: { marginTop: 32, alignItems: 'center', padding: 12 }
});

export default Reports;
