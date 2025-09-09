import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MyStatusBar from "../components/myStatusBar";

const BookingHistoryScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`settingScreen:${key}`);
  }

  const [selectedFilter, setSelectedFilter] = useState("all");

  const [bookingHistory] = useState([
    {
      id: "1",
      serviceProvider: "GoldKey Plumbing Services",
      service: "Pipe Repair",
      date: "2024-07-28",
      time: "10:00 AM",
      status: "completed",
      amount: "₵150.00",
      rating: 5,
      category: "plumbing",
      address: "Unit 4B, Block A",
      duration: "2 hours",
      technician: "John Mensah",
      description: "Fixed leaking kitchen sink pipe",
    },
    {
      id: "2",
      serviceProvider: "ElectroFix Solutions",
      service: "Light Installation",
      date: "2024-07-25",
      time: "2:30 PM",
      status: "completed",
      amount: "₵80.00",
      rating: 4,
      category: "electrical",
      address: "Unit 4B, Block A",
      duration: "1 hour",
      technician: "Sarah Osei",
      description: "Installed new LED ceiling lights in living room",
    },
    {
      id: "3",
      serviceProvider: "CleanPro Housekeeping",
      service: "Deep Cleaning",
      date: "2024-07-30",
      time: "9:00 AM",
      status: "in_progress",
      amount: "₵200.00",
      rating: null,
      category: "cleaning",
      address: "Unit 4B, Block A",
      duration: "4 hours",
      technician: "Mary Asante",
      description: "Complete apartment deep cleaning service",
    },
    {
      id: "4",
      serviceProvider: "SecureHome Security",
      service: "CCTV Installation",
      date: "2024-08-02",
      time: "11:00 AM",
      status: "scheduled",
      amount: "₵500.00",
      rating: null,
      category: "security",
      address: "Unit 4B, Block A",
      duration: "3 hours",
      technician: "TBD",
      description: "Install 4-camera CCTV system",
    },
    {
      id: "5",
      serviceProvider: "HandyFix Repairs",
      service: "Door Lock Repair",
      date: "2024-07-20",
      time: "3:00 PM",
      status: "cancelled",
      amount: "₵60.00",
      rating: null,
      category: "maintenance",
      address: "Unit 4B, Block A",
      duration: "1 hour",
      technician: "N/A",
      description: "Repair main door lock mechanism",
    },
  ]);

  const filters = [
    { key: "all", name: "All", count: bookingHistory.length },
    { key: "completed", name: "Completed", count: bookingHistory.filter(b => b.status === "completed").length },
    { key: "in_progress", name: "In Progress", count: bookingHistory.filter(b => b.status === "in_progress").length },
    { key: "scheduled", name: "Scheduled", count: bookingHistory.filter(b => b.status === "scheduled").length },
    { key: "cancelled", name: "Cancelled", count: bookingHistory.filter(b => b.status === "cancelled").length },
  ];

  const getStatusColor = (status) => {
    const colors = {
      completed: Colors.green,
      in_progress: Colors.orange,
      scheduled: Colors.blue,
      cancelled: Colors.red,
    };
    return colors[status] || Colors.grey;
  };

  const getStatusText = (status) => {
    const texts = {
      completed: "Completed",
      in_progress: "In Progress",
      scheduled: "Scheduled",
      cancelled: "Cancelled",
    };
    return texts[status] || status;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      plumbing: "pipe-wrench",
      electrical: "lightning-bolt",
      cleaning: "spray-bottle",
      security: "shield-check",
      maintenance: "tools",
    };
    return icons[category] || "cog";
  };

  const filteredBookings = selectedFilter === "all" 
    ? bookingHistory 
    : bookingHistory.filter(booking => booking.status === selectedFilter);

  const renderFilter = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === item.key && styles.filterButtonActive
      ]}
      onPress={() => setSelectedFilter(item.key)}
    >
      <Text style={[
        styles.filterText,
        selectedFilter === item.key && styles.filterTextActive
      ]}>
        {item.name} ({item.count})
      </Text>
    </TouchableOpacity>
  );

  const renderStars = (rating) => {
    if (!rating) return null;
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name={star <= rating ? "star" : "star-outline"}
            size={14}
            color={Colors.orange}
          />
        ))}
      </View>
    );
  };

  const renderBooking = ({ item }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.bookingLeft}>
          <View style={[styles.categoryIcon, { backgroundColor: getStatusColor(item.status) + "15" }]}>
            <MaterialCommunityIcons
              name={getCategoryIcon(item.category)}
              size={24}
              color={getStatusColor(item.status)}
            />
          </View>
          <View style={styles.bookingInfo}>
            <Text style={styles.serviceProvider}>{item.serviceProvider}</Text>
            <Text style={styles.serviceName}>{item.service}</Text>
            <Text style={styles.bookingDate}>{item.date} at {item.time}</Text>
          </View>
        </View>
        <View style={styles.bookingRight}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + "15" }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
              {getStatusText(item.status)}
            </Text>
          </View>
          <Text style={styles.amount}>{item.amount}</Text>
        </View>
      </View>

      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="map-marker" size={16} color={Colors.grey} />
          <Text style={styles.detailText}>{item.address}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="clock" size={16} color={Colors.grey} />
          <Text style={styles.detailText}>{item.duration}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="account" size={16} color={Colors.grey} />
          <Text style={styles.detailText}>{item.technician}</Text>
        </View>
      </View>

      <Text style={styles.description}>{item.description}</Text>

      {item.rating && (
        <View style={styles.ratingSection}>
          <Text style={styles.ratingLabel}>Your Rating:</Text>
          {renderStars(item.rating)}
        </View>
      )}

      <View style={styles.actionButtons}>
        {item.status === "completed" && !item.rating && (
          <TouchableOpacity style={[styles.actionButton, styles.rateButton]}>
            <MaterialCommunityIcons name="star" size={18} color={Colors.white} />
            <Text style={styles.actionButtonText}>Rate Service</Text>
          </TouchableOpacity>
        )}
        
        {item.status === "scheduled" && (
          <>
            <TouchableOpacity style={[styles.actionButton, styles.rescheduleButton]}>
              <MaterialCommunityIcons name="calendar-edit" size={18} color={Colors.white} />
              <Text style={styles.actionButtonText}>Reschedule</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
              <MaterialCommunityIcons name="close" size={18} color={Colors.white} />
              <Text style={styles.actionButtonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        )}
        
        {item.status === "completed" && (
          <TouchableOpacity style={[styles.actionButton, styles.rebookButton]}>
            <MaterialCommunityIcons name="repeat" size={18} color={Colors.white} />
            <Text style={styles.actionButtonText}>Book Again</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={[styles.actionButton, styles.contactButton]}>
          <MaterialCommunityIcons name="phone" size={18} color={Colors.white} />
          <Text style={styles.actionButtonText}>Contact</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.extraLightGrey }}>
      <MyStatusBar />
      <View
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          paddingVertical: Default.fixPadding * 1.2,
          paddingHorizontal: Default.fixPadding * 2,
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
          {tr("bookingHistory")}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <MaterialCommunityIcons
            name="history"
            size={50}
            color={Colors.primary}
          />
          <Text style={styles.title}>Booking History</Text>
          <Text style={styles.description}>
            Track all your service bookings and manage upcoming appointments.
          </Text>
        </View>

        <View style={styles.filtersSection}>
          <FlatList
            data={filters}
            renderItem={renderFilter}
            keyExtractor={(item) => item.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersList}
          />
        </View>

        <View style={styles.bookingsSection}>
          <Text style={styles.sectionTitle}>
            {filteredBookings.length} Booking{filteredBookings.length !== 1 ? 's' : ''}
          </Text>
          
          {filteredBookings.length > 0 ? (
            <FlatList
              data={filteredBookings}
              renderItem={renderBooking}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons
                name="calendar-blank"
                size={60}
                color={Colors.grey}
              />
              <Text style={styles.emptyStateText}>No bookings found</Text>
              <Text style={styles.emptyStateSubtext}>
                Your service bookings will appear here
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default BookingHistoryScreen;

const styles = StyleSheet.create({
  headerSection: {
    backgroundColor: Colors.white,
    padding: Default.fixPadding * 2,
    marginHorizontal: Default.fixPadding * 2,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
  },
  title: {
    ...Fonts.SemiBold18primary,
    marginTop: Default.fixPadding,
    marginBottom: Default.fixPadding * 0.5,
  },
  description: {
    ...Fonts.Medium14grey,
    textAlign: "center",
    lineHeight: 22,
  },
  filtersSection: {
    marginBottom: Default.fixPadding * 2,
  },
  filtersList: {
    paddingHorizontal: Default.fixPadding,
  },
  filterButton: {
    backgroundColor: Colors.white,
    paddingHorizontal: Default.fixPadding,
    paddingVertical: Default.fixPadding * 0.8,
    borderRadius: 20,
    marginHorizontal: Default.fixPadding * 0.5,
    ...Default.shadow,
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
  },
  filterText: {
    ...Fonts.Medium12grey,
  },
  filterTextActive: {
    ...Fonts.Medium12white,
  },
  bookingsSection: {
    paddingHorizontal: Default.fixPadding * 2,
  },
  sectionTitle: {
    ...Fonts.SemiBold16black,
    marginBottom: Default.fixPadding,
  },
  bookingCard: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: Default.fixPadding * 1.5,
    marginBottom: Default.fixPadding * 1.5,
    ...Default.shadow,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Default.fixPadding,
  },
  bookingLeft: {
    flexDirection: "row",
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: Default.fixPadding,
  },
  bookingInfo: {
    flex: 1,
  },
  serviceProvider: {
    ...Fonts.SemiBold14black,
    marginBottom: 2,
  },
  serviceName: {
    ...Fonts.Medium12primary,
    marginBottom: 2,
  },
  bookingDate: {
    ...Fonts.Medium12grey,
  },
  bookingRight: {
    alignItems: "flex-end",
  },
  statusBadge: {
    paddingHorizontal: Default.fixPadding * 0.8,
    paddingVertical: Default.fixPadding * 0.3,
    borderRadius: 12,
    marginBottom: Default.fixPadding * 0.5,
  },
  statusText: {
    ...Fonts.Medium12black,
  },
  amount: {
    ...Fonts.SemiBold14black,
  },
  bookingDetails: {
    marginBottom: Default.fixPadding,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Default.fixPadding * 0.3,
  },
  detailText: {
    ...Fonts.Medium12grey,
    marginLeft: Default.fixPadding * 0.5,
  },
  description: {
    ...Fonts.Medium12grey,
    lineHeight: 18,
    marginBottom: Default.fixPadding,
  },
  ratingSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Default.fixPadding,
  },
  ratingLabel: {
    ...Fonts.Medium12black,
    marginRight: Default.fixPadding * 0.5,
  },
  starsContainer: {
    flexDirection: "row",
  },
  actionButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Default.fixPadding * 0.6,
    paddingHorizontal: Default.fixPadding * 0.8,
    borderRadius: 6,
    marginRight: Default.fixPadding * 0.5,
    marginBottom: Default.fixPadding * 0.5,
    minWidth: 90,
  },
  rateButton: {
    backgroundColor: Colors.orange,
  },
  rescheduleButton: {
    backgroundColor: Colors.blue,
  },
  cancelButton: {
    backgroundColor: Colors.red,
  },
  rebookButton: {
    backgroundColor: Colors.green,
  },
  contactButton: {
    backgroundColor: Colors.primary,
  },
  actionButtonText: {
    ...Fonts.Medium10white,
    marginLeft: Default.fixPadding * 0.3,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Default.fixPadding * 4,
  },
  emptyStateText: {
    ...Fonts.SemiBold16grey,
    marginTop: Default.fixPadding,
  },
  emptyStateSubtext: {
    ...Fonts.Medium14grey,
    marginTop: Default.fixPadding * 0.5,
  },
});
