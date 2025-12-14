import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

// Check if running in Expo Go (limited notification support)
const isExpoGo = Constants.appOwnership === 'expo';

export const requestPermissions = async () => {
    try {
        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (isExpoGo) {
            console.log('[Notifications] Running in Expo Go - Push notifications not supported');
        }

        return finalStatus === 'granted';
    } catch (error) {
        console.log('[Notifications] Error requesting permissions:', error);
        return false;
    }
};

export const scheduleMorningNudge = async () => {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();

        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Bom dia! ☀️",
                body: "Qual seu foco hoje? ☕",
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour: 8,
                minute: 0,
            },
        });

        console.log('[Notifications] Morning nudge scheduled');
    } catch (error) {
        console.log('[Notifications] Error scheduling morning nudge:', error);
    }
};

export const scheduleStreakSaver = async () => {
    try {
        await Notifications.scheduleNotificationAsync({
            content: {
                title: "Não perca sua ofensiva! 🔥",
                body: "Não deixe sua chama apagar! Complete uma tarefa agora.",
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour: 20,
                minute: 0,
            },
        });

        console.log('[Notifications] Streak saver scheduled');
    } catch (error) {
        console.log('[Notifications] Error scheduling streak saver:', error);
    }
};
