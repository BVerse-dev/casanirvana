import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, FlatList, Alert, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MyStatusBar from '../components/myStatusBar';
import { Colors, Default, Fonts } from '../constants/styles';

const EmergencyContactsScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === 'rtl';
  function tr(key) {
    return t(`settingScreen:${key}`);
  }

  const [emergencyContacts] = useState([
    { id: '1', name: 'Police Emergency', number: '999', type: 'police', icon: 'shield-check', color: Colors.blue, isOfficial: true },
    { id: '2', name: 'Fire Department', number: '998', type: 'fire', icon: 'fire', color: Colors.red, isOfficial: true },
    { id: '3', name: 'Medical Emergency', number: '997', type: 'medical', icon: 'medical-bag', color: Colors.green, isOfficial: true },
    { id: '4', name: 'Society Security', number: '+233 24 123 4567', type: 'security', icon: 'security', color: Colors.primary, isOfficial: false },
    { id: '5', name: 'Property Manager', number: '+233 24 987 6543', type: 'management', icon: 'account-tie', color: Colors.orange, isOfficial: false },
    { id: '6', name: 'Maintenance Team', number: '+233 24 555 0123', type: 'maintenance', icon: 'tools', color: Colors.purple, isOfficial: false },
  ]);

  const handleCallContact = (contact) => {
    Alert.alert(
      'Call Emergency Contact',
      `Do you want to call ${contact.name} at ${contact.number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => Linking.openURL(`tel:${contact.number}`) },
      ]
    );
  };

  const renderEmergencyContact = ({ item }) => (
    <TouchableOpacity style={styles.contactCard} onPress={() => handleCallContact(item)}>
      <View style={styles.contactLeft}>
        <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
          <MaterialCommunityIcons name={item.icon} size={28} color={item.color} />
        </View>
        <View style={styles.contactInfo}>
          <Text style={styles.contactName}>{item.name}</Text>
          <Text style={styles.contactNumber}>{item.number}</Text>
          {item.isOfficial && <Text style={styles.officialBadge}>Emergency Service</Text>}
        </View>
      </View>
      <View style={styles.contactRight}>
        <TouchableOpacity style={[styles.callButton, { backgroundColor: item.color }]} onPress={() => handleCallContact(item)}>
          <Ionicons name="call" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: Colors.extraLightGrey }}>
      <MyStatusBar />
      <View style={{
        flexDirection: isRtl ? 'row-reverse' : 'row',
        alignItems: 'center',
        paddingVertical: Default.fixPadding * 1.2,
        paddingHorizontal: Default.fixPadding * 2,
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name={isRtl ? 'arrow-forward-outline' : 'arrow-back-outline'} size={25} color={Colors.black} />
        </TouchableOpacity>
        <Text style={{ ...Fonts.SemiBold18black, marginHorizontal: Default.fixPadding }}>
          {tr('emergencyContacts')}
        </Text>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: Default.fixPadding }}>
        <View style={styles.headerSection}>
          <MaterialCommunityIcons name="phone-alert" size={50} color={Colors.red} />
          <Text style={styles.title}>Emergency Contacts</Text>
          <Text style={styles.description}>
            Quick access to emergency services and important contacts for your safety and security.
          </Text>
        </View>

        <View style={styles.warningBanner}>
          <MaterialCommunityIcons name="alert-circle" size={24} color={Colors.red} />
          <Text style={styles.warningText}>
            For immediate emergencies, call the national emergency numbers directly.
          </Text>
        </View>

        <FlatList
          data={emergencyContacts}
          renderItem={renderEmergencyContact}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: Default.fixPadding * 2 }}
        />

        <View style={styles.addContactSection}>
          <TouchableOpacity
            style={styles.addContactButton}
            onPress={() => Alert.alert('Add Contact', 'Feature coming soon - Add custom emergency contacts')}
          >
            <MaterialCommunityIcons name="plus-circle" size={24} color={Colors.primary} />
            <Text style={styles.addContactText}>Add Custom Emergency Contact</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Emergency Guidelines:</Text>
          <View style={styles.guidelineItem}>
            <Ionicons name="alert-circle" size={16} color={Colors.red} />
            <Text style={styles.guidelineText}>Stay calm and speak clearly</Text>
          </View>
          <View style={styles.guidelineItem}>
            <Ionicons name="location" size={16} color={Colors.red} />
            <Text style={styles.guidelineText}>Provide your exact location</Text>
          </View>
          <View style={styles.guidelineItem}>
            <Ionicons name="information-circle" size={16} color={Colors.red} />
            <Text style={styles.guidelineText}>Describe the emergency clearly</Text>
          </View>
          <View style={styles.guidelineItem}>
            <Ionicons name="time" size={16} color={Colors.red} />
            <Text style={styles.guidelineText}>Stay on the line until help arrives</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default EmergencyContactsScreen;

const styles = StyleSheet.create({
  headerSection: {
    backgroundColor: Colors.white,
    padding: Default.fixPadding * 2,
    marginHorizontal: Default.fixPadding * 2,
    borderRadius: 10,
    alignItems: 'center',
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
    textAlign: 'center',
    lineHeight: 22,
  },
  warningBanner: {
    backgroundColor: Colors.red + '10',
    marginHorizontal: Default.fixPadding * 2,
    padding: Default.fixPadding * 1.5,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Default.fixPadding * 2,
    borderLeftWidth: 4,
    borderLeftColor: Colors.red,
  },
  warningText: {
    ...Fonts.Medium14red,
    marginLeft: Default.fixPadding,
    flex: 1,
  },
  contactCard: {
    backgroundColor: Colors.white,
    padding: Default.fixPadding * 1.5,
    borderRadius: 10,
    marginBottom: Default.fixPadding * 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Default.shadow,
  },
  contactLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Default.fixPadding,
  },
  contactInfo: { flex: 1 },
  contactName: { ...Fonts.SemiBold16black, marginBottom: 2 },
  contactNumber: { ...Fonts.Medium14primary, marginBottom: 2 },
  officialBadge: {
    ...Fonts.Medium12grey,
    backgroundColor: Colors.green + '15',
    color: Colors.green,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  contactRight: { alignItems: 'center' },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addContactSection: {
    marginHorizontal: Default.fixPadding * 2,
    marginVertical: Default.fixPadding,
  },
  addContactButton: {
    backgroundColor: Colors.white,
    padding: Default.fixPadding * 1.5,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  addContactText: { ...Fonts.Medium14primary, marginLeft: Default.fixPadding * 0.5 },
  infoSection: {
    backgroundColor: Colors.white,
    margin: Default.fixPadding * 2,
    padding: Default.fixPadding * 2,
    borderRadius: 10,
    ...Default.shadow,
  },
  infoTitle: { ...Fonts.SemiBold16black, marginBottom: Default.fixPadding },
  guidelineItem: { flexDirection: 'row', alignItems: 'center', marginBottom: Default.fixPadding * 0.5 },
  guidelineText: { ...Fonts.Medium14grey, marginLeft: Default.fixPadding * 0.5, flex: 1 },
});
