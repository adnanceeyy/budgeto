import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Platform, Modal, TouchableWithoutFeedback, Keyboard, FlatList } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Colors } from '../theme/colors';
import Background from '../components/Background';
import { X, Check, Target, FileText, ChevronRight, Plus, Trash2, Edit2, ShoppingCart, Coffee, Car, Home, Zap, Heart, Gift, Briefcase, DollarSign, Utensils, Smartphone, Globe } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { dbService } from '../database/db';
import ModalAlert from '../components/ModalAlert';

const ICONS: any = {
    shopping: ShoppingCart,
    coffee: Coffee,
    car: Car,
    home: Home,
    zap: Zap,
    heart: Heart,
    gift: Gift,
    work: Briefcase,
    money: DollarSign,
    food: Utensils,
    phone: Smartphone,
    tag: Target,
    globe: Globe
};

const AddTransaction = ({ navigation }: any) => {
    const { colors, theme, currency } = useTheme();
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [category, setCategory] = useState<any>(null);
    const [type, setType] = useState<'income' | 'expense'>('expense');
    const [categories, setCategories] = useState<any[]>([]);

    const [showCatModal, setShowCatModal] = useState(false);
    const [isEditingCat, setIsEditingCat] = useState(false);
    const [editingCatId, setEditingCatId] = useState<number | null>(null);
    const [newCatName, setNewCatName] = useState('');
    const [newCatIcon, setNewCatIcon] = useState('tag');
    const [showIconPicker, setShowIconPicker] = useState(false);

    const [alertConfig, setAlertConfig] = useState<{ visible: boolean; title: string; message: string; type: any; onConfirm?: () => void }>({
        visible: false,
        title: '',
        message: '',
        type: 'info'
    });

    const currencySymbols: { [key: string]: string } = {
        'INR': '₹', 'USD': '$', 'EUR': '€', 'GBP': '£', 'JPY': '¥'
    };
    const symbol = currencySymbols[currency] || '₹';

    useEffect(() => {
        loadCats();
    }, []);

    const loadCats = async () => {
        const cats = await dbService.getCategories();
        setCategories(cats);
        if (!category && cats.length > 0) setCategory(cats[0]);
    };

    const handleSave = async () => {
        const parsedAmount = parseFloat(amount.replace(/[^0-9.]/g, ''));
        if (isNaN(parsedAmount) || parsedAmount <= 0 || !category) {
            setAlertConfig({
                visible: true,
                title: 'Invalid Entry',
                message: 'Please enter a valid amount and select a flow category.',
                type: 'error'
            });
            return;
        }

        try {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy).catch(() => { });
            await dbService.addTransaction({
                type: type,
                amount: parsedAmount,
                category_id: category.id,
                note: note.trim(),
                date: new Date().toISOString()
            });
            navigation.goBack();
        } catch (error) {
            console.error("Save error:", error);
            setAlertConfig({
                visible: true,
                title: 'Error',
                message: 'Failed to record this flow. Please try again.',
                type: 'error'
            });
        }
    };

    const handleSaveCategory = async () => {
        if (!newCatName.trim()) return;

        if (isEditingCat && editingCatId) {
            const currentCat = categories.find(c => c.id === editingCatId);
            await dbService.updateCategory(editingCatId, {
                name: newCatName.trim(),
                icon: newCatIcon,
                color: currentCat?.color || '#6750A4',
                budget: currentCat?.budget || 0
            });
        } else {
            const colors_list = ['#6750A4', '#625B71', '#7D5260', '#146C2E', '#B3261E', '#D0BCFF'];
            const randomColor = colors_list[Math.floor(Math.random() * colors_list.length)];
            await dbService.addCategory({
                name: newCatName.trim(),
                icon: newCatIcon,
                color: randomColor,
                budget: 0
            });
        }

        resetCatModal();
        loadCats();
    };

    const handleDeleteCategory = (id: number) => {
        setAlertConfig({
            visible: true,
            title: 'Delete Category?',
            message: 'This will also delete all transactions in this category. Are you sure?',
            type: 'confirm',
            onConfirm: async () => {
                await dbService.deleteCategory(id);
                setAlertConfig(prev => ({ ...prev, visible: false }));
                if (category?.id === id) setCategory(null);
                loadCats();
            }
        });
    };

    const openEditCat = (cat: any) => {
        setNewCatName(cat.name);
        setNewCatIcon(cat.icon || 'tag');
        setEditingCatId(cat.id);
        setIsEditingCat(true);
        setShowCatModal(true);
    };

    const resetCatModal = () => {
        setNewCatName('');
        setNewCatIcon('tag');
        setIsEditingCat(false);
        setEditingCatId(null);
        setShowCatModal(false);
    };

    const isDark = theme === 'dark';

    return (
        <Background>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <View style={[styles.container, { backgroundColor: isDark ? '#1C1B1F' : '#FFFBFE' }]}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                            <X color={isDark ? '#E6E1E5' : '#1C1B1F'} size={24} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>New Flow</Text>
                        <TouchableOpacity onPress={handleSave} style={[styles.saveFab, { backgroundColor: isDark ? '#D0BCFF' : '#6750A4' }]}>
                            <Check color={isDark ? '#381E72' : '#FFFFFF'} size={24} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View style={styles.typeRow}>
                            {['expense', 'income'].map((t) => (
                                <TouchableOpacity
                                    key={t}
                                    onPress={() => setType(t as any)}
                                    style={[
                                        styles.typeChip,
                                        type === t && { backgroundColor: isDark ? '#D0BCFF' : '#6750A4', borderColor: isDark ? '#D0BCFF' : '#6750A4' },
                                        { borderColor: isDark ? '#938F99' : '#79747E' }
                                    ]}
                                >
                                    <Text style={[styles.typeChipText, { color: type === t ? (isDark ? '#381E72' : '#FFFFFF') : (isDark ? '#E6E1E5' : '#49454F') }]}>
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.inputCard}>
                            <Text style={[styles.label, { color: isDark ? '#D0BCFF' : '#6750A4' }]}>Amount</Text>
                            <View style={styles.amountInputContainer}>
                                <Text style={[styles.currency, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>{symbol}</Text>
                                <TextInput
                                    style={[styles.amountInput, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}
                                    placeholder="0"
                                    placeholderTextColor={isDark ? '#49454F' : '#CAC4D0'}
                                    keyboardType="decimal-pad"
                                    value={amount}
                                    onChangeText={setAmount}
                                />
                            </View>
                        </View>

                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.label, { color: isDark ? '#D0BCFF' : '#6750A4' }]}>Category</Text>
                                <TouchableOpacity onPress={() => setShowCatModal(true)} style={[styles.addBtn, { backgroundColor: isDark ? '#4F378B' : '#EADDFF' }]}>
                                    <Plus color={isDark ? '#D0BCFF' : '#21005D'} size={18} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.categoryGrid}>
                                {categories.map((cat) => {
                                    const IconComp = ICONS[cat.icon] || ICONS.tag;
                                    return (
                                        <TouchableOpacity
                                            key={cat.id}
                                            onPress={() => setCategory(cat)}
                                            onLongPress={() => openEditCat(cat)}
                                            style={[
                                                styles.catChip,
                                                category?.id === cat.id && { backgroundColor: isDark ? '#4F378B' : '#EADDFF', borderColor: isDark ? '#D0BCFF' : '#6750A4' },
                                                { borderColor: isDark ? '#49454F' : '#E7E0EC' }
                                            ]}
                                        >
                                            <IconComp size={16} color={cat.color} />
                                            <Text style={[styles.catText, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>{cat.name}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                            <Text style={[styles.hintTxt, { color: isDark ? '#938F99' : '#79747E' }]}>Long press category to edit or delete</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.label, { color: isDark ? '#D0BCFF' : '#6750A4' }]}>Note</Text>
                            <TextInput
                                style={[styles.noteInput, { borderBottomColor: isDark ? '#938F99' : '#79747E', color: isDark ? '#E6E1E5' : '#1C1B1F' }]}
                                placeholder="What was this for?"
                                placeholderTextColor={isDark ? '#49454F' : '#CAC4D0'}
                                value={note}
                                onChangeText={setNote}
                            />
                        </View>
                    </ScrollView>

                    {/* Category Modal (Create/Edit) */}
                    <Modal visible={showCatModal} transparent animationType="slide">
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View style={styles.modalOverlay}>
                                <View style={[styles.modalCard, { backgroundColor: isDark ? '#2B2930' : '#FFFFFF' }]}>
                                    <View style={styles.modalHeaderRow}>
                                        <Text style={[styles.modalTitle, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>
                                            {isEditingCat ? 'Edit Category' : 'New Category'}
                                        </Text>
                                        {isEditingCat && (
                                            <TouchableOpacity onPress={() => handleDeleteCategory(editingCatId!)} style={styles.deleteBtn}>
                                                <Trash2 color={isDark ? '#F2B8B5' : '#B3261E'} size={20} />
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    <View style={styles.catInputRow}>
                                        <TouchableOpacity
                                            style={[styles.iconSelect, { backgroundColor: isDark ? '#1D1B20' : '#F3EDF7' }]}
                                            onPress={() => setShowIconPicker(true)}
                                        >
                                            {React.createElement(ICONS[newCatIcon] || ICONS.tag, { size: 24, color: isDark ? '#D0BCFF' : '#6750A4' })}
                                        </TouchableOpacity>
                                        <TextInput
                                            style={[styles.modalInput, { color: isDark ? '#E6E1E5' : '#1C1B1F', borderBottomColor: colors.primary, flex: 1 }]}
                                            placeholder="Category Name"
                                            placeholderTextColor={isDark ? '#49454F' : '#CAC4D0'}
                                            value={newCatName}
                                            onChangeText={setNewCatName}
                                        />
                                    </View>

                                    <View style={styles.modalActions}>
                                        <TouchableOpacity onPress={resetCatModal} style={styles.modalActionBtn}>
                                            <Text style={{ color: isDark ? '#D0BCFF' : '#6750A4', fontWeight: 'bold' }}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={handleSaveCategory} style={styles.modalActionBtn}>
                                            <Text style={{ color: isDark ? '#D0BCFF' : '#6750A4', fontWeight: 'bold' }}>
                                                {isEditingCat ? 'Update' : 'Create'}
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </TouchableWithoutFeedback>
                    </Modal>

                    {/* Icon Picker Modal */}
                    <Modal visible={showIconPicker} transparent animationType="fade">
                        <View style={styles.modalOverlay}>
                            <View style={[styles.iconPickerCard, { backgroundColor: isDark ? '#242229' : '#FFFFFF' }]}>
                                <Text style={[styles.modalTitle, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>Pick Icon</Text>
                                <View style={styles.iconGrid}>
                                    {Object.keys(ICONS).map((key) => {
                                        const IconComp = ICONS[key];
                                        return (
                                            <TouchableOpacity
                                                key={key}
                                                style={[styles.iconBox, newCatIcon === key && { backgroundColor: isDark ? '#4F378B' : '#EADDFF' }]}
                                                onPress={() => { setNewCatIcon(key); setShowIconPicker(false); }}
                                            >
                                                <IconComp size={24} color={isDark ? '#D0BCFF' : '#6750A4'} />
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                                <TouchableOpacity style={styles.modalClose} onPress={() => setShowIconPicker(false)}>
                                    <Text style={{ color: isDark ? '#D0BCFF' : '#6750A4', fontWeight: 'bold' }}>Close</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>

                    <ModalAlert
                        visible={alertConfig.visible}
                        title={alertConfig.title}
                        message={alertConfig.message}
                        type={alertConfig.type}
                        onClose={() => setAlertConfig({ ...alertConfig, visible: false })}
                        onConfirm={alertConfig.onConfirm}
                    />
                </View>
            </TouchableWithoutFeedback>
        </Background>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 60, gap: 16 },
    headerBtn: { padding: 8 },
    headerTitle: { fontSize: 22, fontWeight: '400', flex: 1 },
    saveFab: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 4 },
    scrollContent: { padding: 24, paddingBottom: 100 },
    typeRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
    typeChip: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
    typeChipText: { fontSize: 14, fontWeight: '500' },
    inputCard: { marginBottom: 32 },
    label: { fontSize: 13, fontWeight: '700', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1 },
    amountInputContainer: { flexDirection: 'row', alignItems: 'baseline' },
    currency: { fontSize: 32, marginRight: 8 },
    amountInput: { fontSize: 48, fontWeight: '400', flex: 1 },
    section: { marginBottom: 32 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    addBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    catChip: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, gap: 8 },
    catText: { fontSize: 14, fontWeight: '500' },
    hintTxt: { fontSize: 12, marginTop: 12, opacity: 0.6 },
    noteInput: { borderBottomWidth: 1, paddingVertical: 12, fontSize: 16 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 },
    modalCard: { borderRadius: 28, padding: 24, elevation: 6 },
    modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 22, fontWeight: '400' },
    deleteBtn: { padding: 8 },
    catInputRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 24 },
    iconSelect: { width: 56, height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
    modalInput: { borderBottomWidth: 2, paddingVertical: 12, fontSize: 16 },
    modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8 },
    modalActionBtn: { padding: 12 },
    iconPickerCard: { borderRadius: 28, padding: 24, width: '90%', alignSelf: 'center' },
    iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 24 },
    iconBox: { width: 50, height: 50, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    modalClose: { marginTop: 24, alignItems: 'center' }
});

export default AddTransaction;

