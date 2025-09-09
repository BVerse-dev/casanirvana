import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
} from "react-native";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Default, Fonts } from "../constants/styles";

const EmergencyScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`emergencyScreen:${key}`);
  }

  // Mock emergency alerts data
  const [emergencyAlerts, setEmergencyAlerts] = useState([
    {
      id: "1",
      type: "fire",
      title: "Fire Emergency",
      description: "Fire detected in Building A, Floor 3",
      time: "2 min ago",
      priority: "critical",
      status: "active",
    },
    {
      id: "2",
      type: "medical",
      title: "Medical Emergency",
      description: "Medical assistance requested in Unit B-205",
      time: "15 min ago",
      priority: "high",
      status: "resolved",
    },
    {
      id: "3",
      type: "security",
      title: "Security Alert",
      description: "Unauthorized access detected at Gate B",
      time: "1 hour ago",
      priority: "medium",
      status: "investigating",
    },
  ]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "critical":
        return Colors.red;
      case "high":
        return Colors.orange || Colors.red;
      case "medium":
        return Colors.primary;
      default:
        return Colors.grey;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return Colors.red;
      case "investigating":
        return Colors.primary;
      case "resolved":
        return Colors.green;
      default:
        return Colors.grey;
    }
  };

  const getEmergencyIcon = (type) => {
    switch (type) {
      case "fire":
        return "flame";
      case "medical":
        return "medical";
      case "security":
        return "shield-checkmark";
      default:
        return "warning";
    }
  };

  const handleEmergencyAction = (alert) => {
    Alert.alert(
      "Emergency Action",
      `Take action for: ${alert.title}`,
      [
        { text: "Cancel", style: "cancel" },
        { text: "Mark as Resolved", onPress: () => markAsResolved(alert.id) },
        { text: "Call Emergency", onPress: () => callEmergency(alert) },
      ]
    );
  };

  const markAsResolved = (alertId) => {
    setEmergencyAlerts(alerts =>
      alerts.map(alert =>
        alert.id === alertId ? { ...alert, status: "resolved" } : alert
      )
    );
  };

  const callEmergency = (alert) => {
    Alert.alert("Calling Emergency Services", `Initiating emergency call for: ${alert.title}`);
  };

  const renderEmergencyAlert = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('emergencyDetailScreen', { alert: item })}
      style={{
        marginHorizontal: Default.fixPadding * 2,
        marginBottom: Default.fixPadding * 1.5,
        padding: Default.fixPadding * 1.5,
        borderRadius: 12,
        backgroundColor: Colors.white,
        borderLeftWidth: 4,
        borderLeftColor: getPriorityColor(item.priority),
        ...Default.shadow,
      }}
    >
      <View
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "flex-start",
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: getPriorityColor(item.priority),
            justifyContent: "center",
            alignItems: "center",
            marginRight: isRtl ? 0 : Default.fixPadding,
            marginLeft: isRtl ? Default.fixPadding : 0,
          }}
        >
          <Ionicons
            name={getEmergencyIcon(item.type)}
            size={20}
            color={Colors.white}
          />
        </View>

        <View style={{ flex: 1 }}>
          <View
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                ...Fonts.SemiBold16black,
                flex: 1,
                marginRight: isRtl ? 0 : Default.fixPadding * 0.5,
                marginLeft: isRtl ? Default.fixPadding * 0.5 : 0,
              }}
            >
              {item.title}
            </Text>
            <Text style={{ ...Fonts.Medium12grey }}>
              {item.time}
            </Text>
          </View>

          <Text
            style={{
              ...Fonts.Medium14grey,
              marginTop: Default.fixPadding * 0.5,
              marginBottom: Default.fixPadding,
            }}
          >
            {item.description}
          </Text>

          <View
            style={{
              flexDirection: isRtl ? "row-reverse" : "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View
              style={{
                paddingHorizontal: Default.fixPadding,
                paddingVertical: Default.fixPadding * 0.3,
                borderRadius: 12,
                backgroundColor: getStatusColor(item.status),
              }}
            >
              <Text
                style={{
                  ...Fonts.Medium12grey,
                  color: Colors.white,
                  textTransform: "capitalize",
                }}
              >
                {item.status}
              </Text>
            </View>

            <Text
              style={{
                ...Fonts.Medium12grey,
                color: getPriorityColor(item.priority),
                textTransform: "capitalize",
                fontWeight: "bold",
              }}
            >
              {item.priority} Priority
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.lightGrey }}>
      <MyStatusBar />
      
      {/* Header */}
      <View
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          paddingVertical: Default.fixPadding * 1.2,
          paddingHorizontal: Default.fixPadding * 2,
          backgroundColor: Colors.white,
          ...Default.shadow,
        }}
      >
        <Ionicons
          name="warning-outline"
          size={24}
          color={Colors.primary}
          style={{
            marginRight: isRtl ? 0 : Default.fixPadding,
            marginLeft: isRtl ? Default.fixPadding : 0,
          }}
        />
        <Text style={{ ...Fonts.SemiBold18black, flex: 1 }}>
          {tr("emergencyAlerts")}
        </Text>
        
        {/* Emergency Call Button */}
        <TouchableOpacity
          onPress={() => Alert.alert("Emergency Call", "Calling Emergency Services...")}
          style={{
            backgroundColor: Colors.red,
            paddingHorizontal: Default.fixPadding * 1.2,
            paddingVertical: Default.fixPadding * 0.8,
            borderRadius: 20,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons name="call" size={16} color={Colors.white} />
          <Text
            style={{
              ...Fonts.Medium14grey,
              color: Colors.white,
              marginLeft: Default.fixPadding * 0.5,
            }}
          >
            {tr("emergency")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Emergency Alerts List */}
      {emergencyAlerts.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: Default.fixPadding * 2,
          }}
        >
          <Ionicons
            name="shield-checkmark-outline"
            size={64}
            color={Colors.grey}
          />
          <Text
            style={{
              ...Fonts.SemiBold16grey,
              marginTop: Default.fixPadding,
              textAlign: "center",
            }}
          >
            {tr("noEmergencies")}
          </Text>
          <Text
            style={{
              ...Fonts.Medium14grey,
              marginTop: Default.fixPadding * 0.5,
              textAlign: "center",
            }}
          >
            {tr("allClear")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={emergencyAlerts}
          renderItem={renderEmergencyAlert}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: Default.fixPadding * 1.5,
            paddingBottom: Default.fixPadding * 2,
          }}
        />
      )}
    </View>
  );
};

export default EmergencyScreen;
