import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Alert,
  Platform
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Fonts, Default } from '../constants/styles';

const LocationPreview = ({ locationData, onPress, style }) => {
  if (!locationData) return null;

  const {
    latitude,
    longitude,
    address,
    mapPreviewUrl,
    googleMapsUrl,
    appleMapsUrl,
    accuracy,
    isLastKnown
  } = locationData;

  const handleLocationPress = async () => {
    if (onPress) {
      onPress(locationData);
      return;
    }

    // Default behavior: open in maps app
    try {
      const mapsUrl = Platform.OS === 'ios' ? appleMapsUrl : googleMapsUrl;
      const canOpen = await Linking.canOpenURL(mapsUrl);
      
      if (canOpen) {
        await Linking.openURL(mapsUrl);
      } else {
        // Fallback to Google Maps web
        await Linking.openURL(googleMapsUrl);
      }
    } catch (error) {
      console.error('Error opening maps:', error);
      Alert.alert('Error', 'Could not open maps application');
    }
  };

  const formatCoordinates = () => {
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  };

  const formatAccuracy = () => {
    if (!accuracy) return '';
    return `±${Math.round(accuracy)}m`;
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handleLocationPress}
      activeOpacity={0.8}
    >
      {/* Map Preview Image */}
      <View style={styles.mapContainer}>
        <Image
          source={{ uri: mapPreviewUrl }}
          style={styles.mapImage}
          resizeMode="cover"
        />
        
        {/* Map Overlay */}
        <View style={styles.mapOverlay}>
          <MaterialCommunityIcons
            name="map-marker"
            size={30}
            color={Colors.primary}
            style={styles.mapMarker}
          />
        </View>

        {/* Accuracy Badge */}
        {accuracy && (
          <View style={styles.accuracyBadge}>
            <Text style={styles.accuracyText}>
              {formatAccuracy()}
            </Text>
          </View>
        )}

        {/* Last Known Location Warning */}
        {isLastKnown && (
          <View style={styles.warningBadge}>
            <MaterialCommunityIcons
              name="alert-circle"
              size={14}
              color={Colors.white}
            />
            <Text style={styles.warningText}>Last Known</Text>
          </View>
        )}
      </View>

      {/* Location Info */}
      <View style={styles.infoContainer}>
        <View style={styles.addressContainer}>
          <MaterialCommunityIcons
            name="map-marker-outline"
            size={16}
            color={Colors.primary}
            style={styles.addressIcon}
          />
          <Text style={styles.addressText} numberOfLines={2}>
            {address || 'Unknown Address'}
          </Text>
        </View>

        <View style={styles.coordinatesContainer}>
          <MaterialCommunityIcons
            name="crosshairs-gps"
            size={14}
            color={Colors.grey}
            style={styles.coordinatesIcon}
          />
          <Text style={styles.coordinatesText}>
            {formatCoordinates()}
          </Text>
        </View>

        {/* Open Maps Button */}
        <View style={styles.actionContainer}>
          <MaterialCommunityIcons
            name="open-in-app"
            size={14}
            color={Colors.primary}
            style={styles.actionIcon}
          />
          <Text style={styles.actionText}>
            Tap to open in Maps
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    marginVertical: Default.fixPadding * 0.5,
    ...Default.shadow,
    elevation: 3,
  },
  mapContainer: {
    height: 150,
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.extraLightGrey,
  },
  mapOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapMarker: {
    textShadowColor: Colors.white,
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  accuracyBadge: {
    position: 'absolute',
    top: Default.fixPadding,
    right: Default.fixPadding,
    backgroundColor: Colors.primary + 'DD',
    paddingHorizontal: Default.fixPadding * 0.8,
    paddingVertical: Default.fixPadding * 0.4,
    borderRadius: 12,
  },
  accuracyText: {
    ...Fonts.SemiBold10white,
    fontSize: 10,
  },
  warningBadge: {
    position: 'absolute',
    top: Default.fixPadding,
    left: Default.fixPadding,
    backgroundColor: Colors.orange + 'DD',
    paddingHorizontal: Default.fixPadding * 0.6,
    paddingVertical: Default.fixPadding * 0.3,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  warningText: {
    ...Fonts.SemiBold10white,
    fontSize: 9,
    marginLeft: Default.fixPadding * 0.3,
  },
  infoContainer: {
    padding: Default.fixPadding * 1.2,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Default.fixPadding * 0.8,
  },
  addressIcon: {
    marginRight: Default.fixPadding * 0.6,
    marginTop: 2,
  },
  addressText: {
    ...Fonts.Medium14black,
    flex: 1,
    lineHeight: 18,
  },
  coordinatesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Default.fixPadding * 0.8,
  },
  coordinatesIcon: {
    marginRight: Default.fixPadding * 0.6,
  },
  coordinatesText: {
    ...Fonts.Medium12grey,
    flex: 1,
  },
  actionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Default.fixPadding * 0.8,
    borderTopWidth: 1,
    borderTopColor: Colors.extraLightGrey,
  },
  actionIcon: {
    marginRight: Default.fixPadding * 0.5,
  },
  actionText: {
    ...Fonts.SemiBold12primary,
  },
});

export default LocationPreview;
