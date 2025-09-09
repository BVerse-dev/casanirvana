import React from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  StyleSheet,
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import { useFocusEffect } from "@react-navigation/native";
import { useChatEnhancements } from "../hooks/useChats";

const ChatsTab = ({ navigation }) => {
  const { i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";

  // Get real chat data enhancements
  const { enhanceChatItem, sortChatsByRecent, generateDynamicChatList, isLoading, immediateRefresh } = useChatEnhancements();

  // Auto-refresh chat data when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      console.log('🔄 ChatsTab focused - refreshing chat data...');
      // Small delay to ensure screen is fully focused
      const timeoutId = setTimeout(() => {
        immediateRefresh();
      }, 300); // Increased delay to 300ms
      
      return () => clearTimeout(timeoutId);
    }, []) // Empty dependencies to prevent re-running
  );

  // Simple mapping of mock names to real profile IDs from Casa Nirvana residents  
  const getUserIdByName = (name) => {
    const nameToId = {
      "Emmanuel Broni": "75af3e6b-8bfe-4cf4-b70b-adad3d4edaad", // Profile ID - Confirmed exists
      "Jane Smith": "de4086ba-79a1-43db-ad62-c8d0f01dc2a7", // Profile ID - Confirmed exists
      "Sarah Williams": "11111111-1111-1111-1111-111111111111", // Profile ID - Confirmed exists
      "John Doe": "3edc8dff-dcd9-49f4-8b12-434c5a637cbb", // Profile ID - Confirmed exists
      "Eva Davis": "404953a9-7fb7-4de6-8809-217b2659d142", // Profile ID - Confirmed exists
      "Lisa Davis": "55555555-5555-5555-5555-555555555555", // Profile ID - Confirmed exists
      "Maria Garcia": "33333333-3333-3333-3333-333333333333", // Profile ID - Confirmed exists
      "James Brown": "44444444-4444-4444-4444-444444444444", // Profile ID - Confirmed exists
      "David Brown": "0ccdd312-2af4-4498-a418-c2bce5e71801", // Profile ID - Confirmed exists
      "Robert Johnson": "22222222-2222-2222-2222-222222222222", // Profile ID - Confirmed exists
      "Jerome Bell": "aaaabbbb-cccc-dddd-eeee-ffffaaaabbbb", // Profile ID - Newly created
    };
    return nameToId[name] || "de4086ba-79a1-43db-ad62-c8d0f01dc2a7"; // Default to Jane Smith profile ID
  };

  const chatList = [
    {
      key: "1",
      image: require("../assets/images/img1.png"),
      name: "Emmanuel Broni",
      time: "2.00am",
      message: "Hello, Good morning",
    },
    {
      key: "2",
      image: require("../assets/images/img2.png"),
      name: "Jane Smith",
      time: "2.00am",
      message: "Hello, Good morning",
    },
    {
      key: "3",
      image: require("../assets/images/image11.png"),
      name: "Sarah Williams",
      time: "2.00am",
      message: "Can i see your home",
    },
    {
      key: "5",
      image: require("../assets/images/image1.png"),
      name: "Eva Davis",
      time: "2.00am",
      message: "Hello, Good morning",
    },
    {
      key: "6",
      image: require("../assets/images/image2.png"),
      name: "John Doe",
      time: "2.00am",
      message: "Can i see your home",
    },
    {
      key: "7",
      image: require("../assets/images/image3.png"),
      name: "Jerome Bell",
      time: "2.00am",
      message: "Can i see your home",
    },
    {
      key: "8",
      image: require("../assets/images/image4.png"),
      name: "Robert Johnson",
      time: "2.00am",
      message: "Can i see your home",
    },
    {
      key: "9",
      image: require("../assets/images/image5.png"),
      name: "Lisa Davis", 
      time: "2.00am",
      message: "Development is in process.",
    },
    {
      key: "10",
      image: require("../assets/images/image8.png"),
      name: "Maria Garcia",
      time: "2.00am",
      message: "Hello, Good morning",
    },
    {
      key: "11",
      image: require("../assets/images/image9.png"),
      name: "James Brown",
      time: "2.00am",
      message: "Development is in process.",
    },
    {
      key: "12",
      image: require("../assets/images/image10.png"),
      name: "David Brown",
      time: "2.00am",
      message: "Can i see your home",
    },
  ];

  const renderItem = ({ item }) => {
    const enhancedItem = enhanceChatItem(item);
    
    // Debug log to see what's happening
    console.log(`🎯 Rendering chat item for ${item.name}:`, {
      originalMessage: item.message,
      enhancedLastMessage: enhancedItem.lastMessage,
      enhancedTime: enhancedItem.time,
      hasEnhancement: !!enhancedItem.lastMessage && enhancedItem.lastMessage !== 'Tap to start a conversation'
    });
    
    return (
      <TouchableOpacity
        onPress={() =>
          navigation.push("messageScreen", {
            image: enhancedItem.image,
            name: enhancedItem.name,
            key: "1",
            id: getUserIdByName(enhancedItem.name),
            memberId: getUserIdByName(enhancedItem.name),
          })
        }
        style={{
          flex: 1,
          flexDirection: isRtl ? "row-reverse" : "row",
          marginBottom: Default.fixPadding * 2,
          marginHorizontal: Default.fixPadding * 2,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
          }}
        >
          <View style={{ position: 'relative' }}>
            <Image 
              source={
                typeof enhancedItem.image === 'number' 
                  ? enhancedItem.image 
                  : typeof enhancedItem.image === 'string' && enhancedItem.image.startsWith('http')
                    ? { uri: enhancedItem.image }
                    : require("../assets/images/guard.png") // Fallback chat avatar
              }
              style={styles.image} 
            />
            {/* Online status indicator */}
            {enhancedItem.isOnline && (
              <View
                style={{
                  position: 'absolute',
                  bottom: 2,
                  right: isRtl ? undefined : 2,
                  left: isRtl ? 2 : undefined,
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: Colors.green || '#4CAF50',
                  borderWidth: 2,
                  borderColor: Colors.white,
                }}
              />
            )}
          </View>

          <View
            style={{
              flex: 1,
              alignItems: isRtl ? "flex-end" : "flex-start",
              marginHorizontal: Default.fixPadding * 1.5,
            }}
          >
            <Text
              numberOfLines={1}
              style={{ ...Fonts.Medium16primary, overflow: "hidden" }}
            >
              {enhancedItem.name}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.Medium14grey,
                overflow: "hidden",
                marginTop: Default.fixPadding * 0.5,
              }}
            >
              {enhancedItem.lastMessage}
            </Text>
          </View>
        </View>

        <View style={{ alignItems: isRtl ? "flex-start" : "flex-end" }}>
          <Text
            numberOfLines={1}
            style={{
              ...Fonts.Medium14grey,
              overflow: "hidden",
              maxWidth: 70,
              textAlign: isRtl ? "left" : "right",
            }}
          >
            {enhancedItem.time}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };
  
  // Show loading state while chat data is being fetched
  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.white, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ ...Fonts.Medium16primary }}>Loading chats...</Text>
      </View>
    );
  }
  // Combine static dummy data with dynamic chat data from real messages
  const combinedChatList = () => {
    const dynamicChats = generateDynamicChatList ? generateDynamicChatList() : [];
    const staticNames = new Set(chatList.map(chat => chat.name));
    
    // Add dynamic chats that aren't already in static list, with unique keys
    const newChats = dynamicChats
      .filter(chat => !staticNames.has(chat.name))
      .map((chat, index) => ({
        ...chat,
        key: `dynamic_${chat.key || index}_${chat.name.replace(/\s+/g, '_')}`, // Ensure unique keys
      }));
    
    console.log('🔍 Combined chat list: Static =', chatList.length, 'Dynamic =', newChats.length);
    console.log('🔍 New dynamic users:', newChats.map(c => c.name));
    
    return [...chatList, ...newChats];
  };
  
  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <FlatList
        data={sortChatsByRecent(combinedChatList())}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.key || `chat_${index}_${item.name?.replace(/\s+/g, '_') || index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: Default.fixPadding,
        }}
        refreshing={isLoading}
        onRefresh={immediateRefresh} // Use immediate refresh for pull-to-refresh
      />
    </View>
  );
};

export default ChatsTab;

const styles = StyleSheet.create({
  image: {
    resizeMode: "cover",
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});
