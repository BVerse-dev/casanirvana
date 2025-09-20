import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import React from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import MyStatusBar from "../components/myStatusBar";
import { useHasJoinedCommunity } from "../hooks/useCommunityData";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../utils/supabase";

const MyPaymentMethodsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { profile, isLoading: profileLoading } = useHasJoinedCommunity();
  
  const isRtl = i18n.dir() == "rtl";

  // Safe translation function
  function tr(key, fallback = "Missing Translation") {
    try {
      const translation = t(`myPaymentMethodsScreen:${key}`);
      return (translation && typeof translation === 'string' && translation.trim() !== '') 
        ? translation 
        : fallback;
    } catch (error) {
      return fallback;
    }
  }

  // Fetch saved payment methods for the user
  const { data: paymentMethods, isLoading: methodsLoading, error: methodsError, refetch } = useQuery({
    queryKey: ['paymentMethods', profile?.id],
    queryFn: async () => {
      if (!profile?.id) {
        throw new Error('No user profile found');
      }

      console.log('💳 Fetching payment methods for user:', profile.id);
      console.log('🔍 Profile details:', { 
        profileId: profile.id, 
        profileKeys: Object.keys(profile || {}),
        fullProfile: profile 
      });

      // Also check current auth user
      const { data: { user } } = await supabase.auth.getUser();
      console.log('🔐 Current auth user in MyPaymentMethods:', user?.id);
      console.log('🆔 Profile ID vs Auth ID in fetch:', { profileId: profile.id, authId: user?.id, match: profile.id === user?.id });

      const { data, error } = await supabase
        .from('user_payment_methods')
        .select(`
          id,
          user_id,
          payment_type,
          card_last_four,
          card_brand,
          card_expiry_month,
          card_expiry_year,
          paypal_email,
          mobile_money_number,
          mobile_money_provider,
          is_default,
          is_active,
          created_at,
          updated_at
        `)
        .eq('user_id', user?.id || profile.id)
        .eq('is_active', true)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching payment methods:', error);
        throw error;
      }

      console.log('🔍 Query result:', { data, error, dataLength: data?.length });
      console.log('✅ Payment methods fetched:', data?.length || 0);
      console.log('📋 Raw payment methods data:', data);
      return data || [];
    },
    enabled: !!profile?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const handleAddPaymentMethod = () => {
    console.log('🎯 Navigating to add payment method...');
    navigation.navigate('paymentMethodScreen', {
      isAddingPaymentMethod: true,
      onPaymentMethodAdded: () => {
        console.log('🔄 Payment method added callback triggered');
        refetch(); // Refresh the payment methods list
      }
    });
  };

  const handleDeletePaymentMethod = (methodId, methodType) => {
    Alert.alert(
      tr("deletePaymentMethod", "Delete Payment Method"),
      tr("deletePaymentMethodConfirm", "Are you sure you want to delete this payment method?"),
      [
        {
          text: tr("cancel", "Cancel"),
          style: "cancel"
        },
        {
          text: tr("delete", "Delete"),
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('user_payment_methods')
                .update({ is_active: false })
                .eq('id', methodId);

              if (error) {
                Alert.alert(tr("error", "Error"), tr("deleteError", "Failed to delete payment method"));
                return;
              }

              refetch(); // Refresh the list
              Alert.alert(tr("success", "Success"), tr("deleteSuccess", "Payment method deleted successfully"));
            } catch (err) {
              Alert.alert(tr("error", "Error"), tr("deleteError", "Failed to delete payment method"));
            }
          }
        }
      ]
    );
  };

  const handleSetDefault = async (methodId) => {
    try {
      console.log('🎯 Setting payment method as default:', methodId);
      
      // Get current user ID (same logic as fetch)
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || profile.id;
      
      console.log('🆔 Using user ID for set default:', userId);
      console.log('📋 Current profile ID:', profile.id);

      // First, remove default from all methods for this user
      const { error: removeError } = await supabase
        .from('user_payment_methods')
        .update({ is_default: false })
        .eq('user_id', userId);

      if (removeError) {
        console.error('❌ Error removing default from all methods:', removeError);
        Alert.alert(tr("error", "Error"), tr("setDefaultError", "Failed to set as default"));
        return;
      }

      console.log('✅ Removed default from all methods');

      // Then set the selected method as default
      const { error: setError } = await supabase
        .from('user_payment_methods')
        .update({ is_default: true })
        .eq('id', methodId)
        .eq('user_id', userId); // Extra safety check

      if (setError) {
        console.error('❌ Error setting new default:', setError);
        Alert.alert(tr("error", "Error"), tr("setDefaultError", "Failed to set as default"));
        return;
      }

      console.log('✅ Set new default payment method');

      // Refresh the data to show updated state
      refetch();
      
      Alert.alert(
        tr("success", "Success"), 
        tr("setDefaultSuccess", "Payment method set as default successfully")
      );
    } catch (err) {
      console.error('❌ Error in handleSetDefault:', err);
      Alert.alert(tr("error", "Error"), tr("setDefaultError", "Failed to set as default"));
    }
  };

  const renderPaymentMethodCard = (method) => {
    const getMethodIcon = () => {
      switch (method.payment_type) {
        case 'card':
          return 'credit-card';
        case 'paypal':
          return 'account-balance-wallet';
        case 'mobile_money':
          return 'phone-android';
        default:
          return 'credit-card';
      }
    };

    const getMethodColor = () => {
      switch (method.payment_type) {
        case 'card':
          return Colors.primary;
        case 'paypal':
          return '#0070BA';
        case 'mobile_money':
          return '#FF6B35';
        default:
          return Colors.primary;
      }
    };

    const getMethodTitle = () => {
      switch (method.payment_type) {
        case 'card':
          return `${method.card_brand || 'Card'} •••• ${method.card_last_four}`;
        case 'paypal':
          return method.paypal_email || 'PayPal';
        case 'mobile_money':
          return `${method.mobile_money_provider || 'Mobile Money'} ${method.mobile_money_number || ''}`;
        default:
          return tr("unknownPaymentMethod", "Unknown Payment Method");
      }
    };

    const getMethodSubtitle = () => {
      switch (method.payment_type) {
        case 'card':
          if (method.card_expiry_month && method.card_expiry_year) {
            return tr("expiresOn", "Expires") + ` ${method.card_expiry_month.toString().padStart(2, '0')}/${method.card_expiry_year}`;
          }
          return tr("creditCard", "Credit Card");
        case 'paypal':
          return 'Pay securely with your PayPal account';
        case 'mobile_money':
          return tr("mobileMoneyAccount", "Mobile Money Account");
        default:
          return '';
      }
    };

    const methodColor = getMethodColor();

    return (
      <View 
        key={method.id} 
        style={[
          styles.paymentMethodCard,
          { flexDirection: isRtl ? "row-reverse" : "row" }
        ]}
      >
        {/* Main Card Content Row */}
        <View style={styles.cardMainRow}>
          {/* Circular Icon Background */}
          <View style={[
            styles.iconContainer,
            { backgroundColor: methodColor + '15' }
          ]}>
            <MaterialIcons
              name={getMethodIcon()}
              size={24}
              color={methodColor}
            />
          </View>

          {/* Payment Method Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.methodTitleRow}>
              <Text
                numberOfLines={1}
                style={styles.methodTitle}
              >
                {getMethodTitle()}
              </Text>
            </View>
            <Text
              numberOfLines={1}
              style={styles.methodSubtitle}
            >
              {getMethodSubtitle()}
            </Text>
          </View>

          {/* Default Indicator */}
          <View style={styles.indicatorContainer}>
            {method.is_default ? (
              <MaterialCommunityIcons
                name="star-circle"
                size={22}
                color={Colors.primary}
              />
            ) : (
              <MaterialCommunityIcons
                name="circle-outline"
                size={22}
                color={Colors.lightGrey}
              />
            )}
          </View>
        </View>

        {/* Dotted Line Separator */}
        <View style={styles.dottedLine} />

        {/* Action Buttons Row */}
        <View style={styles.actionButtonsRow}>
          {/* Left Action: Set Default OR Default Badge */}
          {method.is_default ? (
            // Show Default Badge with star icon
            <View style={styles.defaultBadge}>
              <MaterialCommunityIcons name="star" size={14} color={Colors.white} />
              <Text style={styles.defaultBadgeText}>{tr("default", "Default")}</Text>
            </View>
          ) : (
            // Show Set Default Button (clickable)
            <TouchableOpacity 
              style={styles.leftActionButton}
              onPress={() => handleSetDefault(method.id)}
            >
              <MaterialCommunityIcons name="star-outline" size={16} color={Colors.primary} />
              <Text style={styles.leftActionButtonText}>{tr("setDefault", "Set Default")}</Text>
            </TouchableOpacity>
          )}
          
          {/* Delete Button - ALWAYS on the right */}
          <TouchableOpacity 
            style={styles.rightActionButton}
            onPress={() => handleDeletePaymentMethod(method.id, method.payment_type)}
          >
            <MaterialCommunityIcons name="delete-outline" size={16} color={Colors.red} />
            <Text style={styles.rightActionButtonText}>{tr("delete", "Delete")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="credit-card-off" size={64} color={Colors.grey} />
      <Text style={styles.emptyStateTitle}>{tr("noPaymentMethods", "No Payment Methods")}</Text>
      <Text style={styles.emptyStateDescription}>
        {tr("noPaymentMethodsDescription", "You haven't added any payment methods yet. Add one to make payments easier.")}
      </Text>
      <TouchableOpacity style={styles.addFirstMethodButton} onPress={handleAddPaymentMethod}>
        <Text style={styles.addFirstMethodButtonText}>{tr("addFirstPaymentMethod", "Add Your First Payment Method")}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={Colors.primary} />
      <Text style={styles.loadingText}>{tr("loadingPaymentMethods", "Loading payment methods...")}</Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <MaterialCommunityIcons name="alert-circle" size={48} color={Colors.red} />
      <Text style={styles.errorTitle}>{tr("errorLoadingMethods", "Unable to Load Payment Methods")}</Text>
      <Text style={styles.errorMessage}>
        {methodsError?.message || tr("errorLoadingMethodsDescription", "There was an error loading your payment methods. Please try again.")}
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={() => refetch()}>
        <Text style={styles.retryButtonText}>{tr("retry", "Retry")}</Text>
      </TouchableOpacity>
    </View>
  );

  const isLoading = profileLoading || methodsLoading;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.extraLightGrey }}>
      <MyStatusBar />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"}
            size={25}
            color={Colors.black}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{tr("myPaymentMethods", "My Payment Methods")}</Text>
      </View>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={methodsLoading}
            onRefresh={refetch}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        {isLoading ? (
          renderLoadingState()
        ) : methodsError ? (
          renderErrorState()
        ) : !paymentMethods || paymentMethods.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {/* Payment Methods List */}
            <View style={styles.methodsContainer}>
              <Text style={styles.sectionTitle}>
                {tr("savedPaymentMethods", "Saved Payment Methods")} ({paymentMethods.length})
              </Text>
              {paymentMethods.map(renderPaymentMethodCard)}
            </View>

            {/* Add Payment Method Button */}
            <TouchableOpacity style={styles.addMethodButton} onPress={handleAddPaymentMethod}>
              <MaterialCommunityIcons name="plus" size={24} color={Colors.white} />
              <Text style={styles.addMethodButtonText}>{tr("addPaymentMethod", "Add Payment Method")}</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Information Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoHeader}>
            <MaterialCommunityIcons name="information" size={20} color={Colors.primary} />
            <Text style={styles.infoTitle}>{tr("paymentSecurity", "Payment Security")}</Text>
          </View>
          <Text style={styles.infoDescription}>
            {tr("paymentSecurityDescription", "Your payment information is encrypted and stored securely. We never store your full card details.")}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default MyPaymentMethodsScreen;

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Default.fixPadding * 1.2,
    paddingHorizontal: Default.fixPadding * 2,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  headerTitle: {
    ...Fonts.SemiBold18black,
    marginHorizontal: Default.fixPadding,
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Default.fixPadding * 2,
    paddingBottom: Default.fixPadding * 4,
  },

  // Methods Container
  methodsContainer: {
    marginBottom: Default.fixPadding * 2,
  },
  sectionTitle: {
    ...Fonts.SemiBold16black,
    marginBottom: Default.fixPadding * 1.5,
    marginHorizontal: Default.fixPadding * 2,
  },

  // Payment Method Card
  paymentMethodCard: {
    paddingHorizontal: Default.fixPadding * 1.5,
    paddingTop: Default.fixPadding * 1.5,
    paddingBottom: Default.fixPadding * 4.5, // Extra space for dotted line and buttons
    marginBottom: Default.fixPadding * 1.5,
    marginHorizontal: Default.fixPadding * 2, // Exactly match add button width
    borderRadius: 12, // Match add button border radius
    backgroundColor: Colors.white,
    ...Default.shadow,
    position: 'relative',
    width: undefined, // Let flexbox handle width
    alignSelf: 'stretch', // Take full available width
  },
  // Card Main Content Row
  cardMainRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },

  // Icon Container
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Default.fixPadding * 1.2,
  },

  // Details Container
  detailsContainer: {
    flex: 1,
    justifyContent: "center",
  },

  // Indicator Container
  indicatorContainer: {
    width: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.extraLightGrey,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Default.fixPadding * 1.5,
  },
  methodDetails: {
    flex: 1,
  },
  methodTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Default.fixPadding * 0.3,
  },
  methodTitle: {
    ...Fonts.SemiBold16black,
    flex: 1,
    overflow: "hidden",
  },
  methodSubtitle: {
    ...Fonts.Medium14grey,
    marginTop: Default.fixPadding * 0.4,
    overflow: "hidden",
  },
  defaultBadge: {
    backgroundColor: Colors.primary, // Use primary red color
    paddingHorizontal: Default.fixPadding * 0.8,
    paddingVertical: Default.fixPadding * 0.4,
    borderRadius: 12, // More rounded corners like original
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  defaultBadgeText: {
    ...Fonts.SemiBold10white,
    fontSize: 10,
    color: Colors.white, // Ensure white text
    marginLeft: Default.fixPadding * 0.4, // Space between icon and text
  },

  // Dotted Line Separator
  dottedLine: {
    position: 'absolute',
    bottom: Default.fixPadding * 3.8,
    left: Default.fixPadding * 1.5,
    right: Default.fixPadding * 1.5,
    height: 1,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrey,
    borderStyle: 'dotted',
  },

  // Action Buttons Row
  actionButtonsRow: {
    position: 'absolute',
    bottom: Default.fixPadding * 0.5, // Added more space above the buttons
    left: Default.fixPadding * 1.5,
    right: Default.fixPadding * 1.5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Left Action Button (Set as Default)
  leftActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Default.fixPadding * 0.8,
    paddingVertical: Default.fixPadding * 0.4,
  },
  leftActionButtonText: {
    ...Fonts.Medium12black,
    marginLeft: Default.fixPadding * 0.3,
    color: Colors.primary,
    fontSize: 12,
  },

  // Right Action Button (Delete)
  rightActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Default.fixPadding * 0.8,
    paddingVertical: Default.fixPadding * 0.4,
  },
  rightActionButtonText: {
    ...Fonts.Medium12black,
    marginLeft: Default.fixPadding * 0.3,
    color: Colors.red,
    fontSize: 12,
  },

  // Add Method Button
  addMethodButton: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.5,
    borderRadius: 12,
    ...Default.shadow,
  },
  addMethodButtonText: {
    ...Fonts.SemiBold16white,
    marginLeft: Default.fixPadding,
  },

  // Empty State
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Default.fixPadding * 3,
    paddingVertical: Default.fixPadding * 4,
  },
  emptyStateTitle: {
    ...Fonts.SemiBold18black,
    textAlign: "center",
    marginTop: Default.fixPadding * 2,
    marginBottom: Default.fixPadding,
  },
  emptyStateDescription: {
    ...Fonts.Medium14grey,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Default.fixPadding * 2,
  },
  addFirstMethodButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.2,
    borderRadius: 8,
    ...Default.shadow,
  },
  addFirstMethodButtonText: {
    ...Fonts.SemiBold14white,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Default.fixPadding * 4,
  },
  loadingText: {
    ...Fonts.Medium14grey,
    marginTop: Default.fixPadding * 1.5,
    textAlign: "center",
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: Default.fixPadding * 3,
    paddingVertical: Default.fixPadding * 4,
  },
  errorTitle: {
    ...Fonts.SemiBold18black,
    textAlign: "center",
    marginTop: Default.fixPadding * 2,
    marginBottom: Default.fixPadding,
  },
  errorMessage: {
    ...Fonts.Medium14grey,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: Default.fixPadding * 2,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.2,
    borderRadius: 8,
    ...Default.shadow,
  },
  retryButtonText: {
    ...Fonts.SemiBold14white,
  },

  // Info Section
  infoSection: {
    backgroundColor: Colors.white,
    marginHorizontal: Default.fixPadding * 2,
    borderRadius: 12,
    padding: Default.fixPadding * 1.5,
    ...Default.shadow,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Default.fixPadding,
  },
  infoTitle: {
    ...Fonts.SemiBold14black,
    marginLeft: Default.fixPadding * 0.5,
  },
  infoDescription: {
    ...Fonts.Medium12grey,
    lineHeight: 18,
  },
});
