import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  RefreshControl,
} from "react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MyStatusBar from "../components/myStatusBar";

const ServiceProvidersScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`settingScreen:${key}`);
  }

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [refreshing, setRefreshing] = useState(false);

  const [serviceProviders] = useState([
    {
      id: "1",
      name: "GoldKey Plumbing Services",
      category: "plumbing",
      rating: 4.8,
      phone: "+233 24 123 4567",
      email: "info@goldkeyplumbing.com",
      services: ["Pipe Repair", "Drain Cleaning", "Water Heater"],
      availability: "24/7",
      verified: true,
      responseTime: "30 mins",
    },
    {
      id: "2",
      name: "ElectroFix Solutions",
      category: "electrical",
      rating: 4.6,
      phone: "+233 24 987 6543",
      email: "contact@electrofix.com",
      services: ["Wiring", "Light Installation", "Power Issues"],
      availability: "Mon-Sat 8AM-6PM",
      verified: true,
      responseTime: "45 mins",
    },
    {
      id: "3",
      name: "CleanPro Housekeeping",
      category: "cleaning",
      rating: 4.9,
      phone: "+233 24 555 0123",
      email: "book@cleanpro.com",
      services: ["Deep Cleaning", "Regular Cleaning", "Carpet Cleaning"],
      availability: "Daily 7AM-7PM",
      verified: true,
      responseTime: "2 hours",
    },
    {
      id: "4",
      name: "SecureHome Security",
      category: "security",
      rating: 4.7,
      phone: "+233 24 777 8888",
      email: "security@securehome.com",
      services: ["CCTV Installation", "Alarm Systems", "Security Audit"],
      availability: "24/7",
      verified: true,
      responseTime: "1 hour",
    },
    {
      id: "5",
      name: "GreenThumb Landscaping",
      category: "gardening",
      rating: 4.5,
      phone: "+233 24 333 2222",
      email: "gardens@greenthumb.com",
      services: ["Lawn Care", "Plant Installation", "Garden Design"],
      availability: "Mon-Fri 7AM-5PM",
      verified: false,
      responseTime: "4 hours",
    },
  ]);

  const categories = [
    { key: "all", name: "All", icon: "view-grid" },
    { key: "plumbing", name: "Plumbing", icon: "pipe-wrench" },
    { key: "electrical", name: "Electrical", icon: "lightning-bolt" },
    { key: "cleaning", name: "Cleaning", icon: "spray-bottle" },
    { key: "security", name: "Security", icon: "shield-check" },
    { key: "gardening", name: "Gardening", icon: "flower" },
  ];

  const getCategoryColor = (category) => {
    const colors = {
      plumbing: Colors.blue,
      electrical: Colors.orange,
      cleaning: Colors.green,
      security: Colors.red,
      gardening: Colors.purple,
    };
    return colors[category] || Colors.primary;
  };

  const filteredProviders = serviceProviders.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.services.some(service => service.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || provider.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Simulate API call to refresh service providers data
      await new Promise(resolve => setTimeout(resolve, 1500));
      // In a real app, you would fetch fresh data from your API here
      console.log('Service providers data refreshed');
    } catch (error) {
      console.log('Refresh error:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleContactProvider = (provider, method) => {
    if (method === "call") {
      Alert.alert(
        "Call Service Provider",
        `Do you want to call ${provider.name}?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Call", onPress: () => console.log(`Calling ${provider.phone}`) },
        ]
      );
    } else if (method === "email") {
      Alert.alert("Email", `Email: ${provider.email}`);
    } else if (method === "book") {
      Alert.alert("Book Service", `Booking ${provider.name} - Feature coming soon!`);
    }
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.key && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(item.key)}
    >
      <MaterialCommunityIcons
        name={item.icon}
        size={20}
        color={selectedCategory === item.key ? Colors.white : Colors.grey}
      />
      <Text style={[
        styles.categoryText,
        selectedCategory === item.key && styles.categoryTextActive
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderServiceProvider = ({ item }) => (
    <View style={styles.providerCard}>
      <View style={styles.providerHeader}>
        <View style={styles.providerInfo}>
          <View style={styles.providerNameRow}>
            <Text style={styles.providerName}>{item.name}</Text>
            {item.verified && (
              <MaterialCommunityIcons
                name="check-decagram"
                size={20}
                color={Colors.green}
              />
            )}
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color={Colors.orange} />
            <Text style={styles.rating}>{item.rating}</Text>
            <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) + "15" }]}>
              <Text style={[styles.categoryBadgeText, { color: getCategoryColor(item.category) }]}>
                {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.servicesSection}>
        <Text style={styles.servicesTitle}>Services:</Text>
        <View style={styles.servicesRow}>
          {item.services.map((service, index) => (
            <View key={index} style={styles.serviceTag}>
              <Text style={styles.serviceTagText}>{service}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.providerDetails}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="clock" size={16} color={Colors.grey} />
          <Text style={styles.detailText}>{item.availability}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="timer" size={16} color={Colors.grey} />
          <Text style={styles.detailText}>Response: {item.responseTime}</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionButton, styles.callButton]}
          onPress={() => handleContactProvider(item, "call")}
        >
          <Ionicons name="call" size={18} color={Colors.white} />
          <Text style={styles.actionButtonText}>Call</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.emailButton]}
          onPress={() => handleContactProvider(item, "email")}
        >
          <MaterialCommunityIcons name="email" size={18} color={Colors.white} />
          <Text style={styles.actionButtonText}>Email</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, styles.bookButton]}
          onPress={() => handleContactProvider(item, "book")}
        >
          <MaterialCommunityIcons name="calendar-check" size={18} color={Colors.white} />
          <Text style={styles.actionButtonText}>Book</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.regularGrey }}>
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
          {tr("serviceProviders")}
        </Text>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
      >
        <View style={styles.headerSection}>
          <MaterialCommunityIcons
            name="account-hard-hat"
            size={50}
            color={Colors.primary}
          />
          <Text style={styles.title}>Service Providers</Text>
          <Text style={styles.description}>
            Find trusted service providers for all your home maintenance needs.
          </Text>
        </View>

        <View style={styles.searchSection}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color={Colors.grey} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search services or providers..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.grey}
            />
          </View>
        </View>

        <View style={styles.categoriesSection}>
          <FlatList
            data={categories}
            renderItem={renderCategory}
            keyExtractor={(item) => item.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        <View style={styles.providersSection}>
          <Text style={styles.sectionTitle}>
            {filteredProviders.length} Provider{filteredProviders.length !== 1 ? 's' : ''} Found
          </Text>
          <FlatList
            data={filteredProviders}
            renderItem={renderServiceProvider}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </ScrollView>
    </View>
  );
};

export default ServiceProvidersScreen;

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
  searchSection: {
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
  },
  searchBox: {
    backgroundColor: Colors.white,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Default.fixPadding,
    borderRadius: 10,
    ...Default.shadow,
  },
  searchInput: {
    flex: 1,
    ...Fonts.Medium14black,
    paddingVertical: Default.fixPadding,
    marginLeft: Default.fixPadding * 0.5,
  },
  categoriesSection: {
    marginBottom: Default.fixPadding * 2,
    paddingBottom: Default.fixPadding * 0.3,
  },
  categoriesList: {
    paddingHorizontal: Default.fixPadding,
    paddingVertical: Default.fixPadding * 0.5,
  },
  categoryButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.white,
    paddingHorizontal: Default.fixPadding * 1.2,
    paddingVertical: Default.fixPadding,
    borderRadius: 20,
    marginHorizontal: Default.fixPadding * 0.7,
    marginVertical: Default.fixPadding * 0.3,
    ...Default.shadow,
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
  },
  categoryText: {
    ...Fonts.Medium12grey,
    marginLeft: Default.fixPadding * 0.5,
  },
  categoryTextActive: {
    ...Fonts.Medium12white,
    color: Colors.white,
  },
  providersSection: {
    paddingHorizontal: Default.fixPadding * 2,
    marginTop: Default.fixPadding * 0.2,
    paddingBottom: Default.fixPadding * 3,
  },
  sectionTitle: {
    ...Fonts.SemiBold16black,
    marginBottom: Default.fixPadding,
  },
  providerCard: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: Default.fixPadding * 1.5,
    marginBottom: Default.fixPadding * 1.5,
    ...Default.shadow,
  },
  providerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Default.fixPadding,
  },
  providerInfo: {
    flex: 1,
  },
  providerNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Default.fixPadding * 0.5,
  },
  providerName: {
    ...Fonts.SemiBold16black,
    flex: 1,
    marginRight: Default.fixPadding * 0.5,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    ...Fonts.Medium14black,
    marginLeft: Default.fixPadding * 0.3,
    marginRight: Default.fixPadding,
  },
  categoryBadge: {
    paddingHorizontal: Default.fixPadding * 0.8,
    paddingVertical: Default.fixPadding * 0.3,
    borderRadius: 12,
  },
  categoryBadgeText: {
    ...Fonts.Medium12black,
  },
  servicesSection: {
    marginBottom: Default.fixPadding,
  },
  servicesTitle: {
    ...Fonts.Medium14black,
    marginBottom: Default.fixPadding * 0.5,
  },
  servicesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  serviceTag: {
    backgroundColor: Colors.extraLightGrey,
    paddingHorizontal: Default.fixPadding * 0.8,
    paddingVertical: Default.fixPadding * 0.3,
    borderRadius: 8,
    marginRight: Default.fixPadding * 0.5,
    marginBottom: Default.fixPadding * 0.5,
  },
  serviceTagText: {
    ...Fonts.Medium12grey,
  },
  providerDetails: {
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
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Default.fixPadding * 0.8,
    paddingHorizontal: Default.fixPadding * 0.5,
    borderRadius: 8,
    marginHorizontal: Default.fixPadding * 0.3,
    minHeight: 40,
  },
  callButton: {
    backgroundColor: Colors.green,
  },
  emailButton: {
    backgroundColor: Colors.blue,
  },
  bookButton: {
    backgroundColor: Colors.primary,
  },
  actionButtonText: {
    ...Fonts.Medium12white,
    color: Colors.white,
    marginLeft: Default.fixPadding * 0.3,
  },
});
