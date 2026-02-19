import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure how notifications appear when the app is foregrounded
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export const notificationService = {
    // Request permissions
    requestPermissions: async () => {
        if (Platform.OS === 'web') {
            return true; // Web uses different permission system, we'll treat as granted for simulation
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                return false;
            }

            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('reminders', {
                    name: 'Daily Reminders',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250, 250, 250],
                    lightColor: '#6750A4',
                    sound: 'default',
                    showBadge: true,
                });
            }
            return true;
        }

        // Return true on simulators for testing UI logic
        return true;
    },

    // Schedule a daily reminder
    scheduleDailyReminder: async (hour: number, minute: number, body?: string) => {
        if (Platform.OS === 'web') {
            await AsyncStorage.setItem('reminder_time', JSON.stringify({ hour, minute }));
            await AsyncStorage.setItem('reminder_body', body || "Keep your budget up to date. Did you spend or earn anything today?");
            await AsyncStorage.setItem('reminder_enabled', 'true');
            return 'web-id';
        }

        // Cancel existing reminders first
        await Notifications.cancelAllScheduledNotificationsAsync();

        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: "💰 Time to log your flows!",
                body: body || "Keep your budget up to date. Did you spend or earn anything today?",
                sound: 'default',
                priority: Notifications.AndroidNotificationPriority.MAX,
                data: { screen: 'AddTransaction' },
            },
            trigger: {
                hour,
                minute,
                repeats: true,
                channelId: 'reminders',
            } as any,
        });

        // Save the setting
        await AsyncStorage.setItem('reminder_time', JSON.stringify({ hour, minute }));
        await AsyncStorage.setItem('reminder_body', body || "");
        await AsyncStorage.setItem('reminder_enabled', 'true');

        return id;
    },

    // Disable reminder
    disableReminder: async () => {
        if (Platform.OS !== 'web') {
            await Notifications.cancelAllScheduledNotificationsAsync();
        }
        await AsyncStorage.setItem('reminder_enabled', 'false');
    },

    // Get current settings
    getSettings: async () => {
        const enabled = await AsyncStorage.getItem('reminder_enabled');
        const timeStr = await AsyncStorage.getItem('reminder_time');
        const body = await AsyncStorage.getItem('reminder_body');
        const time = timeStr ? JSON.parse(timeStr) : { hour: 20, minute: 0 };

        return {
            enabled: enabled === 'true',
            hour: time.hour,
            minute: time.minute,
            body: body || "Keep your budget up to date. Did you spend or earn anything today?"
        };
    },

    // Test notification
    sendTestNotification: async () => {
        if (Platform.OS === 'web') {
            return;
        }

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "🔔 Test Notification",
                body: "Your reminders are working perfectly!",
                sound: true,
            },
            trigger: null,
        });
    }
};
