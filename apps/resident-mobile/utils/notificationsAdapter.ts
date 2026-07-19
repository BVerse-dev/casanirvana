import { isPushNotificationsSupported } from './notificationRuntime';

type ListenerSubscription = { remove: () => void };

const noopSubscription: ListenerSubscription = {
  remove: () => {},
};

const loadNotificationsModule = () => {
  if (!isPushNotificationsSupported) {
    return null;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('expo-notifications');
  } catch {
    return null;
  }
};

const NotificationsModule = loadNotificationsModule();

const Notifications = NotificationsModule ?? {
  AndroidImportance: { MAX: 5 },
  setNotificationHandler: () => {},
  addNotificationReceivedListener: () => noopSubscription,
  addNotificationResponseReceivedListener: () => noopSubscription,
  getPermissionsAsync: async () => ({ status: 'denied', canAskAgain: false }),
  requestPermissionsAsync: async () => ({ status: 'denied', canAskAgain: false }),
  getExpoPushTokenAsync: async () => {
    throw new Error('Push notifications are not supported in Expo Go. Use a development build.');
  },
  scheduleNotificationAsync: async () => null,
  dismissAllNotificationsAsync: async () => {},
  setBadgeCountAsync: async () => true,
  setNotificationChannelAsync: async () => {},
};

export const notificationsModuleLoaded = Boolean(NotificationsModule);

export default Notifications;
