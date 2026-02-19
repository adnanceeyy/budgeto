import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Platform, Image, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import Background from '../components/Background';
import { Camera, Mail, Phone, MapPin, Edit2, LogOut, ChevronLeft, User, Shield, Bell, Check, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

import * as ImagePicker from 'expo-image-picker';

const Profile = ({ navigation }: any) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState({
        name: 'John Doe',
        email: 'john.doe@pixel.com',
        phone: '+1 234 567 890',
        location: 'Mountain View, CA',
        avatar: '', // Base64 or URI
    });

    const [tempUser, setTempUser] = useState({ ...user });
    const [stats, setStats] = useState({ categories: 0, transactions: 0 });
    const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'info' });

    useEffect(() => {
        loadProfile();
        loadStats();
    }, []);

    const loadProfile = async () => {
        const saved = await AsyncStorage.getItem('user_profile');
        if (saved) {
            const data = JSON.parse(saved);
            setUser(data);
            setTempUser(data);
        }
    };

    const loadStats = async () => {
        const txs = await AsyncStorage.getItem('antigravity_transactions');
        const cats = await AsyncStorage.getItem('antigravity_categories');
        setStats({
            categories: cats ? JSON.parse(cats).length : 4,
            transactions: txs ? JSON.parse(txs).length : 0
        });
    };

    const handleSave = async () => {
        setUser(tempUser);
        await AsyncStorage.setItem('user_profile', JSON.stringify(tempUser));
        setIsEditing(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => { });
    };

    const handlePickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            alert('Sorry, we need camera roll permissions to make this work!');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
        });

        if (!result.canceled) {
            const newUri = result.assets[0].uri;
            setTempUser(prev => ({ ...prev, avatar: newUri }));
            if (!isEditing) {
                // Auto-save if not in editing mode
                const updatedUser = { ...user, avatar: newUri };
                setUser(updatedUser);
                await AsyncStorage.setItem('user_profile', JSON.stringify(updatedUser));
            }
        }
    };

    const handleLogout = async () => {
        if (Platform.OS === 'web') {
            window.location.reload();
        } else {
            // Reset to Login/Initial screen if routing allows, here we simulate reset
            navigation.replace('Dashboard'); // Or actual login screen
        }
    };

    const EditField = ({ icon: Icon, label, value, field }: any) => (
        <View style={styles.editField}>
            <View style={[styles.itemIcon, { backgroundColor: isDark ? '#1D1B20' : '#F3EDF7' }]}>
                <Icon size={20} color={isDark ? '#D0BCFF' : '#6750A4'} />
            </View>
            <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: isDark ? '#D0BCFF' : '#6750A4' }]}>{label}</Text>
                <TextInput
                    style={[styles.input, { color: isDark ? '#E6E1E5' : '#1C1B1F', borderBottomColor: isDark ? '#49454F' : '#E7E0EC' }]}
                    value={value}
                    onChangeText={(text) => {
                        setTempUser(prev => ({ ...prev, [field]: text }));
                    }}
                />
            </View>
        </View>
    );

    const ProfileItem = ({ icon: Icon, label, value }: any) => (
        <View style={styles.item}>
            <View style={[styles.itemIcon, { backgroundColor: isDark ? '#2B2930' : '#F3EDF7' }]}>
                <Icon size={20} color={isDark ? '#D0BCFF' : '#6750A4'} />
            </View>
            <View style={styles.itemContent}>
                <Text style={[styles.itemLabel, { color: isDark ? '#CAC4D0' : '#49454F' }]}>{label}</Text>
                <Text style={[styles.itemValue, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>{value}</Text>
            </View>
        </View>
    );

    return (
        <Background>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                    <View style={styles.header}>
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                            <ChevronLeft color={isDark ? '#E6E1E5' : '#1C1B1F'} size={24} />
                        </TouchableOpacity>
                        <Text style={[styles.title, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>
                            {isEditing ? 'System Identity' : 'My Core'}
                        </Text>
                        {isEditing ? (
                            <TouchableOpacity onPress={handleSave}>
                                <Check color={isDark ? '#D0BCFF' : '#6750A4'} size={24} />
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity onPress={() => setIsEditing(true)}>
                                <Edit2 color={isDark ? '#E6E1E5' : '#1C1B1F'} size={20} />
                            </TouchableOpacity>
                        )}
                    </View>

                    <View style={styles.avatarSection}>
                        <TouchableOpacity onPress={handlePickImage} style={[styles.avatarContainer, { backgroundColor: isDark ? '#4F378B' : '#EADDFF' }]}>
                            {tempUser.avatar ? (
                                <Image source={{ uri: isEditing ? tempUser.avatar : user.avatar }} style={styles.avatarImage} />
                            ) : (
                                <Text style={[styles.avatarInitial, { color: isDark ? '#D0BCFF' : '#21005D' }]}>
                                    {user.name.split(' ').map(n => n[0]).join('')}
                                </Text>
                            )}
                            <View style={[styles.cameraBtn, { backgroundColor: isDark ? '#D0BCFF' : '#6750A4' }]}>
                                <Camera size={16} color={isDark ? '#381E72' : '#FFFFFF'} />
                            </View>
                        </TouchableOpacity>
                        {!isEditing && (
                            <>
                                <Text style={[styles.userName, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>{user.name}</Text>
                                <Text style={[styles.userEmail, { color: isDark ? '#CAC4D0' : '#49454F' }]}>{user.email}</Text>
                            </>
                        )}
                    </View>

                    {isEditing ? (
                        <View style={styles.editSection}>
                            <EditField icon={User} label="Identity Node" value={tempUser.name} field="name" />
                            <EditField icon={Mail} label="Comms Channel" value={tempUser.email} field="email" />
                            <EditField icon={Phone} label="Secure Line" value={tempUser.phone} field="phone" />
                            <EditField icon={MapPin} label="Active Location" value={tempUser.location} field="location" />

                            <TouchableOpacity
                                style={[styles.cancelBtn, { borderColor: isDark ? '#49454F' : '#E7E0EC' }]}
                                onPress={() => { setIsEditing(false); setTempUser(user); }}
                            >
                                <Text style={{ color: isDark ? '#E6E1E5' : '#1C1B1F', fontWeight: 'bold' }}>Abort Changes</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <View style={[styles.statsCard, { backgroundColor: isDark ? '#1D1B20' : '#F7F2FA' }]}>
                                <View style={styles.statBox}>
                                    <Text style={[styles.statValue, { color: isDark ? '#D0BCFF' : '#6750A4' }]}>{stats.categories}</Text>
                                    <Text style={[styles.statLabel, { color: isDark ? '#CAC4D0' : '#49454F' }]}>Nodes</Text>
                                </View>
                                <View style={[styles.statDivider, { backgroundColor: isDark ? '#49454F' : '#E7E0EC' }]} />
                                <View style={styles.statBox}>
                                    <Text style={[styles.statValue, { color: isDark ? '#D0BCFF' : '#6750A4' }]}>{stats.transactions}</Text>
                                    <Text style={[styles.statLabel, { color: isDark ? '#CAC4D0' : '#49454F' }]}>Flows</Text>
                                </View>
                            </View>

                            <View style={styles.section}>
                                <Text style={[styles.sectionTitle, { color: isDark ? '#D0BCFF' : '#6750A4' }]}>Node Integrity</Text>
                                <ProfileItem icon={Mail} label="Comms" value={user.email} />
                                <ProfileItem icon={Phone} label="Secure" value={user.phone} />
                                <ProfileItem icon={MapPin} label="Zone" value={user.location} />
                            </View>
                        </>
                    )}

                    <TouchableOpacity
                        style={[styles.logoutBtn, { borderColor: isDark ? '#F2B8B5' : '#B3261E' }]}
                        onPress={handleLogout}
                    >
                        <LogOut color={isDark ? '#F2B8B5' : '#B3261E'} size={20} />
                        <Text style={[styles.logoutText, { color: isDark ? '#F2B8B5' : '#B3261E' }]}>Disconnect</Text>
                    </TouchableOpacity>
                </ScrollView>
            </TouchableWithoutFeedback>
        </Background>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    content: { paddingBottom: 60 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingTop: 60 },
    title: { fontSize: 24, fontWeight: '400', letterSpacing: -0.5 },
    backBtn: { padding: 4 },
    avatarSection: { alignItems: 'center', marginTop: 20, marginBottom: 32 },
    avatarContainer: { width: 120, height: 120, borderRadius: 60, justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' },
    avatarInitial: { fontSize: 40, fontWeight: 'bold' },
    avatarImage: { width: 120, height: 120, borderRadius: 60 },
    cameraBtn: { position: 'absolute', bottom: 0, right: 0, width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', elevation: 4 },
    userName: { fontSize: 24, fontWeight: '600', marginTop: 16 },
    userEmail: { fontSize: 14, marginTop: 4 },
    statsCard: { marginHorizontal: 24, padding: 20, borderRadius: 28, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 32 },
    statBox: { alignItems: 'center' },
    statValue: { fontSize: 20, fontWeight: '700' },
    statLabel: { fontSize: 12, marginTop: 4 },
    statDivider: { width: 1, height: 30 },
    section: { marginBottom: 32, paddingHorizontal: 24 },
    editSection: { paddingHorizontal: 24, gap: 24 },
    sectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 16, textTransform: 'uppercase', letterSpacing: 1.5 },
    item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, marginBottom: 8 },
    editField: { flexDirection: 'row', alignItems: 'center' },
    itemIcon: { width: 44, height: 44, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    itemContent: { flex: 1 },
    itemLabel: { fontSize: 12, fontWeight: '500' },
    itemValue: { fontSize: 15, fontWeight: '400', marginTop: 2 },
    inputContainer: { flex: 1 },
    inputLabel: { fontSize: 12, fontWeight: '700', marginBottom: 4 },
    input: { fontSize: 16, paddingVertical: 8, borderBottomWidth: 1 },
    cancelBtn: { marginTop: 12, padding: 16, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
    logoutBtn: { marginHorizontal: 24, padding: 18, borderRadius: 20, borderWidth: 1.5, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12, marginTop: 10 },
    logoutText: { fontSize: 16, fontWeight: '600' }
});

export default Profile;
