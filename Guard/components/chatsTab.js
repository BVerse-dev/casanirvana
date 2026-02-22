import React from 'react';
import { Text, View, TouchableOpacity, Image, FlatList, StyleSheet } from 'react-native';
import { Colors, Fonts, Default } from '../constants/styles';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import { useConversations } from '../hooks/useMessages';

const formatTime = (timestamp) => {
  if (!timestamp) {
    return '';
  }
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const formatMessage = (message) => {
  if (!message) {
    return 'Tap to start a conversation';
  }

  const body = message.body;
  const attachments = message.attachments;
  const dbMessageType = message.message_type;

  if (dbMessageType === 'file') {
    const attachmentType = attachments?.type;
    if (attachmentType === 'image') return 'Photo';
    if (attachmentType === 'audio') return 'Voice message';
    if (attachmentType === 'document') return attachments?.fileName || 'Document';
    return body || 'Attachment';
  }

  try {
    const parsed = JSON.parse(body);
    if (parsed?.type === 'image') {
      return 'Photo';
    }
    if (parsed?.type === 'audio') {
      return 'Voice message';
    }
    if (parsed?.type === 'document') {
      return parsed?.content || 'Document';
    }
    return parsed?.content || body;
  } catch (_error) {
    return body;
  }
};

const ChatsTab = ({ navigation }) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const { conversations, isLoading, refetch } = useConversations();

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch]),
  );

  if (isLoading) {
    return (
      <View style={styles.centeredState}>
        <Text style={Fonts.Medium16primary}>Loading chats...</Text>
      </View>
    );
  }

  if (!conversations.length) {
    return (
      <View style={styles.centeredState}>
        <Text style={Fonts.Medium14grey}>No conversations yet.</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => {
    const partnerProfile = item.partnerProfile || {};
    const fullName = `${partnerProfile.first_name || ''} ${partnerProfile.last_name || ''}`.trim();
    const isOnline =
      !!partnerProfile.last_login &&
      !!partnerProfile.is_active &&
      Date.now() - new Date(partnerProfile.last_login).getTime() < 5 * 60 * 1000;

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.push('messageScreen', {
            image: partnerProfile.avatar_url
              ? { uri: partnerProfile.avatar_url }
              : require('../assets/images/guard.png'),
            name: fullName || 'Resident',
            key: '1',
            id: item.partnerId,
            memberId: item.partnerId,
          })
        }
        style={{
          flexDirection: isRtl ? 'row-reverse' : 'row',
          marginBottom: Default.fixPadding * 2,
          marginHorizontal: Default.fixPadding * 2,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: isRtl ? 'row-reverse' : 'row',
            alignItems: 'center',
          }}
        >
          <View style={{ position: 'relative' }}>
            <Image
              source={
                typeof partnerProfile.avatar_url === 'string' && partnerProfile.avatar_url
                  ? { uri: partnerProfile.avatar_url }
                  : require('../assets/images/guard.png')
              }
              style={styles.image}
            />
            {isOnline ? <View style={styles.onlineIndicator} /> : null}
          </View>

          <View
            style={{
              flex: 1,
              alignItems: isRtl ? 'flex-end' : 'flex-start',
              marginHorizontal: Default.fixPadding * 1.5,
            }}
          >
            <Text numberOfLines={1} style={{ ...Fonts.Medium16primary, overflow: 'hidden' }}>
              {fullName || 'Resident'}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.Medium14grey,
                overflow: 'hidden',
                marginTop: Default.fixPadding * 0.5,
              }}
            >
              {formatMessage(item.lastMessage)}
            </Text>
          </View>
        </View>

        <View style={{ alignItems: isRtl ? 'flex-start' : 'flex-end' }}>
          <Text
            numberOfLines={1}
            style={{
              ...Fonts.Medium14grey,
              overflow: 'hidden',
              maxWidth: 80,
              textAlign: isRtl ? 'left' : 'right',
            }}
          >
            {formatTime(item.lastMessage?.sent_at)}
          </Text>
          {item.unreadCount > 0 ? (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{item.unreadCount}</Text>
            </View>
          ) : null}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <FlatList
        data={conversations}
        renderItem={renderItem}
        keyExtractor={(item) => item.partnerId}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: Default.fixPadding }}
        refreshing={isLoading}
        onRefresh={refetch}
      />
    </View>
  );
};

export default ChatsTab;

const styles = StyleSheet.create({
  centeredState: {
    flex: 1,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    resizeMode: 'cover',
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.green || '#4CAF50',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    paddingHorizontal: 5,
  },
  unreadText: {
    ...Fonts.Medium14white,
    fontSize: 11,
  },
});
