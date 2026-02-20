import React, { useMemo } from "react";
import { Text, View, TouchableOpacity, Image, FlatList } from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import { ms } from "react-native-size-matters/extend";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../utils/supabase";

const resolveUnit = (unitsValue) => {
  if (Array.isArray(unitsValue)) {
    return unitsValue[0] || null;
  }
  return unitsValue || null;
};

const deriveBlockName = (unit) => {
  if (!unit) {
    return "Residents";
  }
  if (unit.block) {
    return `Block ${unit.block}`;
  }
  if (unit.unit_number?.includes("-")) {
    return `Block ${unit.unit_number.split("-")[0]}`;
  }
  return "Residents";
};

const ResidentsTab = ({ navigation }) => {
  const { i18n } = useTranslation();
  const { profile } = useAuth();
  const isRtl = i18n.dir() === "rtl";

  const { data: residents = [], isLoading } = useQuery({
    queryKey: ["residents-tab", profile?.community_id, profile?.id],
    enabled: !!profile?.community_id && !!profile?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
            id,
            first_name,
            last_name,
            avatar_url,
            role,
            unit_id,
            units:units!profiles_unit_id_fkey(unit_number, block)
          `
        )
        .eq("community_id", profile.community_id)
        .neq("id", profile.id)
        .order("first_name", { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    },
  });

  const groupedResidents = useMemo(() => {
    const groups = new Map();
    residents.forEach((resident) => {
      const unit = resolveUnit(resident.units);
      const blockName = deriveBlockName(unit);
      const roleLabel = resident.role ? `(${resident.role})` : "";
      const secondary = unit?.unit_number
        ? `${unit.unit_number} ${roleLabel}`.trim()
        : roleLabel || "Resident";

      const formatted = {
        id: resident.id,
        image: resident.avatar_url,
        name: `${resident.first_name || ""} ${resident.last_name || ""}`.trim() || "Resident",
        secondary,
      };

      if (!groups.has(blockName)) {
        groups.set(blockName, []);
      }
      groups.get(blockName).push(formatted);
    });

    return [...groups.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([title, members]) => ({ title, members }));
  }, [residents]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.white, justifyContent: "center", alignItems: "center" }}>
        <Text style={Fonts.Medium14grey}>Loading residents...</Text>
      </View>
    );
  }

  if (!groupedResidents.length) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.white, justifyContent: "center", alignItems: "center" }}>
        <Text style={Fonts.Medium14grey}>No residents available.</Text>
      </View>
    );
  }

  const renderMember = (member) => (
    <View
      key={member.id}
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
              : require("../assets/images/pic1.png")
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
          <Text numberOfLines={1} style={{ ...Fonts.Medium16primary, overflow: "hidden" }}>
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
            {member.secondary}
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
              image: member.image ? { uri: member.image } : require("../assets/images/pic1.png"),
              name: member.name,
              id: member.id,
              memberId: member.id,
            })
          }
          style={{
            marginRight: isRtl ? 0 : Default.fixPadding * 2,
            marginLeft: isRtl ? Default.fixPadding * 2 : 0,
          }}
        >
          <MaterialCommunityIcons name="phone-outline" size={22} color={Colors.grey} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() =>
            navigation.push("messageScreen", {
              image: member.image ? { uri: member.image } : require("../assets/images/pic1.png"),
              name: member.name,
              key: "1",
              id: member.id,
              memberId: member.id,
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

  const renderItem = ({ item }) => (
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
      {item.members.map(renderMember)}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <FlatList
        data={groupedResidents}
        renderItem={renderItem}
        keyExtractor={(item) => item.title}
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
