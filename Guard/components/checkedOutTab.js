import React from 'react';
import {
  Text,
  View,
  Image,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Colors, Default, Fonts } from '../constants/styles';
import { useTranslation } from 'react-i18next';
import { useFocusEffect } from '@react-navigation/native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { ms } from 'react-native-size-matters/extend';
import { useVisitorPasses } from '../hooks/useVisitorPasses';
import { mapPassToInOutItem } from '../services/inOutPassMapper';

const CheckedOutTab = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { passes, loading, error, fetchPasses } = useVisitorPasses('checked_out');
  const isRtl = i18n.dir() === 'rtl';

  useFocusEffect(
    React.useCallback(() => {
      fetchPasses();
    }, [fetchPasses])
  );

  function tr(key) {
    return t(`checkedOutTab:${key}`);
  }

  const label = (key, fallback) => {
    const value = tr(key);
    return value === `checkedOutTab:${key}` ? fallback : value;
  };

  const mappedPasses = (passes || []).map((pass) => mapPassToInOutItem(pass, 'checked_out'));

  const renderItem = ({ item }) => {
    const visitorPayload = {
      image: item.image,
      name: item.name,
      phoneNumber: item.phoneNumber,
      block: item.block,
      other1: item.other1,
      other2: item.other2,
      hostName: item.hostName,
      hostPhone: item.hostPhone,
      flatNo: item.flatNo,
      entryTime: item.entryTime,
      exitTime: item.exitTime,
      status: item.status,
      vehicleNumber: item.vehicleNumber,
      company: item.company,
      notes: item.notes,
      serviceType: item.serviceType,
      purpose: item.purpose,
      passId: item.passId,
      originalPass: item.originalPass,
    };

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('visitorDetailScreen', { visitor: visitorPayload })}
        style={{
          flexDirection: isRtl ? 'row-reverse' : 'row',
          ...styles.mainView,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: isRtl ? 'row-reverse' : 'row',
            alignItems: 'center',
          }}
        >
          <View style={styles.imageView}>
            <Image source={item.image} style={{ width: 45, height: 45, resizeMode: 'contain' }} />
          </View>

          <View
            style={{
              flex: 1,
              alignItems: isRtl ? 'flex-end' : 'flex-start',
              marginHorizontal: Default.fixPadding,
            }}
          >
            <Text numberOfLines={1} style={{ ...Fonts.SemiBold16black, overflow: 'hidden' }}>
              {item.name}
            </Text>

            <Text numberOfLines={1} style={{ ...Fonts.Medium14grey, overflow: 'hidden' }}>
              {`${tr('block')} ${item.block} | ${item.other1} | ${item.other2}`}
            </Text>
            <View
              style={{
                flexDirection: isRtl ? 'row-reverse' : 'row',
                alignItems: 'center',
              }}
            >
              <MaterialIcons name="call" size={15} color={Colors.lightBlue} />
              <Text
                numberOfLines={1}
                style={{
                  ...Fonts.Medium14black,
                  overflow: 'hidden',
                  marginHorizontal: Default.fixPadding * 0.2,
                }}
              >
                {item.phoneNumber}
              </Text>
            </View>
          </View>
        </View>

        <View style={{ alignItems: isRtl ? 'flex-start' : 'flex-end' }}>
          <View style={styles.outView}>
            <Text numberOfLines={1} style={{ ...Fonts.Medium14white, overflow: 'hidden' }}>
              {tr('out')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.stateContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={{ ...Fonts.Medium16black, marginTop: Default.fixPadding }}>
          {label('loading', 'Loading...')}
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.stateContainer}>
        <MaterialIcons name="error-outline" size={48} color={Colors.grey} />
        <Text style={{ ...Fonts.Medium16black, color: Colors.red, textAlign: 'center', marginTop: Default.fixPadding }}>
          {error}
        </Text>
      </View>
    );
  }

  if (mappedPasses.length === 0) {
    return (
      <View style={styles.stateContainer}>
        <MaterialIcons name="people-outline" size={48} color={Colors.grey} />
        <Text style={{ ...Fonts.Medium16black, textAlign: 'center', marginTop: Default.fixPadding }}>
          {label('noVisitorsOutside', 'No checked-out visitors yet')}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <FlatList
        data={mappedPasses}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: Default.fixPadding * 2 }}
      />
    </View>
  );
};

export default CheckedOutTab;

const styles = StyleSheet.create({
  mainView: {
    flex: 1,
    alignItems: 'center',
    padding: Default.fixPadding * 0.8,
    marginBottom: Default.fixPadding * 2,
    marginHorizontal: Default.fixPadding * 2,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  imageView: {
    justifyContent: 'center',
    alignItems: 'center',
    width: ms(58),
    height: ms(58),
    borderRadius: 5,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
  outView: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Default.fixPadding * 0.7,
    paddingHorizontal: Default.fixPadding,
    width: ms(60),
    borderRadius: 5,
    backgroundColor: Colors.red,
  },
  stateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Default.fixPadding * 2,
  },
});
