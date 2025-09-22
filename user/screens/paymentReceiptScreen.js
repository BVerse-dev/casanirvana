import React, { useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  ScrollView,
  StyleSheet,
  Share,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MyStatusBar from "../components/myStatusBar";
import { format } from "date-fns";

const PaymentReceiptScreen = ({ navigation, route }) => {
  const { payment } = route.params || {};
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  function tr(key) {
    return t(`paymentScreen:${key}`);
  }

  const backAction = () => {
    navigation.pop();
    return true;
  };

  useEffect(() => {
    BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => {
      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );
      return () => subscription?.remove();
    };
  }, []);

  const getTransactionTypeLabel = (type) => {
    switch (type) {
      case "airtime":
        return "Airtime Purchase";
      case "data":
        return "Data Purchase";
      case "money_transfer":
        return "Money Transfer";
      case "bill_payment":
        return "Bill Payment";
      case "insurance":
        return "Insurance Payment";
      case "shopping":
        return "Shopping Payment";
      case "maintenance":
        return "Maintenance Payment";
      default:
        return "Payment";
    }
  };

  const handleShare = async () => {
    try {
      const formattedDate = format(new Date(payment.date), "d MMM yyyy, hh:mm a");
      const message = `Payment Receipt\n\n` +
        `Transaction: ${payment.title}\n` +
        `Amount: ${payment.currency} ${payment.amount.toFixed(2)}\n` +
        `Date: ${formattedDate}\n` +
        `Status: ${payment.status.toUpperCase()}\n` +
        `Transaction Type: ${getTransactionTypeLabel(payment.transactionType || payment.type)}\n` +
        (payment.recipientName ? `Recipient: ${payment.recipientName}\n` : '') +
        (payment.recipientIdentifier ? `Recipient ID: ${payment.recipientIdentifier}\n` : '') +
        `\nThank you for using Casa Nirvana!`;

      await Share.share({
        message,
        title: "Payment Receipt",
      });
    } catch (error) {
      Alert.alert("Error", "Unable to share receipt");
    }
  };

  const handlePrint = () => {
    Alert.alert(
      "Print Receipt",
      "This feature is coming soon. Would you like to share the receipt instead?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Share", onPress: handleShare },
      ]
    );
  };

  if (!payment) {
    return (
      <View style={styles.errorContainer}>
        <MaterialCommunityIcons name="receipt-off" size={70} color={Colors.grey} />
        <Text style={styles.errorText}>{tr("receiptNotFound")}</Text>
        <TouchableOpacity style={styles.backButton} onPress={backAction}>
          <Text style={styles.backButtonText}>{tr("goBack")}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formattedDate = format(new Date(payment.date), "d MMMM yyyy, hh:mm a");
  const formattedAmount = `${payment.currency} ${payment.amount.toFixed(2)}`;
  const receiptNumber = `REC-${Date.now().toString().slice(-8)}`;
  const transactionType = getTransactionTypeLabel(payment.transactionType || payment.type);

  return (
    <View style={{ flex: 1, backgroundColor: Colors.extraLightGrey }}>
      <MyStatusBar />
      <View style={styles.header}>
        <TouchableOpacity onPress={backAction}>
          <Ionicons
            name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"}
            size={25}
            color={Colors.black}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tr("receipt")}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
            <MaterialCommunityIcons name="share-variant" size={22} color={Colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePrint} style={styles.actionButton}>
            <MaterialCommunityIcons name="printer" size={22} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: Default.fixPadding * 2 }}
      >
        {/* Receipt Card */}
        <View style={styles.receiptCard}>
          {/* Receipt Header */}
          <View style={styles.receiptHeader}>
            <MaterialCommunityIcons name="check-circle" size={40} color={Colors.green} />
            <Text style={styles.receiptHeaderTitle}>{tr("paymentSuccessful")}</Text>
            <Text style={styles.receiptHeaderAmount}>{formattedAmount}</Text>
          </View>

          {/* Receipt Details */}
          <View style={styles.receiptDetails}>
            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>{tr("receiptNumber")}</Text>
              <Text style={styles.receiptValue}>{receiptNumber}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>{tr("date")}</Text>
              <Text style={styles.receiptValue}>{formattedDate}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>{tr("paymentType")}</Text>
              <Text style={styles.receiptValue}>{transactionType}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>{tr("description")}</Text>
              <Text style={styles.receiptValue}>{payment.title}</Text>
            </View>

            {payment.recipientName && (
              <>
                <View style={styles.divider} />
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>{tr("recipient")}</Text>
                  <Text style={styles.receiptValue}>{payment.recipientName}</Text>
                </View>
              </>
            )}

            {payment.recipientIdentifier && (
              <>
                <View style={styles.divider} />
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptLabel}>{tr("recipientId")}</Text>
                  <Text style={styles.receiptValue}>{payment.recipientIdentifier}</Text>
                </View>
              </>
            )}

            <View style={styles.divider} />

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>{tr("status")}</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{payment.status.toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>{tr("paymentMethod")}</Text>
              <Text style={styles.receiptValue}>Mobile Money</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.receiptRow}>
              <Text style={styles.receiptLabel}>{tr("amount")}</Text>
              <Text style={styles.receiptAmount}>{formattedAmount}</Text>
            </View>
          </View>

          {/* Receipt Footer */}
          <View style={styles.receiptFooter}>
            <Text style={styles.receiptFooterText}>{tr("thankYou")}</Text>
            <Text style={styles.receiptFooterSubtext}>Casa Nirvana</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.downloadButton]}
            onPress={handleShare}
          >
            <MaterialCommunityIcons name="share-variant" size={20} color={Colors.white} />
            <Text style={styles.actionButtonText}>{tr("share")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.printButton]}
            onPress={handlePrint}
          >
            <MaterialCommunityIcons name="printer" size={20} color={Colors.white} />
            <Text style={styles.actionButtonText}>{tr("print")}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.doneButton}
          onPress={() => navigation.navigate("homeScreen")}
        >
          <Text style={styles.doneButtonText}>{tr("done")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: Default.fixPadding * 1.2,
    paddingHorizontal: Default.fixPadding * 2,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  headerTitle: {
    ...Fonts.SemiBold18black,
    flex: 1,
    textAlign: "center",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    marginLeft: Default.fixPadding,
  },
  receiptCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    ...Default.shadow,
    overflow: "hidden",
  },
  receiptHeader: {
    backgroundColor: Colors.extraLightGrey,
    padding: Default.fixPadding * 2,
    alignItems: "center",
  },
  receiptHeaderTitle: {
    ...Fonts.SemiBold16black,
    marginTop: Default.fixPadding,
  },
  receiptHeaderAmount: {
    ...Fonts.Bold24primary,
    marginTop: Default.fixPadding,
  },
  receiptDetails: {
    padding: Default.fixPadding * 2,
  },
  receiptRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Default.fixPadding,
  },
  receiptLabel: {
    ...Fonts.Medium14grey,
  },
  receiptValue: {
    ...Fonts.SemiBold14black,
    maxWidth: "60%",
    textAlign: "right",
  },
  receiptAmount: {
    ...Fonts.SemiBold16primary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.lightGrey,
  },
  statusBadge: {
    backgroundColor: Colors.green + "20",
    paddingVertical: Default.fixPadding * 0.3,
    paddingHorizontal: Default.fixPadding,
    borderRadius: 5,
  },
  statusText: {
    ...Fonts.SemiBold12green,
  },
  receiptFooter: {
    padding: Default.fixPadding * 2,
    backgroundColor: Colors.extraLightGrey,
    alignItems: "center",
  },
  receiptFooterText: {
    ...Fonts.SemiBold14black,
  },
  receiptFooterSubtext: {
    ...Fonts.Medium12grey,
    marginTop: Default.fixPadding * 0.5,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: Default.fixPadding * 2,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Default.fixPadding,
    borderRadius: 10,
    marginHorizontal: Default.fixPadding,
  },
  downloadButton: {
    backgroundColor: Colors.primary,
  },
  printButton: {
    backgroundColor: Colors.blue,
  },
  actionButtonText: {
    ...Fonts.SemiBold14white,
    marginLeft: Default.fixPadding * 0.5,
  },
  doneButton: {
    backgroundColor: Colors.green,
    padding: Default.fixPadding,
    borderRadius: 10,
    alignItems: "center",
    marginTop: Default.fixPadding * 2,
    marginHorizontal: Default.fixPadding,
  },
  doneButtonText: {
    ...Fonts.SemiBold16white,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Default.fixPadding * 2,
    backgroundColor: Colors.white,
  },
  errorText: {
    ...Fonts.SemiBold16black,
    marginTop: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
    textAlign: "center",
  },
  backButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Default.fixPadding,
    paddingHorizontal: Default.fixPadding * 2,
    borderRadius: 10,
  },
  backButtonText: {
    ...Fonts.SemiBold16white,
  },
});

export default PaymentReceiptScreen;
