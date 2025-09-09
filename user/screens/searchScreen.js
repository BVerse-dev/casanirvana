import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  FlatList,
  TextInput,
  Alert,
  Image,
} from "react-native";
import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MyStatusBar from "../components/myStatusBar";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useChatEnhancements } from "../hooks/useChats";

const SearchScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`searchScreen:${key}`);
  }

  const backAction = () => {
    navigation.pop();
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => {
      const subscription = BackHandler.addEventListener("hardwareBackPress", backAction); 
      return () => subscription?.remove(); 
    }
  }, []);

  const [search, setSearch] = useState("");
  const [clearAll, setClearAll] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Get chat enhancements for real chat data
  const { enhanceChatItem } = useChatEnhancements();

  // All residents data - same as ResidentsTab
  const allResidents = [
    { name: "Emmanuel Broni", unit: "Block A-101 (Owner)", image: require("../assets/images/img14.png") },
    { name: "James Brown", unit: "Block A-102 (Owner)", image: require("../assets/images/img15.png") },
    { name: "Sarah Williams", unit: "Block A-103 (Owner)", image: require("../assets/images/member7.png") },
    { name: "David Brown", unit: "Block A-104 (Owner)", image: require("../assets/images/img16.png") },
    { name: "Robert Johnson", unit: "Block B-101 (Owner)", image: require("../assets/images/member9.png") },
    { name: "Lisa Davis", unit: "Block B-102 (Tenant)", image: require("../assets/images/img17.png") },
    { name: "Eva Davis", unit: "Block B-103 (Owner)", image: require("../assets/images/img18.png") },
    { name: "Jane Smith", unit: "Block B-104 (Tenant)", image: require("../assets/images/img19.png") },
    { name: "Maria Garcia", unit: "Block C-101 (Owner)", image: require("../assets/images/member13.png") },
    { name: "John Doe", unit: "Block C-102 (Tenant)", image: require("../assets/images/img1.png") },
  ];

  // Filter residents based on search
  const filteredResults = useMemo(() => {
    if (!search.trim()) return [];
    
    const searchLower = search.toLowerCase();
    return allResidents.filter(resident => 
      resident.name.toLowerCase().includes(searchLower) ||
      resident.unit.toLowerCase().includes(searchLower)
    );
  }, [search]);

  // Handle voice search
  const handleVoiceSearch = async () => {
    try {
      setIsListening(true);
      
      // For now, we'll show an alert for voice search since Expo Speech doesn't have built-in voice recognition
      // In a production app, you'd use react-native-voice or similar
      Alert.alert(
        "Voice Search",
        "Voice search feature coming soon! For now, please type your search.",
        [{ text: "OK", onPress: () => setIsListening(false) }]
      );
    } catch (error) {
      console.error("Voice search error:", error);
      setIsListening(false);
    }
  };

  // Get user ID for navigation
  const getUserIdByName = (name) => {
    const nameToId = {
      "Emmanuel Broni": "75af3e6b-8bfe-4cf4-b70b-adad3d4edaad",
      "James Brown": "44444444-4444-4444-4444-444444444444",
      "Lisa Davis": "55555555-5555-5555-5555-555555555555",
      "David Brown": "0ccdd312-2af4-4498-a418-c2bce5e71801",
      "Robert Johnson": "22222222-2222-2222-2222-222222222222",
      "Eva Davis": "404953a9-7fb7-4de6-8809-217b2659d142",
      "Sarah Williams": "93cb86a7-c185-43bd-b5af-31faeade3d42",
      "John Doe": "3edc8dff-dcd9-49f4-8b12-434c5a637cbb",
      "Maria Garcia": "33333333-3333-3333-3333-333333333333",
      "Jane Smith": "cdc80950-b84b-4a73-a63b-0da8709fe1bd",
    };
    return nameToId[name] || "22222222-2222-2222-2222-222222222222";
  };

  // Recent searches with real resident data
  const recentSearchList = [
    { key: "1", title: "Emmanuel Broni (Block A-101)", name: "Emmanuel Broni" },
    { key: "2", title: "James Brown (Block A-102)", name: "James Brown" },
    { key: "3", title: "Sarah Williams (Block A-103)", name: "Sarah Williams" },
    { key: "4", title: "David Brown (Block A-104)", name: "David Brown" },
  ];

  // Render search results
  const renderSearchResult = ({ item }) => {
    const enhancedChat = enhanceChatItem({ name: item.name, message: "Tap to start conversation" });
    
    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("messageScreen", {
            image: item.image,
            name: item.name,
            key: "1",
            id: getUserIdByName(item.name),
            memberId: getUserIdByName(item.name),
          });
        }}
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
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
            typeof item.image === 'number' 
              ? item.image 
              : typeof item.image === 'string' && item.image.startsWith('http')
                ? { uri: item.image }
                : require("../assets/images/pic1.png")
          }
          style={{
            width: 50,
            height: 50,
            borderRadius: 25,
            resizeMode: "cover",
          }}
        />
        <View
          style={{
            flex: 1,
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
              marginTop: Default.fixPadding * 0.3,
            }}
          >
            {item.unit}
          </Text>
          {enhancedChat.lastMessage && enhancedChat.lastMessage !== "Tap to start a conversation" && (
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.Medium12grey,
                overflow: "hidden",
                marginTop: Default.fixPadding * 0.2,
                fontStyle: 'italic',
              }}
            >
              Last: {enhancedChat.lastMessage}
            </Text>
          )}
        </View>
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("callScreen", {
              image: item.image,
              name: item.name,
              id: getUserIdByName(item.name),
              memberId: getUserIdByName(item.name),
            });
          }}
          style={{ padding: Default.fixPadding * 0.5 }}
        >
          <MaterialCommunityIcons
            name="phone-outline"
            size={20}
            color={Colors.grey}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderRecentItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() => setSearch(item.name)}
        style={{
          alignItems: isRtl ? "flex-end" : "flex-start",
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
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          marginTop: Default.fixPadding * 1.2,
          marginHorizontal: Default.fixPadding * 2,
        }}
      >
        <TouchableOpacity onPress={() => navigation.pop()}>
          <Ionicons
            name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"}
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
              flexDirection: isRtl ? "row-reverse" : "row",
              alignItems: "center",
              paddingVertical: Default.fixPadding * 1.2,
              paddingLeft: Default.fixPadding * 2,
              paddingRight: Default.fixPadding * 1.2,
              borderRadius: 5,
              backgroundColor: Colors.white,
              ...Default.shadow,
            }}
          >
            <MaterialIcons name="search" size={20} color={Colors.grey} />
            <TextInput
              autoFocus={true}
              value={search}
              onChangeText={setSearch}
              placeholder={tr("search")}
              placeholderTextColor={Colors.grey}
              selectionColor={Colors.primary}
              style={{
                ...Fonts.SemiBold16black,
                flex: 1,
                textAlign: isRtl ? "right" : "left",
                marginHorizontal: Default.fixPadding,
              }}
            />
            <TouchableOpacity onPress={handleVoiceSearch}>
              <MaterialIcons 
                name={isListening ? "mic" : "mic-none"} 
                size={20} 
                color={isListening ? Colors.primary : Colors.grey} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Show search results if actively searching */}
      {search.trim() ? (
        filteredResults.length > 0 ? (
          <FlatList
            data={filteredResults}
            renderItem={renderSearchResult}
            keyExtractor={(item, index) => `search-${index}`}
            showsVerticalScrollIndicator={false}
            ListHeaderComponent={() => (
              <View
                style={{
                  marginTop: Default.fixPadding * 2,
                  marginBottom: Default.fixPadding,
                  marginHorizontal: Default.fixPadding * 2,
                }}
              >
                <Text
                  style={{
                    ...Fonts.SemiBold16black,
                  }}
                >
                  Search Results ({filteredResults.length})
                </Text>
              </View>
            )}
          />
        ) : (
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <MaterialIcons name="search-off" size={40} color={Colors.grey} />
            <Text
              style={{ ...Fonts.SemiBold16grey, marginTop: Default.fixPadding }}
            >
              No results found for "{search}"
            </Text>
          </View>
        )
      ) : clearAll ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <MaterialIcons name="search-off" size={40} color={Colors.grey} />
          <Text
            style={{ ...Fonts.SemiBold16grey, marginTop: Default.fixPadding }}
          >
            {tr("noSearch")}
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
                flexDirection: isRtl ? "row-reverse" : "row",
                alignItems: "center",
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
                  overflow: "hidden",
                }}
              >
                {tr("recentSearch")}
              </Text>
              <TouchableOpacity
                onPress={() => setClearAll(true)}
                style={{
                  flex: 3,
                  alignItems: isRtl ? "flex-start" : "flex-end",
                  marginLeft: isRtl ? 0 : Default.fixPadding,
                  marginRight: isRtl ? Default.fixPadding : 0,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{ ...Fonts.SemiBold14grey, overflow: "hidden" }}
                >
                  {tr("clearAll")}
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
