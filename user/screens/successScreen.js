import {
  Text,
  View,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ImageBackground,
  Alert,
  Share,
  Platform,
  BackHandler,
} from "react-native";
import React, { useCallback, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import MyStatusBar from "../components/myStatusBar";
import { ms } from "react-native-size-matters/extend";
import moment from "moment";
import * as Sharing from "expo-sharing";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const normalizeText = (value, fallback = "N/A") => {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text.length > 0 ? text : fallback;
};

const normalizeRange = (start, end, fallback = "N/A") => {
  const hasStart = start !== null && start !== undefined && String(start).trim().length > 0;
  const hasEnd = end !== null && end !== undefined && String(end).trim().length > 0;

  if (!hasStart && !hasEnd) return fallback;
  if (hasStart && hasEnd) return `${start} - ${end}`;
  return hasStart ? String(start) : String(end);
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

const SuccessScreen = ({ navigation, route }) => {
  const params = route.params || {};
  const bookingData = params.bookingData || null;
  const paymentData = params.paymentData || null;
  const bookingType = bookingData?.type || paymentData?.type || null;

  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";

  const navigateHome = useCallback(() => {
    navigation.navigate("bottomTab", { screen: "homeScreen" });
  }, [navigation]);

  function tr(key) {
    return t(`successScreen:${key}`);
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      navigateHome();
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [navigateHome]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener("hardwareBackPress", () => {
      navigateHome();
      return true;
    });

    return () => backHandler.remove();
  }, [navigateHome]);

  const resolvedTransactionId = normalizeText(
    params.transactionId || bookingData?.transactionId || paymentData?.transactionId
  );
  const resolvedPaymentMethod = normalizeText(
    params.paymentMethod || bookingData?.paymentMethod || paymentData?.paymentMethod
  );
  const resolvedReferenceId = normalizeText(
    params.bookingId || paymentData?.id || paymentData?.paymentId || bookingData?.id
  );
  const resolvedAmountRaw = Number(bookingData?.totalAmount ?? paymentData?.amount ?? 0);
  const resolvedAmount =
    Number.isFinite(resolvedAmountRaw) && resolvedAmountRaw > 0
      ? `GH₵ ${resolvedAmountRaw.toFixed(2)}`
      : "Free";
  const resolvedPaidOn = moment(
    paymentData?.paymentDate || bookingData?.paymentDate || new Date().toISOString()
  ).format("DD MMMM, YYYY");

  const receiptData = useMemo(() => {
    if (bookingType === "service_booking") {
      return [
        {
          key: "1",
          title: "Service",
          other: normalizeText(bookingData?.serviceName || bookingData?.serviceTitle || paymentData?.title),
        },
        {
          key: "2",
          title: "Preferred Date",
          other: normalizeText(bookingData?.date),
        },
        {
          key: "3",
          title: "Preferred Time",
          other: normalizeText(bookingData?.time),
        },
        {
          key: "4",
          title: "Amount Paid",
          other: resolvedAmount,
        },
        {
          key: "5",
          title: "Payment Method",
          other: resolvedPaymentMethod,
        },
        {
          key: "6",
          title: "Transaction ID",
          other: resolvedTransactionId,
        },
        {
          key: "7",
          title: "Paid On",
          other: resolvedPaidOn,
        },
      ];
    }

    if (bookingData) {
      return [
        {
          key: "1",
          title: "Amenity",
          other: normalizeText(bookingData?.amenityName || paymentData?.title),
        },
        {
          key: "2",
          title: "Booking Date",
          other: normalizeRange(bookingData?.fromDate, bookingData?.toDate),
        },
        {
          key: "3",
          title: "Time",
          other: normalizeRange(bookingData?.fromTime, bookingData?.toTime),
        },
        {
          key: "4",
          title: "Amount Paid",
          other: resolvedAmount,
        },
        {
          key: "5",
          title: "Payment Method",
          other: resolvedPaymentMethod,
        },
        {
          key: "6",
          title: "Transaction ID",
          other: resolvedTransactionId,
        },
        {
          key: "7",
          title: "Paid On",
          other: resolvedPaidOn,
        },
      ];
    }

    return [
      {
        key: "1",
        title: "Payment For",
        other: normalizeText(paymentData?.title || paymentData?.description),
      },
      {
        key: "2",
        title: "Reference",
        other: resolvedReferenceId,
      },
      {
        key: "3",
        title: "Amount Paid",
        other: resolvedAmount,
      },
      {
        key: "4",
        title: "Payment Method",
        other: resolvedPaymentMethod,
      },
      {
        key: "5",
        title: "Transaction ID",
        other: resolvedTransactionId,
      },
      {
        key: "6",
        title: "Paid On",
        other: resolvedPaidOn,
      },
    ];
  }, [
    bookingData,
    bookingType,
    paymentData,
    resolvedAmount,
    resolvedPaidOn,
    resolvedPaymentMethod,
    resolvedReferenceId,
    resolvedTransactionId,
  ]);

  const receiptText = useMemo(() => {
    const lines = receiptData.map((item) => `${item.title}: ${item.other}`);
    return [
      "CASA NIRVANA RECEIPT",
      "====================",
      ...lines,
      "",
      "Thank you for your payment.",
      "Casa Nirvana Management",
    ].join("\n");
  }, [receiptData]);

  const generateHTMLReceipt = () => {
    const rows = receiptData
      .map(
        (item) => `
      <div class="detail-row">
        <span class="detail-label">${escapeHtml(item.title)}:</span>
        <span class="detail-value">${escapeHtml(item.other)}</span>
      </div>
    `
      )
      .join("");

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Receipt</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .receipt-container { max-width: 620px; margin: 0 auto; background: #fff; padding: 24px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }
        .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #4CAF50; padding-bottom: 14px; }
        .header h1 { color: #4CAF50; margin: 0 0 8px; font-size: 22px; }
        .success-badge { background: #4CAF50; color: #fff; display: inline-block; padding: 6px 12px; border-radius: 999px; font-size: 12px; }
        .detail-row { display: flex; justify-content: space-between; gap: 16px; padding: 10px 0; border-bottom: 1px solid #eee; }
        .detail-label { color: #222; font-weight: 600; }
        .detail-value { color: #555; text-align: right; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="header">
          <h1>CASA NIRVANA</h1>
          <div class="success-badge">PAYMENT SUCCESSFUL</div>
        </div>
        ${rows}
        <div class="footer">
          <p>Thank you for your payment.</p>
          <p><strong>Casa Nirvana Management</strong></p>
        </div>
      </div>
    </body>
    </html>
    `;
  };

  const shareTextReceipt = async () => {
    await Share.share({
      title: "Payment Receipt",
      message: receiptText,
    });
  };

  const handleDownloadReceipt = async () => {
    try {
      let htmlToPdfModule = null;
      try {
        htmlToPdfModule = require("react-native-html-to-pdf");
      } catch {
        htmlToPdfModule = null;
      }

      const RNHTMLtoPDF = htmlToPdfModule?.default || htmlToPdfModule;
      const canGeneratePdf = RNHTMLtoPDF && typeof RNHTMLtoPDF.convert === "function";

      if (!canGeneratePdf) {
        await shareTextReceipt();
        return;
      }

      const fileName = `receipt_${moment().format("YYYYMMDD_HHmmss")}`;
      const file = await RNHTMLtoPDF.convert({
        html: generateHTMLReceipt(),
        fileName,
        directory: "Documents",
        base64: false,
      });

      if (!file?.filePath) {
        throw new Error("PDF generation returned an empty file path.");
      }

      const canShareFile = Platform.OS !== "web" && (await Sharing.isAvailableAsync());
      if (canShareFile) {
        await Sharing.shareAsync(file.filePath, {
          mimeType: "application/pdf",
          dialogTitle: tr("downloadReceipt"),
          UTI: "com.adobe.pdf",
        });
        return;
      }

      await shareTextReceipt();
    } catch (error) {
      console.error("Error generating PDF receipt:", error);
      try {
        await shareTextReceipt();
      } catch (shareError) {
        console.error("Error sharing receipt:", shareError);
        Alert.alert("Error", "Could not generate or share receipt. Please try again.");
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <MyStatusBar />
      <ImageBackground
        resizeMode="stretch"
        source={require("../assets/images/onboarding.png")}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          <View
            style={{
              justifyContent: "center",
              alignItems: "center",
              marginTop: Default.fixPadding * 5,
            }}
          >
            <Image
              source={require("../assets/images/success.png")}
              style={{ width: ms(101), height: ms(101), resizeMode: "contain" }}
            />

            <Text
              style={{
                ...Fonts.SemiBold20black,
                marginTop: Default.fixPadding * 1.5,
              }}
            >
              {tr("paymentSuccess")}
            </Text>
          </View>

          <View
            style={{
              marginTop: Default.fixPadding * 5,
              marginHorizontal: Default.fixPadding * 2,
              borderRadius: 10,
              backgroundColor: Colors.white,
              ...Default.shadow,
            }}
          >
            {receiptData.map((item, index) => (
              <View
                key={item.key}
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                  paddingBottom: Default.fixPadding * 2,
                  paddingHorizontal: Default.fixPadding * 1.2,
                  paddingTop: index === 0 ? Default.fixPadding * 1.8 : Default.fixPadding * 2,
                  borderTopWidth: index === 0 ? 0 : 1,
                  borderTopColor: Colors.lightGrey,
                }}
              >
                <Text
                  numberOfLines={1}
                  style={{
                    ...Fonts.Medium16black,
                    flex: 1,
                    overflow: "hidden",
                    textAlign: isRtl ? "right" : "left",
                  }}
                >
                  {item.title}
                </Text>
                <View
                  style={{
                    flex: 1,
                    alignItems: isRtl ? "flex-start" : "flex-end",
                  }}
                >
                  <Text
                    numberOfLines={1}
                    style={{
                      ...(item.key === "1" ? Fonts.SemiBold16green : Fonts.Medium16black),
                      overflow: "hidden",
                    }}
                  >
                    {item.other}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <TouchableOpacity style={styles.downloadReceiptBtn} onPress={handleDownloadReceipt}>
            <MaterialCommunityIcons
              name="download"
              size={20}
              color={Colors.primary}
              style={{ marginRight: Default.fixPadding * 0.5 }}
            />
            <Text style={{ ...Fonts.SemiBold18primary }}>{tr("downloadReceipt")}</Text>
          </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity
          onPress={navigateHome}
          style={{
            alignSelf: "center",
            margin: Default.fixPadding * 1.6,
          }}
        >
          <Text style={{ ...Fonts.SemiBold16primary }}>{tr("backHome")}</Text>
        </TouchableOpacity>
      </ImageBackground>
    </View>
  );
};

export default SuccessScreen;

const styles = StyleSheet.create({
  downloadReceiptBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    paddingHorizontal: Default.fixPadding * 2.4,
    paddingVertical: Default.fixPadding * 1.4,
    marginTop: Default.fixPadding * 4,
    marginBottom: Default.fixPadding * 2,
    marginHorizontal: Default.fixPadding * 2,
    borderRadius: 10,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.primary,
    ...Default.shadow,
  },
});
