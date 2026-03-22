import React, { useMemo } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import { ms } from "react-native-size-matters/extend";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import {
  useGuardCommunityDirectoryMembers,
  useGuardCommunityDirectorySubscription,
} from "../hooks/useCommunityDirectoryMembers";
import ModuleUnavailableState from "./ModuleUnavailableState";
import { useGuardModuleAccess, MODULE_SLUGS } from "../hooks/useGuardModuleAccess";

const toRouteImageSource = (image) =>
  typeof image === "string" && image
    ? { uri: image }
    : require("../assets/images/guard.png");

const ResidentsTab = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const tr = (key) => t(`residentsTab:${key}`);
  const { modulesLoaded, enabled: residentDirectoryEnabled } = useGuardModuleAccess(
    MODULE_SLUGS.RESIDENT_DIRECTORY
  );
  const roleLabel = (role) => {
    if (role === "admin") return tr("roleAdmin");
    if (role === "committee") return tr("roleCommittee");
    return tr("roleMember");
  };

  const {
    data: residents = [],
    isLoading,
    error,
  } = useGuardCommunityDirectoryMembers({ enabled: residentDirectoryEnabled });
  useGuardCommunityDirectorySubscription({ enabled: residentDirectoryEnabled });

  const groupedResidents = useMemo(() => {
    const byBlock = new Map();

    residents.forEach((resident) => {
      const block = resident.block || "N/A";
      if (!byBlock.has(block)) {
        byBlock.set(block, {
          key: block,
          title: block === "N/A" ? tr("unassigned") : `${tr("block")} ${block}`,
          member: [],
        });
      }

      byBlock.get(block).member.push({
        key: resident.id,
        id: resident.id,
        memberId: resident.id,
        image: resident.avatarUrl,
        name: resident.name,
        phone: resident.phone,
        other:
          block === "N/A"
            ? `${roleLabel(resident.role)}`
            : `Block ${resident.block}-${resident.flatNo} (${roleLabel(resident.role)})`,
      });
    });

    return Array.from(byBlock.values()).sort((a, b) =>
      a.title.localeCompare(b.title),
    );
  }, [residents, t]);

  if (!modulesLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.white,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (modulesLoaded && !residentDirectoryEnabled) {
    return (
      <ModuleUnavailableState
        title={tr("directoryUnavailableTitle")}
        message={tr("directoryUnavailableMessage")}
        actionLabel={tr("goBack")}
        onAction={() => {
          if (navigation?.canGoBack?.()) {
            navigation.goBack();
            return;
          }

          navigation?.navigate?.("chatsTab");
        }}
      />
    );
  }

  const renderItem = ({ item }) => {
    return (
      <View
        style={{
          alignItems: isRtl ? "flex-end" : "flex-start",
          marginHorizontal: Default.fixPadding * 2,
          marginBottom: Default.fixPadding * 0.5,
        }}
      >
        <Text style={{ ...Fonts.Medium16primary }}>{item.title}</Text>
        <View
          style={{
            width: ms(46),
            marginTop: Default.fixPadding * 0.5,
            marginBottom: Default.fixPadding * 2,
            borderTopWidth: 4,
            borderTopColor: Colors.primary,
          }}
        />
        {item.member.map((member) => {
          return (
            <View
              key={member.key}
              style={{
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
                marginBottom: Default.fixPadding * 2,
              }}
            >
              <View
                style={{
                  flex: 8,
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                }}
              >
                <Image
                  source={
                    typeof member.image === "string" && member.image
                      ? { uri: member.image }
                      : require("../assets/images/guard.png")
                  }
                  style={{
                    resizeMode: "cover",
                    width: 50,
                    height: 50,
                    borderRadius: 25,
                  }}
                />
                <View
                  style={{
                    flex: 6.5,
                    alignItems: isRtl ? "flex-end" : "flex-start",
                    marginHorizontal: Default.fixPadding,
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{ ...Fonts.Medium16primary, overflow: "hidden" }}
                  >
                    {member.name}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{
                      ...Fonts.Medium14grey,
                      overflow: "hidden",
                      marginTop: Default.fixPadding * 0.5,
                    }}
                  >
                    {member.other}
                  </Text>
                </View>
              </View>

              <View
                style={{
                  flex: 2,
                  flexDirection: isRtl ? "row-reverse" : "row",
                  justifyContent: "flex-end",
                  alignItems: "center",
                }}
              >
                <TouchableOpacity
                  onPress={() =>
                    navigation.push("callScreen", {
                      image: toRouteImageSource(member.image),
                      name: member.name,
                      phone: member.phone,
                      id: member.id,
                      memberId: member.memberId,
                      calleeProfileId: member.memberId || member.id,
                    })
                  }
                  style={{
                    marginRight: isRtl ? 0 : Default.fixPadding * 2,
                    marginLeft: isRtl ? Default.fixPadding * 2 : 0,
                  }}
                >
                  <MaterialCommunityIcons
                    name="phone-outline"
                    size={22}
                    color={Colors.grey}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() =>
                    navigation.push("messageScreen", {
                      image: toRouteImageSource(member.image),
                      name: member.name,
                      key: member.key,
                      id: member.id,
                      memberId: member.memberId,
                    })
                  }
                >
                  <MaterialCommunityIcons
                    name="message-processing-outline"
                    size={22}
                    color={Colors.grey}
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.white,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ ...Fonts.Medium14grey, marginTop: Default.fixPadding }}>
          {tr("loadingResidents")}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.white,
          paddingHorizontal: Default.fixPadding * 2,
        }}
      >
        <Text style={{ ...Fonts.Medium16black, textAlign: "center" }}>
          {tr("loadError")}
        </Text>
      </View>
    );
  }

  if (groupedResidents.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.white,
          paddingHorizontal: Default.fixPadding * 2,
        }}
      >
        <Text style={{ ...Fonts.Medium16black, textAlign: "center" }}>
          {tr("emptyState")}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <FlatList
        data={groupedResidents}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: Default.fixPadding,
          paddingBottom: Default.fixPadding,
        }}
      />
    </View>
  );
};

export default ResidentsTab;
