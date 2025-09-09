import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  StyleSheet,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MyStatusBar from "../components/myStatusBar";
import { ms } from "react-native-size-matters/extend";
import { useListAmenities } from "../hooks/useListAmenities";
import { useHasJoinedCommunity } from '../hooks/useCommunityData';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const AmenityScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";
  const { profile } = useHasJoinedCommunity();

  function tr(key) {
    return t(`amenityScreen:${key}`);
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
    };
  }, []);

  // Fetch amenities from the database for the user's society only
  const { data: amenities, isLoading, error } = useListAmenities({
    society_id: profile?.society_id,
    enabled: !!profile?.society_id, // Only fetch if we have a society_id
  });

  // Debug information
  console.log('AmenityScreen - User profile:', profile);
  console.log('AmenityScreen - User society_id:', profile?.society_id);
  console.log('AmenityScreen - Amenities count:', amenities?.length);
  console.log('AmenityScreen - Amenities data:', amenities?.map(a => ({ id: a.id, name: a.name })));
  console.log('AmenityScreen - Loading state:', isLoading);
  console.log('AmenityScreen - Error:', error);

  // Show loading state while profile is loading
  if (!profile) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.white }}>
        <MyStatusBar />
        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            paddingVertical: Default.fixPadding * 1.2,
            paddingHorizontal: Default.fixPadding * 2,
          }}
        >
          <TouchableOpacity onPress={() => navigation.pop()}>
            <Ionicons
              name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"}
              size={25}
              color={Colors.black}
            />
          </TouchableOpacity>
          <Text
            style={{
              ...Fonts.SemiBold18black,
              marginHorizontal: Default.fixPadding,
            }}
          >
            {tr("selectAmenity")}
          </Text>
        </View>
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          marginTop: Default.fixPadding * 4
        }}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ 
            ...Fonts.Medium14Grey, 
            marginTop: Default.fixPadding,
            textAlign: 'center'
          }}>
            Loading your profile...
          </Text>
        </View>
      </View>
    );
  }

  // Show error if profile doesn't have society_id
  if (!profile.society_id) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.white }}>
        <MyStatusBar />
        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            paddingVertical: Default.fixPadding * 1.2,
            paddingHorizontal: Default.fixPadding * 2,
          }}
        >
          <TouchableOpacity onPress={() => navigation.pop()}>
            <Ionicons
              name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"}
              size={25}
              color={Colors.black}
            />
          </TouchableOpacity>
          <Text
            style={{
              ...Fonts.SemiBold18black,
              marginHorizontal: Default.fixPadding,
            }}
          >
            {tr("selectAmenity")}
          </Text>
        </View>
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          marginTop: Default.fixPadding * 4,
          marginHorizontal: Default.fixPadding * 2
        }}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={48}
            color={Colors.grey}
          />
          <Text style={{ 
            ...Fonts.Medium16Grey, 
            marginTop: Default.fixPadding,
            textAlign: 'center'
          }}>
            Community not found
          </Text>
          <Text style={{ 
            ...Fonts.Medium14Grey, 
            marginTop: Default.fixPadding / 2,
            textAlign: 'center'
          }}>
            Please contact your administrator to assign you to a community.
          </Text>
        </View>
      </View>
    );
  }

  // Transform the data to match the expected format
  const amenityList = amenities?.map((amenity) => ({
    key: amenity.id,
    image: amenity.image_urls && amenity.image_urls.length > 0 
      ? { uri: amenity.image_urls[0] }
      : require("../assets/images/booked1.png"), // fallback image
    name: amenity.name,
    other: amenity.is_paid 
      ? amenity.charges_per_hour > 0 
        ? `GH₵ ${amenity.charges_per_hour} per hour`
        : amenity.monthly_charges > 0
        ? `GH₵ ${amenity.monthly_charges} per month`
        : `GH₵ ${amenity.price}`
      : "Free",
    paid: amenity.is_paid,
    description: amenity.description,
    capacity: amenity.capacity,
    location: amenity.location,
    operating_hours: amenity.operating_hours,
    contact_person: amenity.contact_person,
    contact_phone: amenity.contact_phone,
    booking_phone: amenity.booking_phone,
    // Add pricing fields to the item
    charges_per_hour: amenity.charges_per_hour,
    price: amenity.price,
    monthly_charges: amenity.monthly_charges,
    is_paid: amenity.is_paid,
  })) || [];

  const renderItem = ({ item }) => {
    return (
      <TouchableOpacity
        onPress={() =>
          navigation.push("bookAmenityScreen", {
            image: item.image,
            name: item.name,
            amenityId: item.key,
            description: item.description,
            capacity: item.capacity,
            location: item.location,
            operating_hours: item.operating_hours,
            contact_person: item.contact_person,
            contact_phone: item.contact_phone,
            booking_phone: item.booking_phone,
            // Add pricing fields
            charges_per_hour: item.charges_per_hour,
            price: item.price,
            monthly_charges: item.monthly_charges,
            is_paid: item.is_paid,
          })
        }
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          ...styles.mainTouchOpacity,
        }}
      >
        <Image
          source={
            typeof item.image === 'number' 
              ? item.image 
              : typeof item.image === 'object' && item.image.uri
                ? item.image
                : require("../assets/images/booked1.png") // Fallback amenity icon
          }
          style={{
            width: ms(65),
            height: ms(65),
            borderTopLeftRadius: isRtl ? 0 : 10,
            borderBottomLeftRadius: isRtl ? 0 : 10,
            borderTopRightRadius: isRtl ? 10 : 0,
            borderBottomRightRadius: isRtl ? 10 : 0,
          }}
        />
        <View
          style={{
            flex: 1,
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            marginHorizontal: Default.fixPadding,
          }}
        >
          <View
            style={{ flex: 7, alignItems: isRtl ? "flex-end" : "flex-start" }}
          >
            <Text
              numberOfLines={1}
              style={{ ...Fonts.Medium16black, overflow: "hidden" }}
            >
              {item.name}
            </Text>
            <Text
              numberOfLines={1}
              style={{ ...Fonts.Medium14grey, overflow: "hidden" }}
            >
              {item.other}
            </Text>
          </View>
          <View
            style={{ flex: 3, alignItems: isRtl ? "flex-start" : "flex-end" }}
          >
            <Text
              numberOfLines={1}
              style={{
                ...(item.paid ? Fonts.SemiBold16green : Fonts.SemiBold16orange),
                overflow: "hidden",
                marginHorizontal: Default.fixPadding,
              }}
            >
              {item.paid ? tr("paid") : tr("free")}
            </Text>
          </View>
        </View>
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
          paddingVertical: Default.fixPadding * 1.2,
          paddingHorizontal: Default.fixPadding * 2,
        }}
      >
        <TouchableOpacity onPress={() => navigation.pop()}>
          <Ionicons
            name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"}
            size={25}
            color={Colors.black}
          />
        </TouchableOpacity>
        <Text
          style={{
            ...Fonts.SemiBold18black,
            marginHorizontal: Default.fixPadding,
          }}
        >
          {tr("selectAmenity")}
        </Text>
      </View>

      {isLoading ? (
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          marginTop: Default.fixPadding * 4
        }}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ 
            ...Fonts.Medium14Grey, 
            marginTop: Default.fixPadding,
            textAlign: 'center'
          }}>
            Loading amenities...
          </Text>
        </View>
      ) : error ? (
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          marginTop: Default.fixPadding * 4,
          marginHorizontal: Default.fixPadding * 2
        }}>
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={48}
            color={Colors.grey}
          />
          <Text style={{ 
            ...Fonts.Medium14Grey, 
            marginTop: Default.fixPadding,
            textAlign: 'center'
          }}>
            Failed to load amenities. Please try again.
          </Text>
          <TouchableOpacity
            style={{
              marginTop: Default.fixPadding,
              paddingHorizontal: Default.fixPadding * 2,
              paddingVertical: Default.fixPadding,
              backgroundColor: Colors.primary,
              borderRadius: 8,
            }}
            onPress={() => {
              // This will trigger a refetch via react-query
              navigation.replace('AmenityScreen');
            }}
          >
            <Text style={{ ...Fonts.Medium14white }}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : amenityList.length === 0 ? (
        <View style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          marginTop: Default.fixPadding * 4,
          marginHorizontal: Default.fixPadding * 2
        }}>
          <MaterialCommunityIcons
            name="home-outline"
            size={48}
            color={Colors.grey}
          />
          <Text style={{ 
            ...Fonts.Medium16Grey, 
            marginTop: Default.fixPadding,
            textAlign: 'center'
          }}>
            No amenities available
          </Text>
          <Text style={{ 
            ...Fonts.Medium14Grey, 
            marginTop: Default.fixPadding / 2,
            textAlign: 'center'
          }}>
            There are no amenities available for booking at the moment.
          </Text>
        </View>
      ) : (
        <FlatList
          data={amenityList}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: Default.fixPadding * 0.8 }}
        />
      )}
    </View>
  );
};

export default AmenityScreen;

const styles = StyleSheet.create({
  mainTouchOpacity: {
    flex: 1,
    alignItems: "center",
    marginBottom: Default.fixPadding * 2.1,
    marginHorizontal: Default.fixPadding * 2,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
});
