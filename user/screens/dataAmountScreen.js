import React, { useState } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  BackHandler,
  Image,
} from "react-native";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import { ms } from "react-native-size-matters/extend";
import MyStatusBar from "../components/myStatusBar";

const DataAmountScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  
  // Get provider data from route params
  const { provider, providerName, providerColor, providerLogo, packageType } = route.params || {};
  const [selectedAmount, setSelectedAmount] = useState(null);

  // Safe translation function that ALWAYS returns a string
  function tr(key, fallback = "Missing Translation") {
    if (!key) return fallback || "";
    const translated = t(key);
    return translated || fallback;
  }

  // Handle back button
  React.useEffect(() => {
    const backAction = () => {
      navigation.goBack();
      return true;
    };
    
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [navigation]);

  // Data packages based on the selected package type
  const getDataPackages = () => {
    switch (packageType) {
      case 'data':
        return [
          { id: "data1", title: "Daily Mini", amount: 1.00, description: "40.91MB", dataAmount: "40.91MB", validity: "1 day" },
          { id: "data2", title: "Daily Basic", amount: 3.00, description: "401.63MB", dataAmount: "401.63MB", validity: "1 day" },
          { id: "data3", title: "Weekly Basic", amount: 10.00, description: "826.72MB", dataAmount: "826.72MB", validity: "7 days" },
          { id: "data4", title: "Weekly Plus", amount: 20.00, description: "1.37GB", dataAmount: "1.37GB", validity: "7 days" },
          { id: "data5", title: "Monthly Mini", amount: 40.00, description: "2.74GB", dataAmount: "2.74GB", validity: "30 days" },
          { id: "data6", title: "Monthly Basic", amount: 60.00, description: "4.11GB", dataAmount: "4.11GB", validity: "30 days" },
          { id: "data7", title: "Monthly Plus", amount: 80.00, description: "5.48GB", dataAmount: "5.48GB", validity: "30 days" },
          { id: "data8", title: "Monthly Pro", amount: 100.00, description: "9.05GB", dataAmount: "9.05GB", validity: "30 days" },
          { id: "data9", title: "Monthly Premium", amount: 120.00, description: "10.86GB", dataAmount: "10.86GB", validity: "30 days" },
          { id: "data10", title: "Monthly Max", amount: 150.00, description: "13.57GB", dataAmount: "13.57GB", validity: "30 days" },
          { id: "data11", title: "Monthly Ultra", amount: 200.00, description: "30.47GB", dataAmount: "30.47GB", validity: "30 days" },
          { id: "data12", title: "Monthly Ultimate", amount: 250.00, description: "38.09GB", dataAmount: "38.09GB", validity: "30 days" },
          { id: "data13", title: "Quarterly", amount: 350.00, description: "106.81GB", dataAmount: "106.81GB", validity: "90 days" },
          { id: "data14", title: "Semester", amount: 399.00, description: "214.53GB", dataAmount: "214.53GB", validity: "180 days" },
        ];
      case 'social':
        return [
          { id: "social1", title: "Social Daily", amount: 1.00, description: "Unlimited Social Media", dataAmount: "Unlimited", validity: "1 day" },
          { id: "social2", title: "Social Weekend", amount: 5.00, description: "Unlimited Social Media", dataAmount: "Unlimited", validity: "Weekend" },
          { id: "social3", title: "Social Weekly", amount: 10.00, description: "Unlimited Social Media", dataAmount: "Unlimited", validity: "7 days" },
          { id: "social4", title: "Social Monthly", amount: 25.00, description: "Unlimited Social Media", dataAmount: "Unlimited", validity: "30 days" },
        ];
      case 'video':
        return [
          { id: "video1", title: "Video Daily", amount: 5.00, description: "678.43MB", dataAmount: "678.43MB", validity: "1 day" },
          { id: "video2", title: "Video Weekend", amount: 10.00, description: "708.72MB", dataAmount: "708.72MB", validity: "Weekend" },
          { id: "video3", title: "Video Weekly", amount: 20.00, description: "1.33GB", dataAmount: "1.33GB", validity: "7 days" },
          { id: "video4", title: "Video Monthly", amount: 50.00, description: "3.54GB", dataAmount: "3.54GB", validity: "30 days" },
          { id: "video5", title: "Video Premium", amount: 100.00, description: "9.05GB", dataAmount: "9.05GB", validity: "30 days" },
        ];
      default:
        return [
          { id: "default1", title: "Basic Data", amount: 10.00, description: "826.72MB", dataAmount: "826.72MB", validity: "7 days" },
          { id: "default2", title: "Standard Data", amount: 20.00, description: "1.37GB", dataAmount: "1.37GB", validity: "7 days" },
          { id: "default3", title: "Premium Data", amount: 50.00, description: "3.54GB", dataAmount: "3.54GB", validity: "30 days" },
        ];
    }
  };

  const dataPackages = getDataPackages();

  const handleContinue = () => {
    if (!selectedAmount) return;
    
    const option = dataPackages.find(item => item.id === selectedAmount);
    
    navigation.navigate("dataAccountDetailsScreen", {
      provider,
      providerName,
      providerColor,
      providerLogo,
      packageType,
      amountTitle: option.title,
      amount: option.amount,
      amountFormatted: `GHS ${option.amount.toFixed(2)}`,
      dataAmount: option.dataAmount,
      validity: option.validity,
      transactionType: "data"
    });
  };

  const renderItem = ({ item }) => {
    const isSelected = selectedAmount === item.id;
    
    return (
      <TouchableOpacity
        onPress={() => setSelectedAmount(item.id)}
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          paddingVertical: Default.fixPadding * 1.5,
          paddingHorizontal: Default.fixPadding * 2,
          backgroundColor: Colors.white,
          marginBottom: Default.fixPadding,
          borderRadius: 10,
          ...Default.shadow,
          borderWidth: isSelected ? 2 : 0,
          borderColor: isSelected ? Colors.primary : "transparent",
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: isRtl ? "row-reverse" : "row", alignItems: "center" }}>
            <Text
              style={{ ...Fonts.SemiBold16black }}
            >
              {item.dataAmount}
            </Text>
            <View
              style={{
                backgroundColor: Colors.lightGreen,
                paddingHorizontal: Default.fixPadding * 0.8,
                paddingVertical: Default.fixPadding * 0.3,
                borderRadius: 4,
                marginLeft: isRtl ? 0 : Default.fixPadding,
                marginRight: isRtl ? Default.fixPadding : 0,
              }}
            >
              <Text style={{ ...Fonts.Medium12green }}>
                {`GHS ${item.amount.toFixed(2)}`}
              </Text>
            </View>
          </View>
          
          <Text
            numberOfLines={1}
            style={{ ...Fonts.Medium14grey, marginTop: Default.fixPadding * 0.5 }}
          >
            {`${item.title} • Valid for ${item.validity}`}
          </Text>
        </View>

        <View
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: isSelected ? Colors.primary : Colors.grey,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {isSelected && (
            <View
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: Colors.primary,
              }}
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.extraLightGrey }}>
      <MyStatusBar />
      <View style={{ flex: 1 }}>
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
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{
              marginRight: isRtl ? 0 : Default.fixPadding * 1.5,
              marginLeft: isRtl ? Default.fixPadding * 1.5 : 0,
            }}
          >
            <Ionicons
              name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"}
              size={25}
              color={Colors.black}
            />
          </TouchableOpacity>
          <Text style={{ ...Fonts.SemiBold18black }}>
            {tr("Amount")}
          </Text>
        </View>

        {/* Amount Options */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ padding: Default.fixPadding * 2, paddingBottom: Default.fixPadding * 10 }}
        >
          {dataPackages.map((item) => (
            <React.Fragment key={item.id}>
              {renderItem({ item })}
            </React.Fragment>
          ))}
        </ScrollView>

        {/* Continue Button */}
        <View
          style={{
            padding: Default.fixPadding * 2,
            backgroundColor: Colors.white,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            ...Default.shadow,
          }}
        >
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!selectedAmount}
            style={{
              backgroundColor: selectedAmount ? Colors.primary : Colors.grey,
              borderRadius: 10,
              paddingVertical: Default.fixPadding * 1.5,
              alignItems: "center",
            }}
          >
            <Text style={{ ...Fonts.SemiBold16white }}>
              {tr("Continue")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DataAmountScreen;
