import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { AlertCircle, CheckCircle2, Info, HelpCircle } from 'lucide-react-native';

interface ModalAlertProps {
    visible: boolean;
    title: string;
    message: string;
    onClose: () => void;
    onConfirm?: () => void;
    type?: 'info' | 'error' | 'success' | 'confirm';
    confirmText?: string;
    cancelText?: string;
}

const { width } = Dimensions.get('window');

const ModalAlert = ({
    visible,
    title,
    message,
    onClose,
    onConfirm,
    type = 'info',
    confirmText = 'OK',
    cancelText = 'Cancel'
}: ModalAlertProps) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const getIcon = () => {
        switch (type) {
            case 'error': return <AlertCircle color="#B3261E" size={48} />;
            case 'success': return <CheckCircle2 color="#146C2E" size={48} />;
            case 'confirm': return <HelpCircle color={isDark ? '#D0BCFF' : '#6750A4'} size={48} />;
            default: return <Info color={isDark ? '#D0BCFF' : '#6750A4'} size={48} />;
        }
    };

    return (
        <Modal visible={visible} transparent animationType="fade">
            <View style={styles.overlay}>
                <View style={[styles.card, { backgroundColor: isDark ? '#2B2930' : '#FFFFFF' }]}>
                    <View style={styles.iconContainer}>{getIcon()}</View>
                    <Text style={[styles.title, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>{title}</Text>
                    <Text style={[styles.message, { color: isDark ? '#CAC4D0' : '#49454F' }]}>{message}</Text>

                    <View style={styles.actions}>
                        {type === 'confirm' && (
                            <TouchableOpacity
                                style={[styles.btn, styles.secondaryBtn, { backgroundColor: isDark ? '#1D1B20' : '#F7F2FA' }]}
                                onPress={onClose}
                            >
                                <Text style={[styles.btnText, { color: isDark ? '#D0BCFF' : '#6750A4' }]}>{cancelText}</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[
                                styles.btn,
                                { backgroundColor: type === 'error' ? '#B3261E' : (isDark ? '#D0BCFF' : '#6750A4') },
                                type === 'confirm' ? { flex: 1.5 } : { width: '100%' }
                            ]}
                            onPress={onConfirm || onClose}
                        >
                            <Text style={[styles.btnText, { color: type === 'error' || !isDark ? '#FFFFFF' : '#381E72' }]}>
                                {confirmText}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
    card: { width: width * 0.85, padding: 32, borderRadius: 28, alignItems: 'center', elevation: 24 },
    iconContainer: { marginBottom: 20 },
    title: { fontSize: 22, fontWeight: '500', marginBottom: 12, textAlign: 'center' },
    message: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
    actions: { flexDirection: 'row', gap: 12, width: '100%' },
    btn: { paddingVertical: 14, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    secondaryBtn: { flex: 1 },
    btnText: { fontSize: 16, fontWeight: '700' }
});

export default ModalAlert;
