import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MainNavigator from './src/navigation/MainNavigator';
import { initDatabase } from './src/database/db';
import Onboarding from './src/screens/Onboarding';
import PasscodeScreen from './src/screens/PasscodeScreen';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import { View, ActivityIndicator, StyleSheet, Modal, Text, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { XCircle } from 'lucide-react-native';

function AppContent() {
  const { colors, theme } = useTheme();
  const [dbStatus, setDbStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [hasPasscode, setHasPasscode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    async function setup() {
      try {
        await initDatabase();
        setDbStatus('ready');

        const onboardingDone = await AsyncStorage.getItem('onboarding_done');
        const savedPasscode = await AsyncStorage.getItem('user_passcode');

        if (!onboardingDone) {
          setShowOnboarding(true);
        } else if (savedPasscode) {
          setHasPasscode(true);
          setIsLocked(true);
        }

        setLoading(false);
      } catch (e) {
        console.error("Setup error", e);
        setDbStatus('error');
        setLoading(false);
      }
    }
    setup();
  }, []);

  const handleOnboardingFinish = async () => {
    await AsyncStorage.setItem('onboarding_done', 'true');
    setShowOnboarding(false);
  };

  const handlePasscodeSet = async (code: string) => {
    await AsyncStorage.setItem('user_passcode', code);
    setHasPasscode(true);
    setIsLocked(false);
  };

  const handleUnlock = async (code: string) => {
    const saved = await AsyncStorage.getItem('user_passcode');
    if (code === saved) {
      setIsLocked(false);
    } else {
      setShowErrorModal(true);
    }
  };

  if (loading || dbStatus === 'loading') {
    return (
      <View style={[styles.loader, { backgroundColor: isDark ? '#141218' : '#FFFBFE' }]}>
        <ActivityIndicator size="large" color={isDark ? '#D0BCFF' : '#6750A4'} />
      </View>
    );
  }

  if (showOnboarding) {
    return <Onboarding onFinish={handleOnboardingFinish} onSetPasscode={handlePasscodeSet} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
        {isLocked ? (
          <PasscodeScreen onComplete={handleUnlock} title="Welcome Back" />
        ) : (
          <MainNavigator />
        )}

        {/* Custom Error Modal for Passcode */}
        <Modal visible={showErrorModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.errorCard, { backgroundColor: isDark ? '#2B2930' : '#FFFFFF' }]}>
              <XCircle color="#B3261E" size={48} />
              <Text style={[styles.errorTitle, { color: isDark ? '#E6E1E5' : '#1C1B1F' }]}>Access Denied</Text>
              <Text style={[styles.errorText, { color: isDark ? '#CAC4D0' : '#49454F' }]}>The passcode you entered is incorrect. Please try again.</Text>
              <TouchableOpacity
                style={[styles.errorBtn, { backgroundColor: isDark ? '#D0BCFF' : '#6750A4' }]}
                onPress={() => setShowErrorModal(false)}
              >
                <Text style={[styles.errorBtnText, { color: isDark ? '#381E72' : '#FFFFFF' }]}>Try Again</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorCard: {
    width: '80%',
    padding: 32,
    borderRadius: 28,
    alignItems: 'center',
    elevation: 20
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '500',
    marginTop: 20,
    marginBottom: 8
  },
  errorText: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24
  },
  errorBtn: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center'
  },
  errorBtnText: {
    fontWeight: '700',
    fontSize: 16
  }
});
