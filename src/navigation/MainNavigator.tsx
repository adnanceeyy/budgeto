import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { StyleSheet, View, Platform } from 'react-native';
import { Home, List, PieChart, Settings, Calendar as CalIcon, Landmark } from 'lucide-react-native';
import Dashboard from '../screens/Dashboard';
import AddTransaction from '../screens/AddTransaction';
import Transactions from '../screens/Transactions';
import Reports from '../screens/Reports';
import SettingsScreen from '../screens/Settings';
import PasscodeScreen from '../screens/PasscodeScreen';
import Profile from '../screens/Profile';
import CalendarScreen from '../screens/CalendarScreen';
import DebtScreen from '../screens/DebtScreen';
import { useTheme } from '../theme/ThemeContext';
import ReminderSettings from '../screens/ReminderSettings';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabNavigator = () => {
    const { theme } = useTheme();

    return (
        <Tab.Navigator
            screenOptions={() => ({
                headerShown: false,
                tabBarStyle: [
                    styles.tabBar,
                    {
                        backgroundColor: theme === 'dark' ? '#1D1B20' : '#F3EDF7',
                        borderTopColor: theme === 'dark' ? '#49454F' : '#E7E0EC'
                    }
                ],
                tabBarActiveTintColor: theme === 'dark' ? '#D0BCFF' : '#6750A4',
                tabBarInactiveTintColor: theme === 'dark' ? '#CAC4D0' : '#49454F',
                tabBarLabelStyle: styles.tabBarLabel,
                tabBarHideOnKeyboard: true,
            })}
        >
            <Tab.Screen
                name="HomeTab"
                component={Dashboard}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconContainer, focused && { backgroundColor: theme === 'dark' ? '#4F378B' : '#EADDFF' }]}>
                            <Home color={color} size={24} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="TransactionsTab"
                component={Transactions}
                options={{
                    tabBarLabel: 'History',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconContainer, focused && { backgroundColor: theme === 'dark' ? '#4F378B' : '#EADDFF' }]}>
                            <List color={color} size={24} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="DebtTab"
                component={DebtScreen}
                options={{
                    tabBarLabel: 'Debt',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconContainer, focused && { backgroundColor: theme === 'dark' ? '#4F378B' : '#EADDFF' }]}>
                            <Landmark color={color} size={24} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="ReportsTab"
                component={Reports}
                options={{
                    tabBarLabel: 'Reports',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconContainer, focused && { backgroundColor: theme === 'dark' ? '#4F378B' : '#EADDFF' }]}>
                            <PieChart color={color} size={24} />
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name="SettingsTab"
                component={SettingsScreen}
                options={{
                    tabBarLabel: 'Settings',
                    tabBarIcon: ({ color, focused }) => (
                        <View style={[styles.iconContainer, focused && { backgroundColor: theme === 'dark' ? '#4F378B' : '#EADDFF' }]}>
                            <Settings color={color} size={24} />
                        </View>
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

const ChangePasscodeWrapper = ({ navigation, ...props }: any) => {
    return (
        <PasscodeScreen
            {...props}
            navigation={navigation}
            title="New Passcode"
            onComplete={async (code: string) => {
                await AsyncStorage.setItem('user_passcode', code);
                navigation.goBack();
            }}
        />
    );
};

const MainNavigator = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="MainTabs" component={TabNavigator} />
                <Stack.Screen
                    name="AddTransaction"
                    component={AddTransaction}
                    options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
                />
                <Stack.Screen
                    name="Profile"
                    component={Profile}
                    options={{ animation: 'slide_from_right' }}
                />
                <Stack.Screen
                    name="ChangePasscode"
                    component={ChangePasscodeWrapper}
                    options={{ presentation: 'fullScreenModal' }}
                />
                <Stack.Screen
                    name="Calendar"
                    component={CalendarScreen}
                    options={{ animation: 'slide_from_right' }}
                />
                <Stack.Screen
                    name="Debt"
                    component={DebtScreen}
                    options={{ animation: 'slide_from_right' }}
                />
                <Stack.Screen
                    name="Reminders"
                    component={ReminderSettings}
                    options={{ animation: 'slide_from_right' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        height: 80,
        paddingBottom: Platform.OS === 'ios' ? 25 : 10,
        paddingTop: 10,
        borderTopWidth: 1,
        elevation: 0,
    },
    tabBarLabel: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 4,
    },
    iconContainer: {
        width: 64,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 2,
    }
});

export default MainNavigator;
