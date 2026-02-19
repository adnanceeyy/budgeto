import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Platform, TextInput } from 'react-native';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { useTheme } from '../theme/ThemeContext';
import { ColorPresets } from '../theme/colors';
import Background from '../components/Background';
import { dbService } from '../database/db';
import { Search, ChevronLeft, Trash2, Calendar, Filter, X, Target, Plus } from 'lucide-react-native';
import { CATEGORY_ICONS } from '../utils/iconLibrary';
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

    const renderItem = ({ item, index }: { item: any, index: number }) => {
        const IconComp = CATEGORY_ICONS[item.icon] || CATEGORY_ICONS.tag || Target;
        return (
            <Animated.View entering={FadeInDown.delay(index * 50).duration(400)} layout={Layout.springify()}>
                <TouchableOpacity
                    style={[styles.txItem, { backgroundColor: colors.card }]}
                    onPress={() => navigation.navigate('AddTransaction', { transaction: item })}
                >
                    <View style={[styles.iconBox, { backgroundColor: item.category_color + '20' }]}>
                        <IconComp size={20} color={item.category_color} />
                    </View>
                    <View style={styles.details}>
                        <Text style={[styles.catName, { color: colors.onSurface }]}>{item.category_name || 'General'}</Text>
                        <Text style={[styles.date, { color: colors.onSurfaceVariant }]}>{format(new Date(item.date), 'MMM dd, yyyy')}</Text>
                        {item.note ? <Text style={[styles.note, { color: colors.onSurfaceVariant }]}>{item.note}</Text> : null}
                    </View>
                    <View style={styles.amountBox}>
                        <Text style={[styles.amount, { color: item.type === 'income' ? '#146C2E' : colors.onSurface }]}>
                            {item.type === 'income' ? '+' : '-'}{symbol}{item.amount.toLocaleString()}
                        </Text>
                        <TouchableOpacity onPress={() => confirmDelete(item.id)} style={styles.deleteBtn}>
                            <Trash2 size={16} color={colors.error || '#B3261E'} />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        );
    };

    return (
        <Background>
            <View style={styles.container}>
                {!isSearching ? (
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                            <ChevronLeft color={colors.onSurface} size={24} />
                        </TouchableOpacity>
                        <Text style={[styles.title, { color: colors.onSurface }]}>All Flows</Text>
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                            <TouchableOpacity onPress={() => setIsSearching(true)} style={styles.headerBtn}>
                                <Search color={colors.onSurface} size={24} />
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => navigation.navigate('AddTransaction')} style={styles.headerBtn}>
                                <Plus color={colors.onSurface} size={24} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View style={[styles.searchBar, { backgroundColor: colors.card }]}>
                        <Search color={colors.onSurfaceVariant} size={20} />
                        <TextInput
                            style={[styles.searchInput, { color: colors.onSurface }]}
                            placeholder="Search flows..."
                            placeholderTextColor={colors.onSurfaceVariant}
                            autoFocus
                            value={searchQuery}
                            onChangeText={handleSearch}
                        />
                        <TouchableOpacity onPress={() => { setIsSearching(false); handleSearch(''); }}>
                            <X color={colors.onSurface} size={20} />
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
    txItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 20, marginBottom: 12 },
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
