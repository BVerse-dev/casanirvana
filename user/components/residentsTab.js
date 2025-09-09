import React from "react";
import { Text, View, TouchableOpacity, Image, FlatList } from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import { ms } from "react-native-size-matters/extend";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const ResidentsTab = ({ navigation }) => {
  const { i18n } = useTranslation();

  const isRtl = i18n.dir() == "rtl";

  // Simple mapping of mock names to real user IDs from Casa Nirvana residents
  // Using same names as ChatsTab for consistency
  const getUserIdByName = (name) => {
    const nameToId = {
      "Emmanuel Broni": "75af3e6b-8bfe-4cf4-b70b-adad3d4edaad", // Real Emmanuel Broni
      "James Brown": "44444444-4444-4444-4444-444444444444", // Real James Brown
      "Lisa Davis": "55555555-5555-5555-5555-555555555555", // Real Lisa Davis
      "David Brown": "0ccdd312-2af4-4498-a418-c2bce5e71801", // Real David Brown
      "Robert Johnson": "22222222-2222-2222-2222-222222222222", // Real Robert Johnson
      "Eva Davis": "404953a9-7fb7-4de6-8809-217b2659d142", // Real Eva Davis
      "Sarah Williams": "93cb86a7-c185-43bd-b5af-31faeade3d42", // Real Carol Williams mapped to Sarah
      "John Doe": "3edc8dff-dcd9-49f4-8b12-434c5a637cbb", // Real John Doe
      "Maria Garcia": "33333333-3333-3333-3333-333333333333", // Real Maria Garcia
      "Jane Smith": "cdc80950-b84b-4a73-a63b-0da8709fe1bd", // Real Bob Smith mapped to Jane
    };
    return nameToId[name] || "22222222-2222-2222-2222-222222222222"; // Default to Robert Johnson
  };

  const residentsList = [
    {
      key: "1",
      title: "Block A",
      member: [
        {
          key: "1",
          image: require("../assets/images/img14.png"),
          name: "Emmanuel Broni",
          other: "Block A-101 (Owner)",
        },
        {
          key: "2",
          image: require("../assets/images/img15.png"),
          name: "James Brown",
          other: "Block A-102 (Owner)",
        },
        {
          key: "3",
          image: require("../assets/images/member7.png"),
          name: "Sarah Williams",
          other: "Block A-103 (Owner)",
        },
        {
          key: "4",
          image: require("../assets/images/img16.png"),
          name: "David Brown",
          other: "Block A-104 (Owner)",
        },
      ],
    },
    {
      key: "2",
      title: "Block B",
      member: [
        {
          key: "1",
          image: require("../assets/images/member9.png"),
          name: "Robert Johnson",
          other: "Block B-101 (Owner)",
        },
        {
          key: "2",
          image: require("../assets/images/img17.png"),
          name: "Lisa Davis",
          other: "Block B-102 (Tenant)",
        },
        {
          key: "3",
          image: require("../assets/images/img18.png"),
          name: "Eva Davis",
          other: "Block B-103 (Owner)",
        },
        {
          key: "4",
          image: require("../assets/images/img19.png"),
          name: "Jane Smith",
          other: "Block B-104 (Tenant)",
        },
      ],
    },
    {
      key: "3",
      title: "Block C",
      member: [
        {
          key: "1",
          image: require("../assets/images/member13.png"),
          name: "Maria Garcia",
          other: "Block C-101 (Owner)",
        },
        {
          key: "2",
          image: require("../assets/images/img1.png"),
          name: "John Doe",
          other: "Block C-102 (Tenant)",
        },
      ],
    },
  ];

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
        {item.member.map((item) => {
          return (
            <View
              key={item.key}
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
                    typeof item.image === 'number' 
                      ? item.image 
                      : typeof item.image === 'string' && item.image.startsWith('http')
                        ? { uri: item.image }
                        : require("../assets/images/pic1.png") // Fallback resident avatar
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
                    {item.name}
                  </Text>
                  <Text
                    numberOfLines={1}
                    style={{
                      ...Fonts.Medium14grey,
                      overflow: "hidden",
                      marginTop: Default.fixPadding * 0.5,
                    }}
                  >
                    {item.other}
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
                      image: item.image,
                      name: item.name,
                      id: getUserIdByName(item.name),
                      memberId: getUserIdByName(item.name),
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
                      image: item.image,
                      name: item.name,
                      key: "1",
                      id: getUserIdByName(item.name),
                      memberId: getUserIdByName(item.name),
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

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <FlatList
        data={residentsList}
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
