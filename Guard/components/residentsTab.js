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

const roleLabel = (role) => {
  if (role === "admin") return "Admin";
  if (role === "committee") return "Committee";
  return "Member";
};

const ResidentsTab = ({ navigation }) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  const {
    data: residents = [],
    isLoading,
    error,
  } = useGuardCommunityDirectoryMembers();
  useGuardCommunityDirectorySubscription();

  const groupedResidents = useMemo(() => {
    const byBlock = new Map();

    residents.forEach((resident) => {
      const block = resident.block || "N/A";
      if (!byBlock.has(block)) {
        byBlock.set(block, {
          key: block,
          title: block === "N/A" ? "Unassigned" : `Block ${block}`,
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
  }, [residents]);

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
                      image: member.image || require("../assets/images/guard.png"),
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
                      image: member.image || require("../assets/images/guard.png"),
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
          Loading residents...
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
          Unable to load residents
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
          No residents found for this community
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
