import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure how notifications appear when the app is foregrounded
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    } as any),
});

export const notificationService = {
    // Request permissions
    requestPermissions: async () => {
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
                Notifications.setNotificationChannelAsync('default', {
                    name: 'default',
                    importance: Notifications.AndroidImportance.MAX,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#6750A4',
                });
            }
            return true;
        }
        return false;
    },

    // Schedule a daily reminder
    scheduleDailyReminder: async (hour: number, minute: number) => {
        // Cancel existing reminders first
        await Notifications.cancelAllScheduledNotificationsAsync();

        const id = await Notifications.scheduleNotificationAsync({
            content: {
                title: "💰 Time to log your flows!",
                body: "Keep your budget up to date. Did you spend or earn anything today?",
                sound: true,
            },
            trigger: {
                hour: hour,
                minute: minute,
                repeats: true,
            } as any,
        });

        // Save the setting
        await AsyncStorage.setItem('reminder_time', JSON.stringify({ hour, minute }));
        await AsyncStorage.setItem('reminder_enabled', 'true');

        return id;
    },

    // Disable reminder
    disableReminder: async () => {
        await Notifications.cancelAllScheduledNotificationsAsync();
        await AsyncStorage.setItem('reminder_enabled', 'false');
    },

    // Get current settings
    getSettings: async () => {
        const enabled = await AsyncStorage.getItem('reminder_enabled');
        const timeStr = await AsyncStorage.getItem('reminder_time');
        const time = timeStr ? JSON.parse(timeStr) : { hour: 20, minute: 0 }; // Default 8 PM

        return {
            enabled: enabled === 'true',
            hour: time.hour,
            minute: time.minute
        };
    },

    // Test notification
    sendTestNotification: async () => {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "🔔 Test Notification",
                body: "Your reminders are working perfectly!",
                sound: true,
            },
            trigger: null, // Send immediately
        });
    }
};
