import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Platform, Modal, TouchableWithoutFeedback, Keyboard, FlatList, KeyboardAvoidingView } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ColorPresets } from '../theme/colors';
import Background from '../components/Background';
import { X, Check, Target, ShoppingBag, Coffee, Car, Home, Zap, Heart, Gift, Briefcase, DollarSign, Utensils, Smartphone, Globe, Film, HeartPulse, Sparkles, Trash2, Edit2, Plus, FileText, ChevronRight, ShoppingCart } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { dbService } from '../database/db';
import ModalAlert from '../components/ModalAlert';
import { CATEGORY_ICONS } from '../utils/iconLibrary';


const AddTransaction = ({ navigation, route }: any) => {
    const editTx = route.params?.transaction;
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
        if (editTx) {
            setAmount(editTx.amount.toString());
            setNote(editTx.note || '');
            setType(editTx.type);
        }
    }, [editTx]);

    const loadCats = async () => {
        const cats = await dbService.getCategories();
        setCategories(cats);
        if (editTx) {
            const currentCat = cats.find((c: any) => c.id === editTx.category_id);
            if (currentCat) setCategory(currentCat);
        } else if (!category && cats.length > 0) {
            setCategory(cats[0]);
        }
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
            const txData = {
                type: type,
                amount: parsedAmount,
                category_id: category.id,
                note: note.trim(),
                date: editTx ? editTx.date : new Date().toISOString()
            };

            if (editTx) {
                await dbService.updateTransaction(editTx.id, txData);
            } else {
                await dbService.addTransaction(txData);
            }
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
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <View style={[styles.container, { backgroundColor: colors.background }]}>
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerBtn}>
                            <X color={colors.onSurface} size={24} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: colors.onSurface }]}>
                            {editTx ? 'Edit Flow' : 'Flow Stream'}
                        </Text>
                        <TouchableOpacity onPress={handleSave} style={[styles.saveFab, { backgroundColor: colors.primary }]}>
                            <Check color={colors.onPrimary} size={24} />
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
                                        type === t && { backgroundColor: colors.primary, borderColor: colors.primary },
                                        { borderColor: colors.outline }
                                    ]}
                                >
                                    <Text style={[styles.typeChipText, { color: type === t ? colors.onPrimary : colors.onSurfaceVariant }]}>
                                        {t.charAt(0).toUpperCase() + t.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <View style={styles.inputCard}>
                            <Text style={[styles.label, { color: colors.primary }]}>Amount</Text>
                            <View style={styles.amountInputContainer}>
                                <Text style={[styles.currency, { color: colors.onSurface }]}>{symbol}</Text>
                                <TextInput
                                    style={[styles.amountInput, { color: colors.onSurface }]}
                                    placeholder="0"
                                    placeholderTextColor={colors.onSurfaceVariant}
                                    keyboardType="decimal-pad"
                                    value={amount}
                                    onChangeText={setAmount}
                                />
                            </View>
                        </View>

                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={[styles.label, { color: colors.primary }]}>Category</Text>
                                <TouchableOpacity onPress={() => setShowCatModal(true)} style={[styles.addBtn, { backgroundColor: colors.primaryContainer }]}>
                                    <Plus color={colors.primary} size={18} />
                                </TouchableOpacity>
                            </View>
                            <View style={styles.categoryGrid}>
                                {categories.map((cat) => {
                                    const IconComp = CATEGORY_ICONS[cat.icon] || CATEGORY_ICONS.tag;
                                    return (
                                        <TouchableOpacity
                                            key={cat.id}
                                            onPress={() => setCategory(cat)}
                                            onLongPress={() => openEditCat(cat)}
                                            style={[
                                                styles.catChip,
                                                category?.id === cat.id && { backgroundColor: colors.primaryContainer, borderColor: colors.primary },
                                                { borderColor: colors.outline }
                                            ]}
                                        >
                                            <IconComp size={16} color={cat.color} />
                                            <Text style={[styles.catText, { color: colors.onSurface }]}>{cat.name}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                            <Text style={[styles.hintTxt, { color: colors.onSurfaceVariant }]}>Long press category to edit or delete</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={[styles.label, { color: colors.primary }]}>Note</Text>
                            <TextInput
                                style={[styles.noteInput, { borderBottomColor: colors.outline, color: colors.onSurface }]}
                                placeholder="What was this for?"
                                placeholderTextColor={colors.onSurfaceVariant}
                                value={note}
                                onChangeText={setNote}
                            />
                        </View>
                    </ScrollView>

                    {/* Category Modal (Create/Edit) */}
                    <Modal visible={showCatModal} transparent animationType="slide">
                        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                            <View style={styles.modalOverlay}>
                                <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
                                    <View style={styles.modalHeaderRow}>
                                        <Text style={[styles.modalTitle, { color: colors.onSurface }]}>
                                            {isEditingCat ? 'Edit Category' : 'New Category'}
                                        </Text>
                                        {isEditingCat && (
                                            <TouchableOpacity onPress={() => handleDeleteCategory(editingCatId!)} style={styles.deleteBtn}>
                                                <Trash2 color={colors.error || '#B3261E'} size={20} />
                                            </TouchableOpacity>
                                        )}
                                    </View>

                                    <View style={styles.catInputRow}>
                                        <TouchableOpacity
                                            style={[styles.iconSelect, { backgroundColor: colors.card }]}
                                            onPress={() => setShowIconPicker(true)}
                                        >
                                            {React.createElement(CATEGORY_ICONS[newCatIcon] || CATEGORY_ICONS.tag, { size: 24, color: colors.primary })}
                                        </TouchableOpacity>
                                        <TextInput
                                            style={[styles.modalInput, { color: colors.onSurface, borderBottomColor: colors.primary, flex: 1 }]}
                                            placeholder="Category Name"
                                            placeholderTextColor={colors.onSurfaceVariant}
                                            value={newCatName}
                                            onChangeText={setNewCatName}
                                        />
                                    </View>

                                    <View style={styles.modalActions}>
                                        <TouchableOpacity onPress={resetCatModal} style={styles.modalActionBtn}>
                                            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Cancel</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={handleSaveCategory} style={styles.modalActionBtn}>
                                            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>
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
                            <View style={[styles.iconPickerCard, { backgroundColor: colors.surface }]}>
                                <View style={styles.modalHeaderRow}>
                                    <Text style={[styles.modalTitle, { color: colors.onSurface }]}>Pick Icon</Text>
                                    <TouchableOpacity onPress={() => setShowIconPicker(false)}>
                                        <X color={colors.onSurface} size={24} />
                                    </TouchableOpacity>
                                </View>
                                <ScrollView contentContainerStyle={styles.iconGrid} showsVerticalScrollIndicator={false}>
                                    {Object.keys(CATEGORY_ICONS).map((key) => {
                                        const IconComp = CATEGORY_ICONS[key];
                                        return (
                                            <TouchableOpacity
                                                key={key}
                                                style={[styles.iconBox, { backgroundColor: colors.card }, newCatIcon === key && { backgroundColor: colors.primaryContainer }]}
                                                onPress={() => { setNewCatIcon(key); setShowIconPicker(false); }}
                                            >
                                                <IconComp size={24} color={newCatIcon === key ? colors.primary : colors.onSurfaceVariant} />
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                                <TouchableOpacity style={styles.modalClose} onPress={() => setShowIconPicker(false)}>
                                    <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Close</Text>
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
            </KeyboardAvoidingView>
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
    iconPickerCard: { borderRadius: 28, padding: 24, width: '90%', maxHeight: '80%', alignSelf: 'center' },
    iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
    iconBox: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
    modalClose: { marginTop: 20, alignItems: 'center' }
});

export default AddTransaction;

