import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MyStatusBar from "../components/myStatusBar";
import DashedLine from "react-native-dashed-line";
import { useAuth } from "../contexts/AuthContext";
import { usePersonalHubTransactions } from "../hooks/usePersonalHubTransactions";
import { useListPendingPayments, useListPaymentHistory } from "../hooks/usePayments";
import { ms } from "react-native-size-matters";
import { format } from "date-fns";

const PaymentHistoryScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const { profile } = useAuth();
  const isRtl = i18n.dir() === "rtl";
  const [activeTab, setActiveTab] = useState("all"); // all, maintenance, personal
  const [refreshing, setRefreshing] = useState(false);

  // Get transactions from the Personal Hub
  const {
    data: transactionsData,
    isLoading,
    error,
    refetch,
  } = usePersonalHubTransactions({
    limit: 50,
    orderBy: "created_at",
    ascending: false,
  });
  const {
    data: pendingMaintenance = [],
    isLoading: isLoadingPendingMaintenance,
    error: pendingMaintenanceError,
    refetch: refetchPendingMaintenance,
  } = useListPendingPayments(profile?.unit_id);
  const {
    data: maintenanceHistory = [],
    isLoading: isLoadingMaintenanceHistory,
    error: maintenanceHistoryError,
    refetch: refetchMaintenanceHistory,
  } = useListPaymentHistory(profile?.unit_id);

  function tr(key) {
    return t(`paymentScreen:${key}`);
  }

  useEffect(() => {
    const onBackPress = () => {
      navigation.pop();
      return true;
    };
    const subscription = BackHandler.addEventListener("hardwareBackPress", onBackPress);
    return () => {
      subscription.remove();
    };
  }, [navigation]);

  // Format personal hub transactions into a consistent format
  const formatPersonalHubTransactions = () => {
    if (!transactionsData?.data) return [];
    
    return transactionsData.data.map((transaction, index) => {
      const typeLabels = {
        airtime: "Airtime Purchase",
        data: "Data Purchase",
        money_transfer: "Money Transfer",
        bill_payment: "Bill Payment",
        insurance: "Insurance Payment",
        shopping: "Shopping Payment"
      };
      
      return {
        id: transaction.transaction_id || `${transaction.transaction_type || "tx"}_${transaction.created_at || "unknown"}_${index}`,
        title: `${typeLabels[transaction.transaction_type] || transaction.transaction_type} - ${transaction.provider || ''}`,
        amount: transaction.amount || 0,
        currency: "GHS",
        date: transaction.created_at,
        status: transaction.status || "pending",
        type: "personal",
        isNew: new Date(transaction.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000), // New if less than 24h old
        recipientName: transaction.recipient_name || '',
        recipientIdentifier: transaction.recipient_identifier || '',
        transactionType: transaction.transaction_type,
        provider: transaction.provider || "",
      };
    });
  };

  const formatMaintenancePayments = () => {
    const combined = [...pendingMaintenance, ...maintenanceHistory];

    return combined.map((payment) => {
      const paymentDate =
        payment.payment_date ||
        payment.paid_at ||
        payment.created_at ||
        payment.updated_at ||
        new Date().toISOString();

      return {
        id: payment.id,
        title: payment.title || payment.description || "Community Payment",
        amount: Number(payment.amount) || 0,
        currency: "GHS",
        date: paymentDate,
        status: payment.status || "pending",
        type: "maintenance",
        transactionType: "maintenance",
        isNew: new Date(paymentDate) > new Date(Date.now() - 24 * 60 * 60 * 1000),
        paymentData: payment,
      };
    });
  };

  // Combine all payment types based on active tab
  const getFilteredPayments = () => {
    const personalTransactions = formatPersonalHubTransactions();
    const maintenancePayments = formatMaintenancePayments();
    
    switch (activeTab) {
      case "maintenance":
        return maintenancePayments;
      case "personal":
        return personalTransactions;
      case "all":
      default:
        return [...maintenancePayments, ...personalTransactions].sort((a, b) => 
          new Date(b.date) - new Date(a.date)
        );
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([refetch(), refetchPendingMaintenance(), refetchMaintenanceHistory()]);
    setRefreshing(false);
  }, [refetch, refetchPendingMaintenance, refetchMaintenanceHistory]);

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
      case "completed":
      case "success":
        return Colors.regularGreen;
      case "pending":
      case "processing":
        return Colors.orange;
      case "failed":
      case "cancelled":
      default:
        return Colors.red;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "paid":
      case "completed":
      case "success":
        return tr("paid");
      case "pending":
      case "processing":
        return tr("pending");
      case "failed":
      case "cancelled":
      default:
        return tr("failed");
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case "airtime":
        return { name: "phone", component: MaterialCommunityIcons, color: Colors.blue };
      case "data":
        return { name: "wifi", component: MaterialCommunityIcons, color: Colors.green };
      case "money_transfer":
        return { name: "bank-transfer", component: MaterialCommunityIcons, color: Colors.orange };
      case "bill_payment":
        return { name: "receipt", component: MaterialCommunityIcons, color: Colors.purple };
      case "insurance":
        return { name: "shield-check", component: MaterialCommunityIcons, color: Colors.blue };
      case "shopping":
        return { name: "cart", component: MaterialCommunityIcons, color: Colors.primary };
      case "maintenance":
      default:
        return { name: "home", component: MaterialCommunityIcons, color: Colors.primary };
    }
  };

  const renderItem = ({ item }) => {
    const formattedDate = format(new Date(item.date), "d MMM, hh:mm a");
    const formattedAmount = `${item.currency} ${item.amount.toFixed(2)}`;
    const icon = getTransactionIcon(item.transactionType || item.type);
    const IconComponent = icon.component;

    return (
      <View style={styles.paymentCard}>
        <View style={{ flexDirection: isRtl ? "row-reverse" : "row", justifyContent: "space-between" }}>
          <View style={{ flex: 8, padding: Default.fixPadding * 1.4 }}>
            <View style={{ flexDirection: isRtl ? "row-reverse" : "row", alignItems: "center" }}>
              <View style={[styles.iconContainer, { backgroundColor: `${icon.color}15` }]}>
                <IconComponent name={icon.name} size={20} color={icon.color} />
              </View>
              <Text
                numberOfLines={1}
                style={{
                  ...Fonts.SemiBold16black,
                  overflow: "hidden",
                  marginLeft: isRtl ? 0 : Default.fixPadding,
                  marginRight: isRtl ? Default.fixPadding : 0,
                }}
              >
                {item.title}
              </Text>
            </View>
            
            {item.recipientName && (
              <Text
                numberOfLines={1}
                style={{
                  ...Fonts.Medium14grey,
                  overflow: "hidden",
                  marginTop: Default.fixPadding * 0.5,
                  marginLeft: isRtl ? 0 : ms(36),
                  marginRight: isRtl ? ms(36) : 0,
                }}
              >
                {item.recipientName}
              </Text>
            )}
          </View>
          
          <View style={{ flex: 2, alignItems: isRtl ? "flex-start" : "flex-end" }}>
            {item.isNew && (
              <View style={[
                styles.newBadge,
                { borderTopRightRadius: isRtl ? 0 : 10, borderTopLeftRadius: isRtl ? 10 : 0 }
              ]}>
                <Text numberOfLines={1} style={styles.newBadgeText}>
                  {tr("new")}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        <DashedLine
          dashGap={2.5}
          dashLength={2.5}
          dashThickness={1.5}
          dashColor={Colors.grey}
        />

        <View style={styles.paymentDetails}>
          <View style={{ flex: 6.5 }}>
            <Text numberOfLines={1} style={{ ...Fonts.Medium16black, overflow: "hidden" }}>
              {formattedAmount}
            </Text>
            <Text numberOfLines={1} style={{ ...Fonts.Medium14grey, overflow: "hidden", marginTop: 4 }}>
              {formattedDate}
            </Text>
          </View>

          <View style={{ flex: 3.5, alignItems: isRtl ? "flex-start" : "flex-end" }}>
            {item.status === "paid" || item.status === "completed" || item.status === "success" ? (
              <TouchableOpacity
                onPress={() => {
                  navigation.push("paymentReceiptScreen", { payment: item });
                }}
                style={{ flexDirection: isRtl ? "row-reverse" : "row", alignItems: "center" }}
              >
                <MaterialIcons name="list-alt" size={16} color={Colors.primary} />
                <Text
                  numberOfLines={1}
                  style={{
                    ...Fonts.SemiBold14primary,
                    overflow: "hidden",
                    marginLeft: isRtl ? 0 : Default.fixPadding * 0.5,
                    marginRight: isRtl ? Default.fixPadding * 0.5 : 0,
                  }}
                >
                  {tr("receipt")}
                </Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  if (item.status === "pending" || item.status === "processing") {
                    if (item.type === "personal") {
                      navigation.push("paymentMethodScreen", {
                        transactionType: item.transactionType,
                        provider: item.provider || "",
                        providerName: item.provider || "",
                        amount: item.amount,
                        amountFormatted: formattedAmount,
                        phoneNumber: item.recipientIdentifier || "",
                        description: item.recipientName || "",
                        recipientInfo: {
                          name: item.recipientName || "",
                          phoneNumber: item.recipientIdentifier || "",
                        },
                        isPersonalHubTransaction: true,
                      });
                      return;
                    }

                    navigation.push("paymentMethodScreen", {
                      paymentData: item.paymentData || item,
                      amount: item.amount,
                      amountFormatted: formattedAmount,
                    });
                  }
                }}
                style={{ flexDirection: isRtl ? "row-reverse" : "row", alignItems: "center" }}
              >
                <Image
                  source={require("../assets/images/moneyIcon.png")}
                  style={{ width: 16, height: 16, resizeMode: "contain" }}
                />
                <Text
                  numberOfLines={1}
                  style={{
                    ...Fonts.SemiBold14primary,
                    overflow: "hidden",
                    marginLeft: isRtl ? 0 : Default.fixPadding * 0.5,
                    marginRight: isRtl ? Default.fixPadding * 0.5 : 0,
                  }}
                >
                  {tr("payNow")}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        <View
          style={[
            styles.statusBar,
            { backgroundColor: getStatusColor(item.status) }
          ]}
        >
          <Text numberOfLines={1} style={styles.statusText}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
    );
  };

  const renderTabButton = (tabName, label) => (
    <TouchableOpacity
      style={[
        styles.tabButton,
        activeTab === tabName && styles.activeTabButton
      ]}
      onPress={() => setActiveTab(tabName)}
    >
      <Text
        style={[
          styles.tabButtonText,
          activeTab === tabName && styles.activeTabButtonText
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const filteredPayments = getFilteredPayments();
  const maintenanceLoading = isLoadingPendingMaintenance || isLoadingMaintenanceHistory;
  const maintenanceError = pendingMaintenanceError || maintenanceHistoryError;
  const screenLoading =
    activeTab === "personal"
      ? isLoading
      : activeTab === "maintenance"
      ? maintenanceLoading
      : isLoading || maintenanceLoading;
  const screenError =
    activeTab === "personal"
      ? error
      : activeTab === "maintenance"
      ? maintenanceError
      : error || maintenanceError;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.extraLightGrey }}>
      <MyStatusBar />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.pop()}>
          <Ionicons
            name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"}
            size={25}
            color={Colors.black}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {tr("payment")}
        </Text>
      </View>

      {/* Tab Buttons */}
      <View style={styles.tabContainer}>
        {renderTabButton("all", tr("all"))}
        {renderTabButton("maintenance", tr("maintenance"))}
        {renderTabButton("personal", tr("personal"))}
      </View>

      {screenLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>{tr("loading")}</Text>
        </View>
      ) : screenError ? (
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={50} color={Colors.red} />
          <Text style={styles.errorText}>{tr("errorLoading")}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>{tr("retry")}</Text>
          </TouchableOpacity>
        </View>
      ) : filteredPayments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="receipt-text-outline" size={70} color={Colors.grey} />
          <Text style={styles.emptyText}>{tr("noPayments")}</Text>
          <Text style={styles.emptySubText}>{tr("noPaymentsDesc")}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPayments}
          renderItem={renderItem}
          keyExtractor={(item, index) => item.id || `${item.type || "payment"}_${index}`}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingVertical: Default.fixPadding }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
              tintColor={Colors.primary}
            />
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Default.fixPadding * 1.2,
    paddingHorizontal: Default.fixPadding * 2,
    backgroundColor: Colors.white,
    ...Default.shadow
  },
  headerTitle: {
    ...Fonts.SemiBold18black,
    marginHorizontal: Default.fixPadding,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    paddingHorizontal: Default.fixPadding,
    paddingBottom: Default.fixPadding,
    ...Default.shadow
  },
  tabButton: {
    flex: 1,
    paddingVertical: Default.fixPadding * 0.8,
    alignItems: 'center',
    borderRadius: 20,
    marginHorizontal: Default.fixPadding * 0.5
  },
  activeTabButton: {
    backgroundColor: Colors.primary,
  },
  tabButtonText: {
    ...Fonts.Medium14grey,
  },
  activeTabButtonText: {
    ...Fonts.Medium14white,
  },
  paymentCard: {
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  iconContainer: {
    width: ms(30),
    height: ms(30),
    borderRadius: ms(15),
    justifyContent: 'center',
    alignItems: 'center',
  },
  newBadge: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 52,
    height: 22,
    backgroundColor: Colors.primary,
  },
  newBadgeText: {
    ...Fonts.SemiBold12white,
    overflow: 'hidden',
    paddingHorizontal: Default.fixPadding * 0.5,
  },
  paymentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Default.fixPadding * 1.6,
    paddingHorizontal: Default.fixPadding * 1.4,
  },
  statusBar: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Default.fixPadding,
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    ...Default.shadow,
  },
  statusText: {
    ...Fonts.SemiBold16white,
    overflow: 'hidden'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Fonts.Medium16grey,
    marginTop: Default.fixPadding,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Default.fixPadding * 2,
  },
  errorText: {
    ...Fonts.Medium16grey,
    marginTop: Default.fixPadding,
    marginBottom: Default.fixPadding * 2,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Default.fixPadding,
    paddingHorizontal: Default.fixPadding * 2,
    borderRadius: 10,
  },
  retryButtonText: {
    ...Fonts.SemiBold16white,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Default.fixPadding * 2,
  },
  emptyText: {
    ...Fonts.SemiBold18black,
    marginTop: Default.fixPadding * 2,
  },
  emptySubText: {
    ...Fonts.Medium14grey,
    textAlign: 'center',
    marginTop: Default.fixPadding,
  },
});

export default PaymentHistoryScreen;
