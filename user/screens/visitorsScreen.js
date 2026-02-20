import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  Image,
  FlatList,
  Linking,
  Alert,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MyStatusBar from "../components/myStatusBar";
import { ms } from "react-native-size-matters/extend";
import DashedLine from "react-native-dashed-line";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";
import AwesomeButton from "react-native-really-awesome-button";
import GatePassModal from "../components/gatePassModal";
import SnackbarToast from "../components/snackbarToast";
import { useListVisitors } from "../hooks/useListVisitors";
import { useDeleteVisitor } from "../hooks/useDeleteVisitor";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../contexts/AuthContext";
import moment from "moment";

const VisitorsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const { user, profile } = useAuth();

  const isRtl = i18n.dir() === "rtl";

  function tr(key) {
    return t(`visitorsScreen:${key}`);
  }

  // Hooks for Supabase data
  const { data: visitorsData = [], isLoading, error, refetch } = useListVisitors();
  const deleteVisitorMutation = useDeleteVisitor();

  const backAction = useCallback(() => {
    navigation.pop();
    return true;
  }, [navigation]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => subscription.remove();
  }, [backAction]);

  const [removeVisitor, setRemoveVisitor] = useState(false);
  const onDismissRemoveVisitor = () => setRemoveVisitor(false);

  const [openGatePassModal, setOpenGatePassModal] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState(null);

  const deleteItemHandle = async (visitorId) => {
    // Show confirmation dialog before deleting
    Alert.alert(
      tr("confirmDelete") || "Confirm Delete",
      tr("deleteConfirmMessage") || "Are you sure you want to delete this visitor?",
      [
        {
          text: tr("cancel") || "Cancel",
          style: "cancel"
        },
        {
          text: tr("delete") || "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              console.log('🗑️ Starting delete for visitor:', visitorId);
              
              // Optimistically remove from UI immediately
              queryClient.setQueryData(['visitor-passes', user?.id, profile?.unit_id], (oldData) => {
                if (!oldData) return oldData;
                return oldData.filter(visitor => visitor.id !== visitorId);
              });
              
              await deleteVisitorMutation.mutateAsync(visitorId);
              setRemoveVisitor(true);
              console.log('✅ Visitor deleted successfully');
              
            } catch (error) {
              console.error('❌ Error deleting visitor:', error);
              
              // Revert optimistic update on error
              queryClient.invalidateQueries({ 
                predicate: (query) => query.queryKey[0] === 'visitor-passes'
              });
              
              Alert.alert(
                tr("error") || "Error", 
                tr("deleteErrorMessage") || "Failed to delete visitor. Please try again."
              );
            }
          }
        }
      ]
    );
  };

  const formatStatusLabel = (status) => {
    switch (status) {
      case "approved":
        return tr("preApproved");
      case "pending":
        return "Pending";
      case "checked_in":
        return tr("inside");
      case "checked_out":
        return "Checked Out";
      case "denied":
        return "Denied";
      case "cancelled":
        return "Cancelled";
      case "expired":
        return "Expired";
      default:
        return tr("serviceBooked");
    }
  };

  // Helper function to determine visitor status and display
  const getVisitorStatus = (visitor) => {
    if (visitor.checked_in_at && !visitor.checked_out_at) {
      return {
        status: "checked_in",
        color: Colors.red,
        text: tr("inside"),
        fontStyle: Fonts.Medium15red,
      };
    }

    switch (visitor.status) {
      case "approved":
        return {
          status: "approved",
          color: Colors.orange,
          text: tr("preApproved"),
          fontStyle: Fonts.Medium15orange,
        };
      case "pending":
        return {
          status: "pending",
          color: Colors.orange,
          text: "Pending",
          fontStyle: Fonts.Medium15orange,
        };
      case "checked_out":
        return {
          status: "checked_out",
          color: Colors.grey,
          text: "Checked Out",
          fontStyle: Fonts.Medium15grey,
        };
      case "denied":
      case "cancelled":
      case "expired":
        return {
          status: visitor.status,
          color: Colors.red,
          text: formatStatusLabel(visitor.status),
          fontStyle: Fonts.Medium15red,
        };
      default:
        return {
          status: visitor.status || "unknown",
          color: Colors.green,
          text: formatStatusLabel(visitor.status),
          fontStyle: Fonts.Medium15green,
        };
    }
  };

  // Helper function to format visitor display data
  const formatVisitorForDisplay = (visitor) => {
    const statusInfo = getVisitorStatus(visitor);
    
    // Format date and time
    const visitDate = moment(visitor.from_date || visitor.visit_date);
    const endDate = moment(visitor.to_date);
    let dateTimeDisplay;
    
    if (visitor.to_date && visitDate.format('YYYY-MM-DD') === endDate.format('YYYY-MM-DD')) {
      // Same day - show time range
      dateTimeDisplay = `${visitDate.format('D MMM')}, ${visitDate.format('HH:mm')} to ${endDate.format('HH:mm')}`;
    } else {
      // Different days or single time
      dateTimeDisplay = `${visitDate.format('D MMM')}, ${visitDate.format('HH:mm')}`;
    }

    // Determine visitor image based on type
    let visitorImage;
    switch (visitor.visitor_type) {
      case 'service':
        visitorImage = require("../assets/images/member12.png");
        break;
      case 'guest':
        visitorImage = require("../assets/images/visitor4.png");
        break;
      case 'cab':
        visitorImage = require("../assets/images/visitor1.png");
        break;
      case 'delivery':
        visitorImage = require("../assets/images/visitor3.png");
        break;
      default:
        visitorImage = require("../assets/images/visitor2.png");
    }

    return {
      key: visitor.id,
      id: visitor.id,
      image: visitorImage,
      title: visitor.visitor_name,
      dateTime: dateTimeDisplay,
      inside: statusInfo.status === "checked_in",
      preApproved: statusInfo.status === "approved",
      serviceBooked: !["checked_in", "approved"].includes(statusInfo.status),
      visitor: visitor, // Keep original visitor data
      statusInfo
    };
  };

  // Helper function to handle phone calls
  const handlePhoneCall = (visitor) => {
    // Check if visitor has a phone number and is not a cab
    if (!visitor.visitor_phone || visitor.visitor_type === 'cab') {
      // For cabs or visitors without phone numbers, do nothing (button will be disabled)
      return;
    }

    // Clean the phone number (remove spaces, dashes, etc.)
    const cleanPhoneNumber = visitor.visitor_phone.replace(/[^\d+]/g, '');
    
    // Create the phone URL
    const phoneUrl = `tel:${cleanPhoneNumber}`;
    
    // Check if the device can open the phone app
    Linking.canOpenURL(phoneUrl)
      .then((supported) => {
        if (supported) {
          // Open the phone app with the number
          return Linking.openURL(phoneUrl);
        } else {
          // Show error if phone app is not available
          Alert.alert('Error', 'Phone app is not available on this device');
        }
      })
      .catch((error) => {
        console.error('Error opening phone app:', error);
        Alert.alert('Error', 'Failed to open phone app');
      });
  };

  // Helper function to check if call button should be enabled
  const isCallEnabled = (visitor) => {
    return visitor.visitor_phone && 
           visitor.visitor_phone.trim() !== '' && 
           visitor.visitor_type !== 'cab';
  };

  const renderItem = ({ item, index }) => {
    // Format visitor data for display
    const displayItem = formatVisitorForDisplay(item);
    const lastIndex = visitorsData.length - 1 === index;

    return (
      <View
        style={{
          marginBottom: lastIndex ? Default.fixPadding : Default.fixPadding * 2,
          marginHorizontal: Default.fixPadding * 2,
          borderRadius: 10,
          backgroundColor: Colors.white,
          ...Default.shadow,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            padding: Default.fixPadding,
          }}
        >
          <Image
            source={displayItem.image}
            style={{ width: ms(75), height: ms(75), borderRadius: 5 }}
          />

          <View
            style={{
              flex: 1,
              alignItems: isRtl ? "flex-end" : "flex-start",
              marginHorizontal: Default.fixPadding * 1.6,
            }}
          >
            <Text
              numberOfLines={1}
              style={{ ...Fonts.Medium16black, overflow: "hidden" }}
            >
              {displayItem.title}
            </Text>
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.Medium14grey,
                overflow: "hidden",
                marginVertical: Default.fixPadding * 0.2,
              }}
            >
              {displayItem.dateTime}
            </Text>

            <View
              style={{
                borderBottomWidth: 1,
                borderBottomColor: displayItem.statusInfo.color,
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  ...displayItem.statusInfo.fontStyle,
                  overflow: "hidden",
                }}
              >
                {displayItem.statusInfo.text}
              </Text>
            </View>
          </View>
        </View>

        <DashedLine
          dashGap={2.5}
          dashLength={2.5}
          dashThickness={1.5}
          dashColor={Colors.grey}
        />

        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            justifyContent: "space-between",
            alignItems: "center",
            padding: Default.fixPadding,
          }}
        >
          <TouchableOpacity
            onPress={() => handlePhoneCall(item)}
            disabled={!isCallEnabled(item)}
            style={{
              flex: 1,
              flexDirection: isRtl ? "row-reverse" : "row",
              alignItems: "center",
              opacity: isCallEnabled(item) ? 1 : 0.5,
            }}
          >
            <MaterialCommunityIcons
              name="phone-outline"
              size={20}
              color={isCallEnabled(item) ? Colors.grey : Colors.lightGrey}
            />
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.Medium14grey,
                overflow: "hidden",
                marginHorizontal: Default.fixPadding * 0.5,
                color: isCallEnabled(item) ? Colors.grey : Colors.lightGrey,
              }}
            >
              {tr("call")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              deleteItemHandle(item.id);
            }}
            style={{
              flex: 1,
              flexDirection: isRtl ? "row-reverse" : "row",
              justifyContent: "center",
              alignItems: "center",
              marginHorizontal: Default.fixPadding * 1.5,
            }}
          >
            <Feather name="trash" size={19} color={Colors.grey} />
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.Medium14grey,
                overflow: "hidden",
                marginHorizontal: Default.fixPadding * 0.5,
              }}
            >
              {tr("delete")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              console.log('🎫 Opening GatePass for visitor:', {
                visitorId: item.id,
                visitorName: item.visitor_name,
                visitorType: item.visitor_type,
                entryCode: item.entry_code,
                qrCodeData: item.qr_code_data,
                fullVisitorData: item
              });
              setSelectedVisitor(item);
              setOpenGatePassModal(true);
            }}
            style={{
              flex: 1,
              flexDirection: isRtl ? "row-reverse" : "row",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <MaterialIcons name="list-alt" size={20} color={Colors.grey} />
            <Text
              numberOfLines={1}
              style={{
                ...Fonts.Medium14grey,
                overflow: "hidden",
                marginHorizontal: Default.fixPadding * 0.5,
              }}
            >
              {tr("gatepass")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
          {tr("visitors")}
        </Text>
      </View>

      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text
            style={{
              ...Fonts.SemiBold16grey,
              marginTop: Default.fixPadding,
            }}
          >
            Loading visitors...
          </Text>
        </View>
      ) : error ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text
            style={{
              ...Fonts.SemiBold16grey,
              marginTop: Default.fixPadding,
            }}
          >
            Error loading visitors
          </Text>
        </View>
      ) : visitorsData.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Image
            source={require("../assets/images/community2.png")}
            style={{ width: 40, height: 40, resizeMode: "contain" }}
          />
          <Text
            style={{
              ...Fonts.SemiBold16grey,
              marginTop: Default.fixPadding,
            }}
          >
            {tr("noVisitors")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={visitorsData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingTop: Default.fixPadding * 0.8 }}
          onRefresh={refetch}
          refreshing={isLoading}
        />
      )}

      <View
        style={{
          marginTop: Default.fixPadding,
          marginBottom: Default.fixPadding * 2,
          marginHorizontal: Default.fixPadding * 2,
        }}
      >
        <AwesomeButton
          height={50}
          onPress={() => {
            navigation.push("preApproveVisitorsScreen");
          }}
          raiseLevel={1}
          stretch={true}
          borderRadius={10}
          backgroundShadow={Colors.primary}
          backgroundDarker={Colors.primary}
          backgroundColor={Colors.primary}
        >
          <Text
            numberOfLines={1}
            style={{ ...Fonts.SemiBold18white, overflow: "hidden" }}
          >
            {tr("preVisitors")}
          </Text>
        </AwesomeButton>
      </View>

      <GatePassModal
        visible={openGatePassModal}
        visitorData={selectedVisitor}
        onClose={() => {
          setOpenGatePassModal(false);
          setSelectedVisitor(null);
        }}
      />

      <SnackbarToast
        title={tr("removedVisitor")}
        visible={removeVisitor}
        onDismiss={onDismissRemoveVisitor}
      />
    </View>
  );
};

export default VisitorsScreen;
