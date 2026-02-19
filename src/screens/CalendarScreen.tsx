import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import Background from '../components/Background';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, isWithinInterval, isBefore } from 'date-fns';
import { ChevronLeft, ChevronRight, ArrowUpRight, ArrowDownLeft, Calendar as CalendarIcon, Filter } from 'lucide-react-native';
import { dbService } from '../database/db';

const { width } = Dimensions.get('window');

const CalendarScreen = ({ navigation }: any) => {
    const { theme, currency } = useTheme();
    const isDark = theme === 'dark';
    const [currentDate, setCurrentDate] = useState(new Date());
    const [rangeStart, setRangeStart] = useState<Date | null>(new Date());
    const [rangeEnd, setRangeEnd] = useState<Date | null>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [monthlyData, setMonthlyData] = useState<{ [key: string]: { income: number; expense: number } }>({});

    const currencySymbols: { [key: string]: string } = {
        'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥'
    };
    const symbol = currencySymbols[currency] || '₹';

    useEffect(() => {
        loadData();
    }, [currentDate]);

    const loadData = async () => {
        const txs = await dbService.getTransactions();
        setTransactions(txs);

        const data: { [key: string]: { income: number; expense: number } } = {};
        txs.forEach((t: any) => {
            const dateKey = format(new Date(t.date), 'yyyy-MM-dd');
            if (!data[dateKey]) data[dateKey] = { income: 0, expense: 0 };
            if (t.type === 'income') data[dateKey].income += t.amount;
            else data[dateKey].expense += t.amount;
        });
        setMonthlyData(data);
    };

    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

    const handleDatePress = (day: Date) => {
        if (!rangeStart || (rangeStart && rangeEnd)) {
            setRangeStart(day);
            setRangeEnd(null);
        } else {
            if (isBefore(day, rangeStart)) {
                setRangeStart(day);
                setRangeEnd(null);
            } else if (isSameDay(day, rangeStart)) {
                setRangeStart(day);
                setRangeEnd(null);
            } else {
                setRangeEnd(day);
            }
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                <ChevronLeft color={isDark ? '#E6E1E5' : '#1C1B1F'} size={24} />
            </TouchableOpacity>
            <View style={styles.monthHeader}>
                <TouchableOpacity onPress={prevMonth}><ChevronLeft color={isDark ? '#D0BCFF' : '#6750A4'} size={24} /></TouchableOpacity>
                <Text style={[styles.monthText, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>{format(currentDate, 'MMMM yyyy')}</Text>
                <TouchableOpacity onPress={nextMonth}><ChevronRight color={isDark ? '#D0BCFF' : '#6750A4'} size={24} /></TouchableOpacity>
            </View>
            <View style={{ width: 40 }} />
        </View>
    );

    const renderCells = () => {
        const monthStart = startOfMonth(currentDate);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });
        const rows: any[] = [];
        let days: any[] = [];

        calendarDays.forEach((day, i) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayData = monthlyData[dateKey];
            const isStart = rangeStart && isSameDay(day, rangeStart);
            const isEnd = rangeEnd && isSameDay(day, rangeEnd);
            const isInRange = rangeStart && rangeEnd && isWithinInterval(day, { start: rangeStart, end: rangeEnd });
            const isCurrentMonth = isSameMonth(day, monthStart);

            days.push(
                <TouchableOpacity
                    key={i}
                    style={[
                        styles.cell,
                        isInRange && { backgroundColor: isDark ? '#4F378B40' : '#EADDFF80' },
                        isStart && { backgroundColor: isDark ? '#D0BCFF' : '#6750A4', borderTopLeftRadius: 12, borderBottomLeftRadius: 12 },
                        isEnd && { backgroundColor: isDark ? '#D0BCFF' : '#6750A4', borderTopRightRadius: 12, borderBottomRightRadius: 12 },
                        isStart && isEnd && { borderRadius: 12 }
                    ]}
                    onPress={() => handleDatePress(day)}
                >
                    <Text style={[
                        styles.cellText,
                        { color: isCurrentMonth ? (isDark ? '#E6E1E5' : '#1C1B1F') : (isDark ? '#49454F' : '#CAC4D0') },
                        (isStart || isEnd) && { color: isDark ? '#381E72' : '#FFFFFF', fontWeight: 'bold' },
                        !isStart && !isEnd && isToday(day) && { color: isDark ? '#D0BCFF' : '#6750A4', fontWeight: 'bold' }
                    ]}>
                        {format(day, 'd')}
                    </Text>
                    {dayData && (
                        <View style={styles.indicators}>
                            {dayData.income > 0 && <View style={[styles.dot, { backgroundColor: '#146C2E' }]} />}
                            {dayData.expense > 0 && <View style={[styles.dot, { backgroundColor: '#B3261E' }]} />}
                        </View>
                    )}
                </TouchableOpacity>
            );

            if ((i + 1) % 7 === 0) {
                rows.push(<View key={i} style={styles.row}>{days}</View>);
                days = [];
            }
        });

        return <View style={styles.calendarBody}>{rows}</View>;
    };

    const selectedTransactions = transactions.filter(t => {
        const d = new Date(t.date);
        if (rangeStart && rangeEnd) {
            return isWithinInterval(d, { start: rangeStart, end: rangeEnd });
        }
        if (rangeStart) {
            return isSameDay(d, rangeStart);
        }
        return false;
    });

    return (
        <Background>
            {renderHeader()}
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <View style={[styles.calendarCard, { backgroundColor: isDark ? '#1D1B20' : '#F7F2FA' }]}>
                    <View style={styles.daysRow}>
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                            <Text key={i} style={[styles.dayLabel, { color: isDark ? '#CAC4D0' : '#49454F' }]}>{d}</Text>
                        ))}
                    </View>
                    {renderCells()}

                    <View style={styles.rangeInfo}>
                        <CalendarIcon size={14} color={isDark ? '#CAC4D0' : '#49454F'} />
                        <Text style={[styles.rangeText, { color: isDark ? '#CAC4D0' : '#49454F' }]}>
                            {rangeStart ? format(rangeStart, 'MMM d') : 'Select start'}
                            {rangeEnd ? ` — ${format(rangeEnd, 'MMM d')}` : ''}
                        </Text>
                        {(rangeStart || rangeEnd) && (
                            <TouchableOpacity onPress={() => { setRangeStart(new Date()); setRangeEnd(null); }}>
                                <Text style={{ color: isDark ? '#D0BCFF' : '#6750A4', fontSize: 12, fontWeight: 'bold' }}>CLEAR</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                <View style={styles.txSection}>
                    <View style={styles.txHeader}>
                        <Text style={[styles.sectionTitle, { color: isDark ? '#D0BCFF' : '#6750A4' }]}>
                            {rangeStart && rangeEnd ? 'Filtered Flows' : (rangeStart ? format(rangeStart, 'PPP') : 'Select a date')}
                        </Text>
                        {selectedTransactions.length > 0 && (
                            <View style={[styles.countBadge, { backgroundColor: isDark ? '#4F378B' : '#EADDFF' }]}>
                                <Text style={[styles.countText, { color: isDark ? '#D0BCFF' : '#21005D' }]}>{selectedTransactions.length}</Text>
                            </View>
                        )}
                    </View>

                    {selectedTransactions.length === 0 ? (
                        <View style={styles.empty}>
                            <Text style={{ color: isDark ? '#CAC4D0' : '#49454F' }}>No flows in this selection</Text>
                        </View>
                    ) : (
                        selectedTransactions.map((item) => (
                            <View key={item.id} style={[styles.txItem, { backgroundColor: isDark ? '#1D1B20' : '#F7F2FA' }]}>
                                <View style={[styles.iconBox, { backgroundColor: item.category_color + '20' }]}>
                                    {item.type === 'income' ? <ArrowDownLeft color="#146C2E" size={20} /> : <ArrowUpRight color="#B3261E" size={20} />}
                                </View>
                                <View style={styles.details}>
                                    <Text style={[styles.catName, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>{item.category_name}</Text>
                                    <Text style={[styles.note, { color: isDark ? '#CAC4D0' : '#49454F' }]}>
                                        {format(new Date(item.date), 'MMM d')} • {item.note || 'No note'}
                                    </Text>
                                </View>
                                <Text style={[styles.amount, { color: item.type === 'income' ? '#146C2E' : (isDark ? '#E6E1E5' : '#1C1B1F') }]}>
                                    {item.type === 'income' ? '+' : '-'}{symbol}{item.amount.toLocaleString()}
                                </Text>
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </Background>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { padding: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, paddingTop: 60 },
    backBtn: { padding: 4 },
    monthHeader: { flexDirection: 'row', alignItems: 'center', gap: 20 },
    monthText: { fontSize: 18, fontWeight: '600' },
    calendarCard: { borderRadius: 28, padding: 16, marginBottom: 24, elevation: 2 },
    daysRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
    dayLabel: { fontSize: 12, fontWeight: '700', width: width / 9, textAlign: 'center' },
    calendarBody: { gap: 4 },
    row: { flexDirection: 'row', justifyContent: 'space-around' },
    cell: { width: width / 9, height: 50, justifyContent: 'center', alignItems: 'center', position: 'relative' },
    cellText: { fontSize: 16 },
    indicators: { position: 'absolute', bottom: 4, flexDirection: 'row', gap: 2 },
    dot: { width: 4, height: 4, borderRadius: 2 },
    rangeInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(0,0,0,0.05)' },
    rangeText: { fontSize: 13, flex: 1 },
    txSection: { marginBottom: 40 },
    txHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
    sectionTitle: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2 },
    countBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
    countText: { fontSize: 12, fontWeight: 'bold' },
    txItem: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 20, marginBottom: 12 },
    iconBox: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    details: { flex: 1 },
    catName: { fontSize: 16, fontWeight: '500' },
    note: { fontSize: 13, marginTop: 2 },
    amount: { fontSize: 16, fontWeight: '700' },
    empty: { padding: 40, alignItems: 'center' }
});

export default CalendarScreen;
