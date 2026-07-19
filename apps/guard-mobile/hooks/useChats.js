import { useState, useCallback } from 'react';
import moment from 'moment';

// Simple hook to provide chat enhancements for Guard App
export const useChatEnhancements = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Enhance chat item with recent activity and status
  const enhanceChatItem = useCallback((item) => {
    // Add some default enhancements for Guard-specific needs
    return {
      ...item,
      lastSeen: item.lastSeen || moment().subtract(Math.floor(Math.random() * 60), 'minutes').format('h:mm A'),
      isOnline: Math.random() > 0.5, // Random online status for demo
      unreadCount: Math.floor(Math.random() * 5), // Random unread count
      lastMessage: item.lastMessage || 'Hello, how can I help you?',
    };
  }, []);

  // Sort chats by most recent activity
  const sortChatsByRecent = useCallback((chats) => {
    return chats.sort((a, b) => {
      const aTime = moment(a.lastMessageTime || a.time, 'h:mm A');
      const bTime = moment(b.lastMessageTime || b.time, 'h:mm A');
      return bTime.diff(aTime);
    });
  }, []);

  // Generate dynamic chat list with Guard-specific contacts
  const generateDynamicChatList = useCallback(() => {
    const guardChats = [
      {
        key: "guard_security_office",
        name: "Security Office",
        lastMessage: "Shift report ready for review",
        time: moment().subtract(15, 'minutes').format('h:mm A'),
        image: require("../assets/images/customerCare.png"),
        userId: "security-office-001",
        isOnline: true,
        unreadCount: 2,
      },
      {
        key: "guard_emmanuel_broni",
        name: "Emmanuel Broni",
        lastMessage: "Thank you for your help with the visitor",
        time: moment().subtract(30, 'minutes').format('h:mm A'),
        image: require("../assets/images/img1.png"),
        userId: "75af3e6b-8bfe-4cf4-b70b-adad3d4edaad",
        isOnline: false,
        unreadCount: 0,
      },
      {
        key: "guard_james_brown",
        name: "James Brown",
        lastMessage: "Can you help with the delivery?",
        time: moment().subtract(1, 'hour').format('h:mm A'),
        image: require("../assets/images/img2.png"),
        userId: "44444444-4444-4444-4444-444444444444",
        isOnline: true,
        unreadCount: 1,
      },
      {
        key: "guard_admin_office",
        name: "Admin Office",
        lastMessage: "Monthly attendance report",
        time: moment().subtract(2, 'hours').format('h:mm A'),
        image: require("../assets/images/customerCare.png"),
        userId: "admin-office-001",
        isOnline: true,
        unreadCount: 0,
      },
    ];

    return sortChatsByRecent(guardChats);
  }, [sortChatsByRecent]);

  // Immediate refresh function
  const immediateRefresh = useCallback(() => {
    setIsLoading(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, []);

  return {
    enhanceChatItem,
    sortChatsByRecent,
    generateDynamicChatList,
    isLoading,
    immediateRefresh,
  };
};

export default useChatEnhancements;
