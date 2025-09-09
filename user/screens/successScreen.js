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
} from "react-native";
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import MyStatusBar from "../components/myStatusBar";
import { ms } from "react-native-size-matters/extend";
import moment from "moment";
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const SuccessScreen = ({ navigation, route }) => {
  const { bookingId, bookingData, paymentMethod, transactionId } = route.params || {};
  const { t, i18n } = useTranslation();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`successScreen:${key}`);
  }

  useEffect(() => {
    navigation.addListener("beforeRemove", (e) => {
      e.preventDefault();
      navigation.navigate("homeScreen");
    });
  }, []);

  // Auto-navigate to home after 5 seconds instead of 2 seconds to give user time to read
  setTimeout(() => {
    navigation.navigate("homeScreen");
  }, 5000);

  // Generate receipt data from booking information
  const receiptData = bookingData ? [
    {
      key: "1",
      title: "Amenity",
      other: bookingData.amenityName || "N/A",
    },
    {
      key: "2",
      title: "Booking Date",
      other: `${bookingData.fromDate} - ${bookingData.toDate}`,
    },
    {
      key: "3",
      title: "Time",
      other: `${bookingData.fromTime} - ${bookingData.toTime}`,
    },
    {
      key: "4",
      title: "Amount Paid",
      other: bookingData.totalAmount > 0 ? `GH₵ ${bookingData.totalAmount.toFixed(2)}` : "Free",
    },
    {
      key: "5",
      title: "Payment Method",
      other: paymentMethod || "N/A",
    },
    {
      key: "6",
      title: "Transaction ID",
      other: transactionId || "N/A",
    },
    {
      key: "7",
      title: "Paid On",
      other: moment().format("DD MMMM, YYYY"),
    },
  ] : [
    {
      key: "1",
      title: tr("securityDeposit"),
      other: tr("paid"),
    },
    {
      key: "2",
      title: tr("amountPaid"),
      other: "$50.00",
    },
    {
      key: "3",
      title: tr("paidOn"),
      other: "5 June, 2022",
    },
    {
      key: "4",
      title: tr("paidVia"),
      other: "Credit card",
    },
    {
      key: "5",
      title: tr("transactionID"),
      other: "DF12345678910",
    },
  ];

  // Generate HTML template for PDF receipt
  const generateHTMLReceipt = () => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Amenity Booking Receipt</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f5f5f5;
            }
            .receipt-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: white;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
                border-bottom: 2px solid #4CAF50;
                padding-bottom: 20px;
            }
            .header h1 {
                color: #4CAF50;
                margin: 0;
                font-size: 24px;
            }
            .header p {
                color: #666;
                margin: 5px 0;
            }
            .receipt-details {
                margin-bottom: 20px;
            }
            .detail-row {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid #eee;
            }
            .detail-label {
                font-weight: bold;
                color: #333;
            }
            .detail-value {
                color: #666;
            }
            .total-row {
                background-color: #f9f9f9;
                padding: 15px;
                border-radius: 5px;
                margin-top: 20px;
            }
            .total-row .detail-row {
                border-bottom: none;
                font-size: 18px;
                font-weight: bold;
            }
            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
            }
            .success-badge {
                background-color: #4CAF50;
                color: white;
                padding: 5px 15px;
                border-radius: 20px;
                font-size: 12px;
                display: inline-block;
                margin-top: 10px;
            }
        </style>
    </head>
    <body>
        <div class="receipt-container">
            <div class="header">
                <h1>CASA NIRVANA</h1>
                <p>Amenity Booking Receipt</p>
                <div class="success-badge">PAYMENT SUCCESSFUL</div>
            </div>
            
            <div class="receipt-details">
                <div class="detail-row">
                    <span class="detail-label">Booking ID:</span>
                    <span class="detail-value">${bookingId || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Amenity:</span>
                    <span class="detail-value">${bookingData?.amenityName || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Booking Date:</span>
                    <span class="detail-value">${bookingData?.fromDate || 'N/A'} to ${bookingData?.toDate || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Time:</span>
                    <span class="detail-value">${bookingData?.fromTime || 'N/A'} - ${bookingData?.toTime || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Total Days:</span>
                    <span class="detail-value">${bookingData?.totalDays || 1} ${bookingData?.totalDays === 1 ? 'day' : 'days'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment Method:</span>
                    <span class="detail-value">${paymentMethod || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Transaction ID:</span>
                    <span class="detail-value">${transactionId || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Payment Date:</span>
                    <span class="detail-value">${moment().format("DD MMMM, YYYY - hh:mm A")}</span>
                </div>
            </div>
            
            <div class="total-row">
                <div class="detail-row">
                    <span class="detail-label">Total Amount Paid:</span>
                    <span class="detail-value">${bookingData?.totalAmount > 0 ? `GH₵ ${bookingData.totalAmount.toFixed(2)}` : 'Free'}</span>
                </div>
            </div>
            
            <div class="footer">
                <p>Thank you for your booking!</p>
                <p>For any queries, please contact our support team.</p>
                <p><strong>Casa Nirvana Management</strong></p>
            </div>
        </div>
    </body>
    </html>
    `;
  };

  // Handle download receipt as PDF
  const handleDownloadReceipt = async () => {
    try {
      const htmlContent = generateHTMLReceipt();
      const fileName = `receipt_${bookingId || moment().format('YYYYMMDD_HHmmss')}.pdf`;
      
      // Create PDF from HTML
      const options = {
        html: htmlContent,
        fileName: fileName,
        directory: 'Documents',
        base64: false,
        width: 595,
        height: 842,
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 20,
        paddingRight: 20,
      };
      
      const file = await RNHTMLtoPDF.convert(options);
      
      if (file.filePath) {
        // Check if sharing is available
        const isAvailable = await Sharing.isAvailableAsync();
        
        if (isAvailable) {
          await Sharing.shareAsync(file.filePath, {
            mimeType: 'application/pdf',
            dialogTitle: 'Download Receipt',
            UTI: 'com.adobe.pdf',
          });
          Alert.alert('Success', 'Receipt downloaded successfully!');
        } else {
          Alert.alert('Success', `Receipt saved to: ${file.filePath}`);
        }
      } else {
        throw new Error('Failed to generate PDF file');
      }
    } catch (error) {
      console.error('Error generating PDF receipt:', error);
      
      // Fallback to text sharing if PDF generation fails
      try {
        const receiptText = `
AMENITY BOOKING RECEIPT
====================

Booking ID: ${bookingId || 'N/A'}
Amenity: ${bookingData?.amenityName || 'N/A'}
Date: ${bookingData?.fromDate || 'N/A'} - ${bookingData?.toDate || 'N/A'}
Time: ${bookingData?.fromTime || 'N/A'} - ${bookingData?.toTime || 'N/A'}
Total Days: ${bookingData?.totalDays || 1} ${bookingData?.totalDays === 1 ? 'day' : 'days'}
Amount: ${bookingData?.totalAmount > 0 ? `GH₵ ${bookingData.totalAmount.toFixed(2)}` : 'Free'}
Payment Method: ${paymentMethod || 'N/A'}
Transaction ID: ${transactionId || 'N/A'}
Paid On: ${moment().format("DD MMMM, YYYY - hh:mm A")}

Thank you for your booking!
Casa Nirvana Management
        `;

        await Share.share({
          message: receiptText,
          title: 'Amenity Booking Receipt',
        });
      } catch (shareError) {
        console.error('Error sharing receipt:', shareError);
        Alert.alert('Error', 'Could not generate or share receipt. Please try again.');
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
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
            {receiptData.map((item, index) => {
              return (
                <View
                  key={item.key}
                  style={{
                    flexDirection: isRtl ? "row-reverse" : "row",
                    alignItems: "center",
                    paddingBottom: Default.fixPadding * 2,
                    paddingHorizontal: Default.fixPadding * 1.2,
                    paddingTop:
                      index === 0
                        ? Default.fixPadding * 1.8
                        : Default.fixPadding * 2,
                    borderTopWidth: index === 0 ? null : 1,
                    borderTopColor: index === 0 ? null : Colors.lightGrey,
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
                        ...(item.key === "1"
                          ? Fonts.SemiBold16green
                          : Fonts.Medium16black),
                        overflow: "hidden",
                      }}
                    >
                      {item.other}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          <TouchableOpacity 
            style={styles.downloadReceiptBtn}
            onPress={handleDownloadReceipt}
          >
            <MaterialCommunityIcons
              name="download"
              size={20}
              color={Colors.primary}
              style={{ marginRight: Default.fixPadding * 0.5 }}
            />
            <Text style={{ ...Fonts.SemiBold18primary }}>
              {tr("downloadReceipt")}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        <TouchableOpacity
          onPress={() => navigation.navigate("homeScreen")}
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
