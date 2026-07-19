import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MyStatusBar from '../components/myStatusBar';
import { Colors, Fonts, Default } from '../constants/styles';

const MaintenanceRequestDetailScreen = ({ route, navigation }) => {
  const { request } = route.params;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <MyStatusBar />
      <View style={styles.redBar} />
      {/* Header Row */}
      <View style={styles.headerRow}>
        <TouchableOpacity
          style={styles.headerBackBtn}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={25} color={Colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitleText}>Request Details</Text>
      </View>
      <View style={styles.detailCard}>
        <Text style={Fonts.SemiBold18black}>{request.title}</Text>
        <Text style={styles.label}>Description:</Text>
        <Text style={styles.value}>{request.description || request.other}</Text>
        <Text style={styles.label}>Date & Time:</Text>
        <Text style={styles.value}>{request.dateTime}</Text>
        <Text style={styles.label}>Status:</Text>
        <Text style={[styles.value, { color: request.resolved ? Colors.green : Colors.red }]}> {request.resolved ? 'Resolved' : 'Pending'} </Text>
        <Text style={styles.label}>Priority:</Text>
        <Text style={styles.value}>{request.priority || 'Medium'}</Text>
        <Text style={styles.label}>{request.resolved ? 'Resolved by:' : 'Raised by:'}</Text>
        <Text style={styles.value}>{request.name}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  redBar: {
    backgroundColor: Colors.primary,
    height: 0.1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Default.fixPadding * 2,
    paddingTop: Default.fixPadding * 1.2,
    paddingBottom: Default.fixPadding * 0.8,
    backgroundColor: Colors.white,
  },
  headerBackBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  headerTitleText: {
    ...Fonts.SemiBold18black,
    letterSpacing: 0.2,
    color: Colors.black,
    marginLeft: 1,
    marginBottom: 2,
  },
  detailCard: {
    backgroundColor: Colors.white,
    borderRadius: 10,
    padding: Default.fixPadding * 2,
    margin: Default.fixPadding * 2,
    ...Default.shadow,
    borderWidth: 1,
    borderColor: Colors.lightGrey,
  },
  label: {
    ...Fonts.Medium14grey,
    marginTop: Default.fixPadding * 1.2,
  },
  value: {
    ...Fonts.Medium14black,
    marginTop: 2,
  },
});

export default MaintenanceRequestDetailScreen;
