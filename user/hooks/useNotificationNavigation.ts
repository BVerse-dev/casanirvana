import { useNavigation } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';

export const useNotificationNavigation = () => {
  const navigation = useNavigation();

  const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
    // Handle notification tap/interaction
    const { data } = response.notification.request.content;
    
    // Navigate based on notification type
    if (data?.type === 'notice') {
      if (data.noticeId) {
        (navigation as any).navigate('noticeDetailScreen', { noticeId: data.noticeId });
      } else {
        (navigation as any).navigate('noticeBoardScreen');
      }
    } else if (data?.type === 'maintenance') {
      (navigation as any).navigate('maintenanceRequestsScreen');
    } else if (data?.type === 'payment') {
      (navigation as any).navigate('paymentScreen');
    } else if (data?.type === 'visitor') {
      (navigation as any).navigate('visitorsScreen');
    }
    
    // Clear badge count
    Notifications.setBadgeCountAsync(0);
  };

  return {
    handleNotificationResponse,
  };
};
