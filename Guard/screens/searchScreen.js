import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  FlatList,
  TextInput,
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
import ModuleUnavailableState from '../components/ModuleUnavailableState';
import { useGuardModuleAccess, MODULE_SLUGS } from '../hooks/useGuardModuleAccess';
import { useGuardAuth } from '../contexts/GuardAuthContext';
import {
  loadRecentResidentSearches,
  saveRecentResidentSearch,
  clearRecentResidentSearches,
  replaceRecentResidentSearches,
} from '../services/residentSearchHistoryService';

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
  const { authUser, guard } = useGuardAuth();

  function tr(key) {
    return t(`searchScreen:${key}`);
  }

  const roleLabel = useCallback(
    (role) => {
      if (role === 'admin') return t('residentsTab:roleAdmin');
      if (role === 'committee') return t('residentsTab:roleCommittee');
      return t('residentsTab:roleMember');
    },
    [t],
  );

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
  const [recentSearches, setRecentSearches] = useState([]);
  const { modulesLoaded, enabled: residentDirectoryEnabled } = useGuardModuleAccess(
    MODULE_SLUGS.RESIDENT_DIRECTORY,
  );

  const {
    data: residents = [],
    isLoading,
    error,
    isSuccess,
  } = useGuardCommunityDirectoryMembers({
    enabled: residentDirectoryEnabled,
  });
  useGuardCommunityDirectorySubscription({ enabled: residentDirectoryEnabled });

  useEffect(() => {
    let mounted = true;

    const hydrateRecentSearches = async () => {
      if (mounted) {
        setRecentSearches([]);
      }

      const nextRecentSearches = await loadRecentResidentSearches(
        authUser?.id,
        guard?.community_id || null,
      );
      if (mounted) {
        setRecentSearches(nextRecentSearches);
      }
    };

    hydrateRecentSearches();

    return () => {
      mounted = false;
    };
  }, [authUser?.id, guard?.community_id]);

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
      email: resident.email,
      unit:
        resident.block === 'N/A'
          ? roleLabel(resident.role)
          : `${t('residentsTab:block')} ${resident.block}-${resident.flatNo} (${roleLabel(
              resident.role,
            )})`,
      image: resident.avatarUrl,
    }));
  }, [residents, roleLabel, t]);

  const filteredResults = useMemo(() => {
    if (!search.trim()) return [];

    const searchLower = search.toLowerCase();
    return allResidents.filter(
      (resident) =>
        resident.name.toLowerCase().includes(searchLower) ||
        resident.unit.toLowerCase().includes(searchLower) ||
        (resident.phone || '').toLowerCase().includes(searchLower) ||
        (resident.email || '').toLowerCase().includes(searchLower),
    );
  }, [allResidents, search]);

  useEffect(() => {
    if (
      !authUser?.id ||
      !guard?.community_id ||
      !isSuccess ||
      recentSearches.length === 0
    ) {
      return;
    }

    const residentById = new Map(allResidents.map((resident) => [resident.id, resident]));
    const syncedRecentSearches = recentSearches
      .map((entry) => {
        const currentResident = residentById.get(entry.id);
        if (!currentResident) {
          return null;
        }

        return {
          ...entry,
          memberId: currentResident.memberId,
          name: currentResident.name,
          unit: currentResident.unit,
          image: currentResident.image,
          phone: currentResident.phone,
          email: currentResident.email,
        };
      })
      .filter(Boolean);

    const currentSerialized = JSON.stringify(recentSearches);
    const nextSerialized = JSON.stringify(syncedRecentSearches);

    if (currentSerialized !== nextSerialized) {
      setRecentSearches(syncedRecentSearches);
      replaceRecentResidentSearches(authUser.id, guard.community_id, syncedRecentSearches);
    }
  }, [allResidents, authUser?.id, guard?.community_id, isSuccess, recentSearches]);

  const recentSearchList = useMemo(() => {
    return recentSearches.map((resident, index) => ({
      ...resident,
      key: `${resident.id}-${index}`,
      title: `${resident.name} (${resident.unit})`,
    }));
  }, [recentSearches]);

  const openResidentThread = useCallback(
    async (resident) => {
      if (authUser?.id && guard?.community_id) {
        const nextRecentSearches = await saveRecentResidentSearch(
          authUser.id,
          guard.community_id,
          resident,
        );
        setRecentSearches(nextRecentSearches);
      }

      navigation.navigate('messageScreen', {
        image: resident.image
          ? { uri: resident.image }
          : require('../assets/images/guard.png'),
        name: resident.name,
        key: resident.id,
        id: resident.id,
        memberId: resident.memberId,
      });
    },
    [authUser?.id, guard?.community_id, navigation],
  );

  const handleClearRecentSearches = useCallback(async () => {
    await clearRecentResidentSearches(authUser?.id, guard?.community_id || null);
    setRecentSearches([]);
  }, [authUser?.id, guard?.community_id]);

  const formatRecentSearchTime = useCallback((timestamp) => {
    if (!timestamp) return '';

    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }, []);

  const hasRecentSearches = recentSearchList.length > 0;

  const renderEmptyRecentState = () => (
    <View
      style={{
        marginTop: Default.fixPadding * 6,
        alignItems: 'center',
        paddingHorizontal: Default.fixPadding * 2,
      }}
    >
      <MaterialIcons name='history' size={32} color={Colors.grey} />
      <Text
        style={{
          ...Fonts.SemiBold16grey,
          marginTop: Default.fixPadding,
          textAlign: 'center',
        }}
      >
        {tr('noRecentLookups')}
      </Text>
      <Text
        style={{
          ...Fonts.Medium14grey,
          marginTop: Default.fixPadding * 0.5,
          textAlign: 'center',
        }}
      >
        {tr('recentLookupHint')}
      </Text>
    </View>
  );

  const renderResidentCallAction = useCallback(
    (resident) => {
      navigation.navigate('callScreen', {
        image: resident.image
          ? { uri: resident.image }
          : require('../assets/images/guard.png'),
        name: resident.name,
        phone: resident.phone,
        id: resident.id,
        memberId: resident.memberId,
        calleeProfileId: resident.memberId || resident.id,
      });
    },
    [navigation],
  );

  const renderSearchResult = ({ item }) => {
    const conversation = conversationsByPartner.get(item.id);
    const lastMessage = formatMessagePreview(conversation?.lastMessage);

    return (
      <TouchableOpacity
        onPress={() => openResidentThread(item)}
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
              {`${tr('lastMessagePrefix')} ${lastMessage}`}
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
            onPress={() => renderResidentCallAction(item)}
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
        onPress={() => openResidentThread(item)}
        style={{
          flexDirection: isRtl ? 'row-reverse' : 'row',
          alignItems: 'center',
          marginBottom: Default.fixPadding,
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
          <MaterialIcons name='history' size={18} color={Colors.grey} />
          <View
            style={{
            flex: 1,
            alignItems: isRtl ? 'flex-end' : 'flex-start',
            marginHorizontal: Default.fixPadding,
          }}
        >
          <Text numberOfLines={1} style={{ ...Fonts.Medium16primary, overflow: 'hidden' }}>
            {item.title}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              ...Fonts.Medium12grey,
              overflow: 'hidden',
              marginTop: Default.fixPadding * 0.3,
            }}
          >
            {`${tr('openedPrefix')} ${formatRecentSearchTime(item.updatedAt)}`}
          </Text>
        </View>
        </View>

        <TouchableOpacity
          onPress={() => renderResidentCallAction(item)}
          style={{ padding: Default.fixPadding * 0.5 }}
        >
          <MaterialCommunityIcons name='phone-outline' size={20} color={Colors.grey} />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (!modulesLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.white }}>
        <MyStatusBar />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size='large' color={Colors.primary} />
        </View>
      </View>
    );
  }

  if (modulesLoaded && !residentDirectoryEnabled) {
    return (
      <ModuleUnavailableState
        title={tr('directoryUnavailableTitle')}
        message={tr('directoryUnavailableMessage')}
        actionLabel={t('residentsTab:goBack')}
        onAction={() => navigation.goBack()}
      />
    );
  }

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
            {search.trim() ? (
              <TouchableOpacity onPress={() => setSearch('')}>
                <MaterialIcons name='close' size={20} color={Colors.grey} />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size='large' color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ ...Fonts.SemiBold16grey }}>{tr('loadError')}</Text>
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
                  {`${tr('searchResultsPrefix')} (${filteredResults.length})`}
                </Text>
              </View>
            )}
          />
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <MaterialIcons name='search-off' size={40} color={Colors.grey} />
            <Text style={{ ...Fonts.SemiBold16grey, marginTop: Default.fixPadding }}>
              {`${tr('noResultsPrefix')} "${search}"`}
            </Text>
          </View>
        )
      ) : hasRecentSearches ? (
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
                onPress={handleClearRecentSearches}
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
      ) : (
        renderEmptyRecentState()
      )}
    </View>
  );
};

export default SearchScreen;
