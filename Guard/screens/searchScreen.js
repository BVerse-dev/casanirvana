import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  FlatList,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Colors, Default, Fonts } from '../constants/styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MyStatusBar from '../components/myStatusBar';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useConversations } from '../hooks/useMessages';
import {
  useGuardCommunityDirectoryMembers,
  useGuardCommunityDirectorySubscription,
} from '../hooks/useCommunityDirectoryMembers';

const roleLabel = (role) => {
  if (role === 'admin') return 'Admin';
  if (role === 'committee') return 'Committee';
  return 'Member';
};

const formatMessagePreview = (message) => {
  if (!message) return 'Tap to start a conversation';

  if (message.message_type === 'file') {
    const attachmentType = message.attachments?.type;
    if (attachmentType === 'image') return 'Photo';
    if (attachmentType === 'audio') return 'Voice message';
    if (attachmentType === 'document') return message.attachments?.fileName || 'Document';
    return message.body || 'Attachment';
  }

  try {
    const parsed = JSON.parse(message.body || '');
    if (parsed?.type === 'image') return 'Photo';
    if (parsed?.type === 'audio') return 'Voice message';
    if (parsed?.type === 'document') return parsed?.content || 'Document';
    return parsed?.content || message.body || 'Tap to start a conversation';
  } catch (_error) {
    return message.body || 'Tap to start a conversation';
  }
};

const SearchScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  const { conversations = [] } = useConversations();

  function tr(key) {
    return t(`searchScreen:${key}`);
  }

  const backAction = useCallback(() => {
    navigation.pop();
    return true;
  }, [navigation]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => {
      subscription?.remove();
    };
  }, [backAction]);

  const [search, setSearch] = useState('');
  const [clearAll, setClearAll] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const { data: residents = [], isLoading, error } = useGuardCommunityDirectoryMembers();
  useGuardCommunityDirectorySubscription();

  const conversationsByPartner = useMemo(() => {
    const map = new Map();
    conversations.forEach((item) => {
      map.set(item.partnerId, item);
    });
    return map;
  }, [conversations]);

  const allResidents = useMemo(() => {
    return residents.map((resident) => ({
      id: resident.id,
      memberId: resident.id,
      name: resident.name,
      phone: resident.phone,
      unit:
        resident.block === 'N/A'
          ? roleLabel(resident.role)
          : `Block ${resident.block}-${resident.flatNo} (${roleLabel(resident.role)})`,
      image: resident.avatarUrl,
    }));
  }, [residents]);

  const filteredResults = useMemo(() => {
    if (!search.trim()) return [];

    const searchLower = search.toLowerCase();
    return allResidents.filter(
      (resident) =>
        resident.name.toLowerCase().includes(searchLower) ||
        resident.unit.toLowerCase().includes(searchLower),
    );
  }, [allResidents, search]);

  const recentSearchList = useMemo(
    () =>
      allResidents.slice(0, 6).map((resident, index) => ({
        key: `${resident.id}-${index}`,
        title: `${resident.name} (${resident.unit})`,
        name: resident.name,
      })),
    [allResidents],
  );

  const handleVoiceSearch = async () => {
    try {
      setIsListening(true);
      Alert.alert(
        'Voice Search',
        'Voice search feature coming soon! For now, please type your search.',
        [{ text: 'OK', onPress: () => setIsListening(false) }],
      );
    } catch (_voiceError) {
      setIsListening(false);
    }
  };

  const renderSearchResult = ({ item }) => {
    const conversation = conversationsByPartner.get(item.id);
    const lastMessage = formatMessagePreview(conversation?.lastMessage);

    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate('messageScreen', {
            image: item.image
              ? { uri: item.image }
              : require('../assets/images/guard.png'),
            name: item.name,
            key: item.id,
            id: item.id,
            memberId: item.memberId,
          });
        }}
        style={{
          flexDirection: isRtl ? 'row-reverse' : 'row',
          alignItems: 'center',
          marginBottom: Default.fixPadding * 1.5,
          marginHorizontal: Default.fixPadding * 2,
          padding: Default.fixPadding,
          backgroundColor: Colors.white,
          borderRadius: 10,
          ...Default.shadow,
        }}
      >
        <Image
          source={
            typeof item.image === 'string' && item.image
              ? { uri: item.image }
              : require('../assets/images/guard.png')
          }
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            resizeMode: 'cover',
          }}
        />
        <View
          style={{
            flex: 1,
            alignItems: isRtl ? 'flex-end' : 'flex-start',
            marginHorizontal: Default.fixPadding,
          }}
        >
          <Text numberOfLines={1} style={{ ...Fonts.Medium16primary, overflow: 'hidden' }}>
            {item.name}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              ...Fonts.Medium14grey,
              overflow: 'hidden',
              marginTop: Default.fixPadding * 0.3,
            }}
          >
            {item.unit}
          </Text>
          {!!conversation?.lastMessage && (
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.Medium12grey,
                overflow: 'hidden',
                marginTop: Default.fixPadding * 0.2,
                fontStyle: 'italic',
              }}
            >
              Last: {lastMessage}
            </Text>
          )}
        </View>

        <View style={{ alignItems: 'center' }}>
          {conversation?.unreadCount > 0 ? (
            <View
              style={{
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: Colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 6,
                paddingHorizontal: 4,
              }}
            >
              <Text style={{ ...Fonts.Medium12white, fontSize: 10 }}>{conversation.unreadCount}</Text>
            </View>
          ) : null}
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('callScreen', {
                image: item.image
                  ? { uri: item.image }
                  : require('../assets/images/guard.png'),
                name: item.name,
                phone: item.phone,
                id: item.id,
                memberId: item.memberId,
              });
            }}
            style={{ padding: Default.fixPadding * 0.5 }}
          >
            <MaterialCommunityIcons name='phone-outline' size={20} color={Colors.grey} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderRecentItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => setSearch(item.name)}
        style={{
          alignItems: isRtl ? 'flex-end' : 'flex-start',
          marginBottom: Default.fixPadding,
          marginHorizontal: Default.fixPadding * 2,
        }}
      >
        <Text style={{ ...Fonts.Medium14grey }}>🔍 {item.title}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <MyStatusBar />
      <View
        style={{
          flexDirection: isRtl ? 'row-reverse' : 'row',
          alignItems: 'center',
          marginTop: Default.fixPadding * 1.2,
          marginHorizontal: Default.fixPadding * 2,
        }}
      >
        <TouchableOpacity onPress={() => navigation.pop()}>
          <Ionicons
            name={isRtl ? 'arrow-forward-outline' : 'arrow-back-outline'}
            size={25}
            color={Colors.black}
          />
        </TouchableOpacity>
        <View
          style={{
            flex: 1,
            marginLeft: isRtl ? 0 : Default.fixPadding,
            marginRight: isRtl ? Default.fixPadding : 0,
          }}
        >
          <View
            style={{
              flexDirection: isRtl ? 'row-reverse' : 'row',
              alignItems: 'center',
              paddingVertical: Default.fixPadding * 1.2,
              paddingLeft: Default.fixPadding * 2,
              paddingRight: Default.fixPadding * 1.2,
              borderRadius: 5,
              backgroundColor: Colors.white,
              ...Default.shadow,
            }}
          >
            <MaterialIcons name='search' size={20} color={Colors.grey} />
            <TextInput
              autoFocus
              value={search}
              onChangeText={setSearch}
              placeholder={tr('search')}
              placeholderTextColor={Colors.grey}
              selectionColor={Colors.primary}
              style={{
                ...Fonts.SemiBold16black,
                flex: 1,
                textAlign: isRtl ? 'right' : 'left',
                marginHorizontal: Default.fixPadding,
              }}
            />
            <TouchableOpacity onPress={handleVoiceSearch}>
              <MaterialIcons
                name={isListening ? 'mic' : 'mic-none'}
                size={20}
                color={isListening ? Colors.primary : Colors.grey}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size='large' color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ ...Fonts.SemiBold16grey }}>Unable to load residents</Text>
        </View>
      ) : search.trim() ? (
        filteredResults.length > 0 ? (
          <FlatList
            data={filteredResults}
            renderItem={renderSearchResult}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={() => (
              <View
                style={{
                  marginTop: Default.fixPadding * 2,
                  marginBottom: Default.fixPadding,
                  marginHorizontal: Default.fixPadding * 2,
                }}
              >
                <Text style={{ ...Fonts.SemiBold16black }}>
                  Search Results ({filteredResults.length})
                </Text>
              </View>
            )}
          />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <MaterialIcons name='search-off' size={40} color={Colors.grey} />
            <Text style={{ ...Fonts.SemiBold16grey, marginTop: Default.fixPadding }}>
              No results found for "{search}"
            </Text>
          </View>
        )
      ) : clearAll ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <MaterialIcons name='search-off' size={40} color={Colors.grey} />
          <Text style={{ ...Fonts.SemiBold16grey, marginTop: Default.fixPadding }}>
            {tr('noSearch')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={recentSearchList}
          renderItem={renderRecentItem}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => (
            <View
              style={{
                flexDirection: isRtl ? 'row-reverse' : 'row',
                alignItems: 'center',
                marginTop: Default.fixPadding * 2,
                marginBottom: Default.fixPadding,
                marginHorizontal: Default.fixPadding * 2,
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  ...Fonts.SemiBold16black,
                  flex: 7,
                  overflow: 'hidden',
                }}
              >
                {tr('recentSearch')}
              </Text>
              <TouchableOpacity
                onPress={() => setClearAll(true)}
                style={{
                  flex: 3,
                  alignItems: isRtl ? 'flex-start' : 'flex-end',
                  marginLeft: isRtl ? 0 : Default.fixPadding,
                  marginRight: isRtl ? Default.fixPadding : 0,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{ ...Fonts.SemiBold14grey, overflow: 'hidden' }}
                >
                  {tr('clearAll')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default SearchScreen;
