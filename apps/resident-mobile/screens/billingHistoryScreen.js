import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import MyStatusBar from "../components/myStatusBar";
import { Colors, Fonts, Default } from "../constants/styles";
import { useTranslation } from "react-i18next";
import { ms } from "react-native-size-matters/extend";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import DashedLine from "react-native-dashed-line";
import {
  useListPendingPayments,
  useListPaymentHistory,
  useListPaymentStatements,
  useDownloadPaymentReceipt,
  useDownloadPaymentStatement,
} from '../hooks/usePayments';
import { useHasJoinedCommunity } from '../hooks/useCommunityData';

const BillingHistoryScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();

  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`billingHistoryScreen:${key}`);
  }

  const [activeTab, setActiveTab] = useState('history');
  const [refreshing, setRefreshing] = useState(false);

  // Use the SAME authentication pattern as working screens
  const { profile, isLoading: authLoading } = useHasJoinedCommunity();

  // Supabase hooks for real-time data - using unit_id directly from profile
  const { data: pendingPayments = [], isLoading: loadingPending, refetch: refetchPending } = useListPendingPayments(profile?.unit_id);
  const { data: paymentHistory = [], isLoading: loadingHistory, refetch: refetchHistory } = useListPaymentHistory(profile?.unit_id);
  const { data: statements = [], isLoading: loadingStatements, refetch: refetchStatements } = useListPaymentStatements(profile?.unit_id);
  
  // Download mutations
  const downloadReceiptMutation = useDownloadPaymentReceipt();
  const downloadStatementMutation = useDownloadPaymentStatement();

  // Format data for UI display
  const formatPendingPayments = pendingPayments.map(payment => ({
    id: payment.id,
    title: payment.title || `${payment.payment_type} - $${payment.amount}`,
    amount: `$${payment.amount}`,
    dueDate: new Date(payment.due_date).toLocaleDateString(),
    description: payment.description || 'Monthly payment',
    paymentType: payment.payment_type
  }));

  const formatPaymentHistory = paymentHistory.map(payment => ({
    id: payment.id,
    title: payment.title || `${payment.payment_type} - $${payment.amount}`,
    amount: `$${payment.amount}`,
    paidDate: new Date(payment.paid_at).toLocaleDateString(),
    description: payment.description || 'Monthly payment',
    transactionId: payment.transaction_id,
    hasReceipt: !!payment.receipt_url
  }));

  const formatStatements = statements.map(statement => ({
    id: statement.id,
    month: statement.month_year,
    totalAmount: `$${statement.total_amount}`,
    itemsCount: statement.items_count,
    status: statement.status,
    generatedDate: statement.generated_date ? new Date(statement.generated_date).toLocaleDateString() : 'Jan 1, 2025',
    canDownload: statement.status === 'ready' && !!statement.statement_url
  }));

  // Pull to refresh handler
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchPending(),
        refetchHistory(), 
        refetchStatements()
      ]);
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // Download handlers
  const handleDownloadReceipt = async (paymentId) => {
    try {
      const result = await downloadReceiptMutation.mutateAsync(paymentId);
      if (result.url) {
        await Linking.openURL(result.url);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not download receipt. Please try again.');
      console.error('Receipt download error:', error);
    }
  };

  const handleDownloadStatement = async (statementId) => {
    try {
      const result = await downloadStatementMutation.mutateAsync(statementId);
      if (result.url) {
        await Linking.openURL(result.url);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not download statement. Please try again.');
      console.error('Statement download error:', error);
    }
  };

  // Show loading state
  if (authLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.regularGrey }}>
        <MyStatusBar />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ ...Fonts.Medium16black, marginTop: 10 }}>Loading your profile...</Text>
        </View>
      </View>
    );
  }

  // Loading state for data
  if (loadingPending || loadingHistory || loadingStatements) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.regularGrey }}>
        <MyStatusBar />
        <View
          style={{
            flexDirection: isRtl ? "row-reverse" : "row",
            alignItems: "center",
            paddingHorizontal: Default.fixPadding * 2,
            paddingVertical: Default.fixPadding * 1.2,
            backgroundColor: Colors.white,
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
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
            Billing History
          </Text>
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={{ ...Fonts.Medium16black, marginTop: Default.fixPadding }}>
            Loading billing history...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.regularGrey }}>
      <MyStatusBar />
      
      {/* Header */}
      <View
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          paddingHorizontal: Default.fixPadding * 2,
          paddingVertical: Default.fixPadding * 1.2,
          backgroundColor: Colors.white,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
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
          Billing History
        </Text>
      </View>

      {/* Banner Section */}
      <View
        style={{
          paddingTop: Default.fixPadding * 0.8,
          paddingBottom: Default.fixPadding * 2,
          paddingHorizontal: Default.fixPadding * 2,
          marginBottom: Default.fixPadding * 2,
          backgroundColor: Colors.white,
        }}
      >
        <Text
          style={{
            ...Fonts.SemiBold16black,
            textAlign: isRtl ? "right" : "left",
          }}
        >
          Your Payment Records
        </Text>

        <View
          style={{
            overflow: "hidden",
            flexDirection: isRtl ? "row-reverse" : "row",
            marginTop: Default.fixPadding,
            marginBottom: Default.fixPadding * 2,
            borderRadius: 16,
            elevation: 8,
            shadowColor: Colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
          }}
        >
          <View style={{ flex: 0.2, backgroundColor: Colors.primary }} />
          <LinearGradient
            colors={['rgba(30, 71, 153, 0.95)', 'rgba(0, 141, 185, 0.9)', 'rgba(201, 44, 36, 0.85)']}
            start={[0, 0]}
            end={[1, 1]}
            style={{
              flex: 9.8,
              flexDirection: isRtl ? "row-reverse" : "row",
              justifyContent: "center",
              minHeight: 120,
            }}
          >
            <View
              style={{
                flex: 7,
                justifyContent: "center",
                alignItems: isRtl ? "flex-end" : "flex-start",
                paddingLeft: isRtl ? Default.fixPadding : Default.fixPadding * 1.5,
                paddingRight: isRtl ? Default.fixPadding * 1.5 : Default.fixPadding,
                paddingVertical: Default.fixPadding * 1.5,
              }}
            >
              <Text
                numberOfLines={1}
                style={{ 
                  ...Fonts.SemiBold16white, 
                  overflow: "hidden",
                  textAlign: isRtl ? "right" : "left",
                  textShadowColor: 'rgba(0, 0, 0, 0.3)',
                  textShadowOffset: {width: 0, height: 1},
                  textShadowRadius: 2,
                  fontSize: 18,
                  fontWeight: '600',
                }}
              >
                Payment History
              </Text>
              
              <View
                style={{
                  width: 50,
                  borderBottomWidth: 1.5,
                  borderBottomColor: 'rgba(255, 255, 255, 0.7)',
                  marginVertical: Default.fixPadding * 0.5,
                }}
              />
              
              <Text
                numberOfLines={2}
                style={{
                  ...Fonts.Medium14white,
                  overflow: "hidden",
                  textAlign: isRtl ? "right" : "left",
                  color: 'rgba(255, 255, 255, 0.95)',
                  textShadowColor: 'rgba(0, 0, 0, 0.2)',
                  textShadowOffset: {width: 0, height: 1},
                  textShadowRadius: 1,
                  lineHeight: 20,
                  fontSize: 13,
                }}
              >
                View all your payments, receipts, and billing statements
              </Text>

              <View
                style={{
                  flexDirection: isRtl ? "row-reverse" : "row",
                  alignItems: "center",
                  marginTop: Default.fixPadding * 0.8,
                }}
              >
                <MaterialCommunityIcons
                  name="history"
                  size={16}
                  color="rgba(255, 255, 255, 0.9)"
                />
                <Text
                  style={{
                    ...Fonts.Medium12white,
                    marginHorizontal: Default.fixPadding * 0.5,
                    color: 'rgba(255, 255, 255, 0.9)',
                    textShadowColor: 'rgba(0, 0, 0, 0.2)',
                    textShadowOffset: {width: 0, height: 1},
                    textShadowRadius: 1,
                  }}
                >
                  Complete transaction records
                </Text>
              </View>
            </View>

            <View
              style={{
                flex: 2.8,
                justifyContent: "flex-end",
                alignItems: isRtl ? "flex-start" : "flex-end",
                paddingHorizontal: Default.fixPadding * 0.8,
                paddingBottom: Default.fixPadding * 0.1,
              }}
            >
              <MaterialCommunityIcons
                name="receipt"
                size={ms(70)}
                color="rgba(255, 255, 255, 0.9)"
                style={{ opacity: 0.9 }}
              />
            </View>
          </LinearGradient>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'pending' && styles.activeTabButton]}
            onPress={() => setActiveTab('pending')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'pending' && styles.activeTabButtonText]}>
              Pending ({formatPendingPayments.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'history' && styles.activeTabButton]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'history' && styles.activeTabButtonText]}>
              Paid ({formatPaymentHistory.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'statements' && styles.activeTabButton]}
            onPress={() => setActiveTab('statements')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'statements' && styles.activeTabButtonText]}>
              Statements ({formatStatements.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Content */}
      <View style={{ flex: 1, paddingHorizontal: Default.fixPadding * 2 }}>
        {activeTab === 'pending' && (
          <FlatList
            data={formatPendingPayments}
            renderItem={({ item, index }) => {
              const lastIndex = formatPendingPayments.length - 1 === index;
              return (
                <View style={[
                  styles.paymentCard,
                  { marginBottom: lastIndex ? Default.fixPadding : Default.fixPadding * 2 }
                ]}>
                  {/* Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.paymentTitleContainer}>
                      <Text style={styles.paymentTitle}>{item.title}</Text>
                    </View>
                  </View>

                  {/* Main Content */}
                  <View style={styles.cardMainContent}>
                    <View style={styles.paymentDetailsContainer}>
                      <View style={styles.dueDateContainer}>
                        <MaterialCommunityIcons
                          name="calendar-clock"
                          size={16}
                          color={Colors.red}
                        />
                        <Text style={styles.paymentDueDate}>Due: {item.dueDate}</Text>
                      </View>
                    </View>
                    
                    {/* Status Badge */}
                    <View style={styles.rightStatusContainer}>
                      <View style={styles.pendingStatusBadge}>
                        <Text style={styles.pendingStatusText}>Pending</Text>
                      </View>
                    </View>
                  </View>

                  {/* Description */}
                  <View style={styles.descriptionBelowStatus}>
                    <Text style={styles.paymentDescription}>
                      {item.description || 'Monthly maintenance fee'}
                    </Text>
                  </View>

                  <DashedLine
                    dashGap={2.5}
                    dashLength={2.5}
                    dashThickness={1.5}
                    dashColor={Colors.grey}
                  />

                  {/* Action Section */}
                  <View style={styles.cardActionSection}>
                    <View style={styles.amountContainer}>
                      <MaterialCommunityIcons
                        name="currency-usd"
                        size={20}
                        color={Colors.primary}
                      />
                      <Text style={styles.paymentAmount}>{item.amount}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.payButton}
                      onPress={() => navigation.navigate('paymentMethodScreen', {
                        paymentData: {
                          id: item.id,
                          title: item.title,
                          amount: parseFloat(item.amount.replace('$', '')),
                          dueDate: item.dueDate,
                          description: item.description || 'Monthly maintenance fee',
                          type: 'payment'
                        }
                      })}
                    >
                      <MaterialCommunityIcons
                        name="credit-card-outline"
                        size={18}
                        color={Colors.white}
                        style={{ marginRight: Default.fixPadding * 0.5 }}
                      />
                      <Text style={styles.payButtonText}>Pay Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: Default.fixPadding * 2 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={60}
                  color={Colors.grey}
                />
                <Text style={styles.emptyTitle}>No Pending Payments</Text>
                <Text style={styles.emptyDescription}>
                  You're all caught up! No pending payments at this time.
                </Text>
              </View>
            )}
          />
        )}
        
        {activeTab === 'history' && (
          <FlatList
            data={formatPaymentHistory}
            renderItem={({ item, index }) => {
              const lastIndex = formatPaymentHistory.length - 1 === index;
              return (
                <View style={[
                  styles.paymentCard,
                  { marginBottom: lastIndex ? Default.fixPadding : Default.fixPadding * 2 }
                ]}>
                  {/* Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.paymentTitleContainer}>
                      <Text style={styles.paymentTitle}>{item.title}</Text>
                    </View>
                  </View>

                  {/* Main Content */}
                  <View style={styles.cardMainContent}>
                    <View style={styles.paymentDetailsContainer}>
                      <View style={styles.paidDateContainer}>
                        <MaterialCommunityIcons
                          name="calendar-check"
                          size={16}
                          color={Colors.green}
                        />
                        <Text style={styles.paymentPaidDate}>Paid: {item.paidDate}</Text>
                      </View>
                    </View>
                    
                    {/* Status Badge */}
                    <View style={styles.rightStatusContainer}>
                      <View style={styles.paidStatusBadge}>
                        <Text style={styles.paidStatusText}>Paid</Text>
                      </View>
                    </View>
                  </View>

                  {/* Description and Transaction ID */}
                  <View style={styles.descriptionBelowStatus}>
                    <Text style={styles.paymentDescription}>
                      {item.description || 'Monthly maintenance fee'}
                    </Text>
                    
                    <View style={styles.transactionContainer}>
                      <MaterialCommunityIcons
                        name="receipt"
                        size={16}
                        color={Colors.grey}
                      />
                      <Text style={styles.transactionId}>Transaction ID: {item.transactionId || 'TXN' + Math.random().toString(36).substr(2, 9).toUpperCase()}</Text>
                    </View>
                  </View>

                  <DashedLine
                    dashGap={2.5}
                    dashLength={2.5}
                    dashThickness={1.5}
                    dashColor={Colors.grey}
                  />

                  {/* Action Section */}
                  <View style={styles.cardActionSection}>
                    <View style={styles.amountContainer}>
                      <MaterialCommunityIcons
                        name="currency-usd"
                        size={20}
                        color={Colors.green}
                      />
                      <Text style={[styles.paymentAmount, { color: Colors.green }]}>{item.amount}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.receiptButton}
                      onPress={() => handleDownloadReceipt(item.id)}
                      disabled={!item.hasReceipt}
                    >
                      <MaterialCommunityIcons
                        name="download"
                        size={18}
                        color={Colors.primary}
                        style={{ marginRight: Default.fixPadding * 0.5 }}
                      />
                      <Text style={styles.receiptButtonText}>Receipt</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: Default.fixPadding * 2 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="history"
                  size={60}
                  color={Colors.grey}
                />
                <Text style={styles.emptyTitle}>No Payment History</Text>
                <Text style={styles.emptyDescription}>
                  Your completed payments will appear here once you make your first payment.
                </Text>
              </View>
            )}
          />
        )}
        
        {activeTab === 'statements' && (
          <FlatList
            data={formatStatements}
            renderItem={({ item, index }) => {
              const lastIndex = formatStatements.length - 1 === index;
              return (
                <TouchableOpacity 
                  style={[
                    styles.paymentCard,
                    { marginBottom: lastIndex ? Default.fixPadding : Default.fixPadding * 2 }
                  ]}
                  activeOpacity={0.8}
                >
                  {/* Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.paymentTitleContainer}>
                      <Text style={styles.paymentTitle}>{item.month}</Text>
                    </View>
                  </View>

                  {/* Main Content */}
                  <View style={styles.cardMainContent}>
                    <View style={styles.paymentDetailsContainer}>
                      <View style={styles.itemsContainer}>
                        <MaterialCommunityIcons
                          name="format-list-bulleted"
                          size={16}
                          color={Colors.grey}
                        />
                        <Text style={styles.itemsCountText}>{item.itemsCount} items included</Text>
                      </View>

                      <View style={styles.generatedDateContainer}>
                        <MaterialCommunityIcons
                          name="calendar-outline"
                          size={16}
                          color={Colors.grey}
                        />
                        <Text style={styles.generatedDate}>Generated: {item.generatedDate || 'Jan 1, 2025'}</Text>
                      </View>
                    </View>
                    
                    {/* Status Badge */}
                    <View style={styles.rightStatusContainer}>
                      <View style={item.status === 'ready' ? styles.statementReadyBadge : styles.statementNotReadyBadge}>
                        <Text style={item.status === 'ready' ? styles.statementReadyText : styles.statementNotReadyText}>
                          {item.status === 'ready' ? 'Ready' : 'Processing'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Description */}
                  <View style={styles.descriptionBelowStatus}>
                    <Text style={styles.paymentDescription}>
                      {item.status === 'ready' 
                        ? 'Monthly statement with all transactions and charges, ready for download'
                        : 'Monthly statement is being processed and will be available soon'
                      }
                    </Text>
                  </View>

                  <DashedLine
                    dashGap={2.5}
                    dashLength={2.5}
                    dashThickness={1.5}
                    dashColor={Colors.grey}
                  />

                  {/* Action Section */}
                  <View style={styles.cardActionSection}>
                    <View style={styles.amountContainer}>
                      <MaterialCommunityIcons
                        name="file-document-outline"
                        size={20}
                        color={Colors.primary}
                      />
                      <Text style={styles.paymentAmount}>{item.totalAmount}</Text>
                    </View>
                    <TouchableOpacity 
                      style={item.status === 'ready' ? styles.downloadStatementButton : styles.disabledDownloadButton}
                      disabled={item.status !== 'ready' || !item.canDownload}
                      onPress={() => item.canDownload && handleDownloadStatement(item.id)}
                    >
                      <MaterialCommunityIcons
                        name="download"
                        size={18}
                        color={item.status === 'ready' ? Colors.white : Colors.grey}
                        style={{ marginRight: Default.fixPadding * 0.5 }}
                      />
                      <Text style={item.status === 'ready' ? styles.downloadStatementButtonText : styles.disabledDownloadButtonText}>
                        {item.status === 'ready' ? 'Download' : 'Processing'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            }}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: Default.fixPadding * 2 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
              />
            }
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                  name="file-document-outline"
                  size={60}
                  color={Colors.grey}
                />
                <Text style={styles.emptyTitle}>No Statements Available</Text>
                <Text style={styles.emptyDescription}>
                  Monthly billing statements will be generated and available for download here.
                </Text>
              </View>
            )}
          />
        )}
      </View>
    </View>
  );
};

export default BillingHistoryScreen;

const styles = StyleSheet.create({
  // Tab styles
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.lightLinkWater,
    borderRadius: 10,
    padding: 4,
    marginTop: Default.fixPadding,
  },
  tabButton: {
    flex: 1,
    paddingVertical: Default.fixPadding,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: Colors.primary,
  },
  tabButtonText: {
    ...Fonts.Medium12black,
    fontSize: 11,
  },
  activeTabButtonText: {
    ...Fonts.Medium12white,
    fontSize: 11,
    color: Colors.white,
  },

  // Payment card styles
  paymentCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    marginBottom: Default.fixPadding,
    ...Default.shadow,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Default.fixPadding * 0.8,
    paddingHorizontal: Default.fixPadding * 1.2,
  },
  
  paymentTitleContainer: {
    flex: 1,
  },

  paymentTitle: {
    ...Fonts.SemiBold16black,
    marginBottom: Default.fixPadding * 0.5,
  },

  paymentAmount: {
    ...Fonts.SemiBold18primary,
    marginBottom: Default.fixPadding * 0.5,
  },

  paymentDueDate: {
    ...Fonts.Medium12grey,
  },

  paymentPaidDate: {
    ...Fonts.Medium12grey,
  },

  // Status badges
  pendingStatusBadge: {
    backgroundColor: Colors.orange,
    paddingHorizontal: Default.fixPadding * 0.8,
    paddingVertical: Default.fixPadding * 0.4,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  
  pendingStatusText: {
    ...Fonts.SemiBold12white,
  },
  
  paidStatusBadge: {
    backgroundColor: Colors.green,
    paddingHorizontal: Default.fixPadding * 0.8,
    paddingVertical: Default.fixPadding * 0.4,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  
  paidStatusText: {
    ...Fonts.SemiBold12white,
  },
  
  statementReadyBadge: {
    backgroundColor: Colors.green,
    paddingHorizontal: Default.fixPadding * 0.8,
    paddingVertical: Default.fixPadding * 0.4,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  
  statementReadyText: {
    ...Fonts.SemiBold12white,
  },
  
  statementNotReadyBadge: {
    backgroundColor: Colors.red,
    paddingHorizontal: Default.fixPadding * 0.8,
    paddingVertical: Default.fixPadding * 0.4,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  
  statementNotReadyText: {
    ...Fonts.SemiBold12white,
  },
  
  cardMainContent: {
    flexDirection: 'row',
    paddingHorizontal: Default.fixPadding * 1.2,
    paddingTop: Default.fixPadding,
    paddingBottom: Default.fixPadding * 1.5,
    alignItems: 'flex-start',
  },
  
  paymentDetailsContainer: {
    flex: 1,
    gap: Default.fixPadding * 0.8,
  },
  
  rightStatusContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Default.fixPadding,
  },
  
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Default.fixPadding * 0.5,
  },
  
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Default.fixPadding * 0.5,
  },
  
  paidDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Default.fixPadding * 0.5,
  },
  
  itemsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Default.fixPadding * 0.5,
  },
  
  itemsCountText: {
    ...Fonts.Medium14grey,
  },
  
  paymentDescription: {
    ...Fonts.Medium12grey,
    lineHeight: 18,
  },
  
  descriptionBelowStatus: {
    paddingHorizontal: Default.fixPadding * 1.2,
    paddingTop: Default.fixPadding * 0.8,
    paddingBottom: Default.fixPadding,
  },
  
  transactionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Default.fixPadding * 0.5,
    marginTop: Default.fixPadding * 0.2,
  },
  
  transactionId: {
    ...Fonts.Medium12grey,
    fontFamily: 'monospace',
  },
  
  generatedDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Default.fixPadding * 0.5,
  },
  
  generatedDate: {
    ...Fonts.Medium12grey,
  },
  
  cardActionSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Default.fixPadding * 1.2,
    paddingVertical: Default.fixPadding * 1.5,
  },

  // Action buttons
  payButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 0.8,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
    ...Default.shadow,
    elevation: 2,
  },
  
  payButtonText: {
    ...Fonts.SemiBold14white,
  },
  
  receiptButton: {
    backgroundColor: Colors.white,
    borderColor: Colors.primary,
    borderWidth: 1.5,
    paddingHorizontal: Default.fixPadding * 1.5,
    paddingVertical: Default.fixPadding * 0.8,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  
  receiptButtonText: {
    ...Fonts.SemiBold14primary,
  },
  
  downloadStatementButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 0.8,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
    ...Default.shadow,
    elevation: 2,
  },
  
  downloadStatementButtonText: {
    ...Fonts.SemiBold14white,
  },
  
  disabledDownloadButton: {
    backgroundColor: Colors.lightGrey,
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 0.8,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 160,
    opacity: 0.6,
  },
  
  disabledDownloadButtonText: {
    ...Fonts.SemiBold14grey,
  },

  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Default.fixPadding * 4,
    paddingHorizontal: Default.fixPadding * 2,
  },
  
  emptyTitle: {
    ...Fonts.SemiBold18black,
    marginTop: Default.fixPadding * 2,
    marginBottom: Default.fixPadding,
    textAlign: 'center',
  },
  
  emptyDescription: {
    ...Fonts.Medium14grey,
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: Default.fixPadding,
  },
});
