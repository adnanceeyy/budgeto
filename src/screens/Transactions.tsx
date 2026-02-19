import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Platform, TextInput } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import Background from '../components/Background';
import { dbService } from '../database/db';
import { Search, ChevronLeft, Trash2, Calendar, Filter, X } from 'lucide-react-native';
import { format } from 'date-fns';
import * as Haptics from 'expo-haptics';
import ModalAlert from '../components/ModalAlert';

const Transactions = ({ navigation }: any) => {
    const { colors, theme, currency } = useTheme();
    const [transactions, setTransactions] = useState<any[]>([]);
    const [filteredTxs, setFilteredTxs] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [deleteConfig, setDeleteConfig] = useState<{ visible: boolean; id: number | null }>({
        visible: false,
        id: null
    });

    const isDark = theme === 'dark';

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
        const data = await dbService.getTransactions();
        setTransactions(data);
        setFilteredTxs(data);
    };

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (!text.trim()) {
            setFilteredTxs(transactions);
            return;
        }
        const filtered = transactions.filter(t =>
            t.category_name?.toLowerCase().includes(text.toLowerCase()) ||
            t.note?.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredTxs(filtered);
    };

    const confirmDelete = (id: number) => {
        setDeleteConfig({ visible: true, id });
    };

    const handleDelete = async () => {
        if (deleteConfig.id) {
            await dbService.deleteTransaction(deleteConfig.id);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => { });
            setDeleteConfig({ visible: false, id: null });
            loadData();
        }
    };

    const renderItem = ({ item }: { item: any }) => (
        <View style={[styles.txItem, { backgroundColor: isDark ? '#1D1B20' : '#F7F2FA' }]}>
            <View style={[styles.iconBox, { backgroundColor: item.category_color + '20' }]}>
                <View style={[styles.dot, { backgroundColor: item.category_color }]} />
            </View>
            <View style={styles.details}>
                <Text style={[styles.catName, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>{item.category_name || 'General'}</Text>
                <Text style={[styles.date, { color: isDark ? '#CAC4D0' : '#49454F' }]}>{format(new Date(item.date), 'MMM dd, yyyy')}</Text>
                {item.note ? <Text style={[styles.note, { color: isDark ? '#CAC4D0' : '#49454F' }]}>{item.note}</Text> : null}
            </View>
            <View style={styles.amountBox}>
                <Text style={[styles.amount, { color: item.type === 'income' ? '#146C2E' : (isDark ? '#E6E1E5' : '#1C1B1F') }]}>
                    {item.type === 'income' ? '+' : '-'}{symbol}{item.amount.toLocaleString()}
                </Text>
                <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.deleteBtn}>
                    <Trash2 size={16} color={isDark ? '#F2B8B5' : '#B3261E'} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <Background>
            <View style={styles.container}>
                {!isSearching ? (
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                            <ChevronLeft color={isDark ? '#E6E1E5' : '#1C1B1F'} size={24} />
                        </TouchableOpacity>
                        <Text style={[styles.title, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>Flow History</Text>
                        <TouchableOpacity onPress={() => setIsSearching(true)} style={styles.headerBtn}>
                            <Search color={isDark ? '#E6E1E5' : '#1C1B1F'} size={24} />
                        </TouchableOpacity>
                    </View>
                ) : (
                    <View style={[styles.searchBar, { backgroundColor: isDark ? '#2B2930' : '#F3EDF7' }]}>
                        <Search color={isDark ? '#CAC4D0' : '#49454F'} size={20} />
                        <TextInput
                            style={[styles.searchInput, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}
                            placeholder="Search flows..."
                            placeholderTextColor={isDark ? '#938F99' : '#79747E'}
                            autoFocus
                            value={searchQuery}
                            onChangeText={handleSearch}
                        />
                        <TouchableOpacity onPress={() => { setIsSearching(false); handleSearch(''); }}>
                            <X color={isDark ? '#E6E1E5' : '#1C1B1F'} size={20} />
                        </TouchableOpacity>
                    </View>
                )}

                <FlatList
                    data={filteredTxs}
                    renderItem={renderItem}
                    keyExtractor={item => item.id.toString()}
                    contentContainerStyle={styles.list}
                    showsVerticalScrollIndicator={false}
                    ListEmptyComponent={
                        <View style={styles.empty}>
                            <Calendar color={isDark ? '#49454F' : '#CAC4D0'} size={64} strokeWidth={1} />
                            <Text style={[styles.emptyText, { color: isDark ? '#CAC4D0' : '#49454F' }]}>No flow entries found</Text>
                        </View>
                    }
                />

                <ModalAlert
                    visible={deleteConfig.visible}
                    title="Delete Flow?"
                    message="This action will permanently remove this flow entry from your history."
                    type="confirm"
                    confirmText="Delete"
                    onClose={() => setDeleteConfig({ visible: false, id: null })}
                    onConfirm={handleDelete}
                />
            </View>
        </Background>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, paddingTop: 60 },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 24, gap: 16 },
    headerBtn: { padding: 8 },
    title: { fontSize: 24, fontWeight: '400', flex: 1, letterSpacing: -0.5 },
    searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 32, marginBottom: 24, gap: 12 },
    searchInput: { flex: 1, fontSize: 16, fontWeight: '400' },
    list: { paddingBottom: 100, paddingHorizontal: 16 },
    txItem: { flexDirection: 'row', alignItems: 'center', padding: 20, borderRadius: 28, marginBottom: 16 },
    iconBox: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    dot: { width: 10, height: 10, borderRadius: 5 },
    details: { flex: 1 },
    catName: { fontSize: 16, fontWeight: '600' },
    date: { fontSize: 13, marginTop: 4 },
    note: { fontSize: 14, marginTop: 4, fontStyle: 'italic', opacity: 0.8 },
    amountBox: { alignItems: 'flex-end', justifyContent: 'space-between', height: '100%' },
    amount: { fontSize: 17, fontWeight: '700' },
    deleteBtn: { padding: 8, marginTop: 8 },
    empty: { marginTop: 120, alignItems: 'center', gap: 16 },
    emptyText: { fontSize: 16, fontWeight: '500' }
});

export default Transactions;
