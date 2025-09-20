import * as Location from 'expo-location';
import * as Linking from 'expo-linking';
import { Alert } from 'react-native';

// Emergency Location Service
export class EmergencyLocationService {
  
  // Request location permissions
  static async requestLocationPermission() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Emergency alerts need location access to help responders find you quickly. Please enable location permissions.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Settings', onPress: () => Linking.openSettings() }
          ]
        );
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  // Get current location for emergency
  static async getCurrentLocation() {
    try {
      console.log('🗺️ Getting current location for emergency...');
      
      // Check if location services are enabled
      const isEnabled = await Location.hasServicesEnabledAsync();
      if (!isEnabled) {
        throw new Error('Location services are disabled');
      }

      // Get current position with high accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeout: 10000, // 10 seconds timeout
      });

      console.log('🗺️ Location obtained:', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      
      // Try to get last known location as fallback
      try {
        console.log('🗺️ Trying last known location as fallback...');
        const lastLocation = await Location.getLastKnownPositionAsync();
        
        if (lastLocation) {
          console.log('🗺️ Using last known location:', {
            latitude: lastLocation.coords.latitude,
            longitude: lastLocation.coords.longitude
          });
          
          return {
            latitude: lastLocation.coords.latitude,
            longitude: lastLocation.coords.longitude,
            accuracy: lastLocation.coords.accuracy,
            timestamp: lastLocation.timestamp,
            isLastKnown: true
          };
        }
      } catch (fallbackError) {
        console.error('Error getting last known location:', fallbackError);
      }
      
      throw error;
    }
  }

  // Generate Google Maps Static API URL for map preview
  static generateMapPreviewUrl(latitude, longitude, options = {}) {
    const {
      zoom = 16,
      size = '400x300',
      maptype = 'roadmap',
      markers = true
    } = options;

    const baseUrl = 'https://maps.googleapis.com/maps/api/staticmap';
    const params = new URLSearchParams({
      center: `${latitude},${longitude}`,
      zoom: zoom.toString(),
      size: size,
      maptype: maptype,
      format: 'png',
      scale: '2', // High DPI for better quality
    });

    // Add marker for emergency location
    if (markers) {
      params.append('markers', `color:red|size:large|${latitude},${longitude}`);
    }

    // Note: In production, you would add your Google Maps API key here
    // params.append('key', 'YOUR_GOOGLE_MAPS_API_KEY');

    return `${baseUrl}?${params.toString()}`;
  }

  // Generate Google Maps URL for opening in maps app
  static generateMapsAppUrl(latitude, longitude, label = 'Emergency Location') {
    // Create a universal maps URL that works on both iOS and Android
    const encodedLabel = encodeURIComponent(label);
    return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}&query_place_id=${encodedLabel}`;
  }

  // Generate Apple Maps URL (for iOS)
  static generateAppleMapsUrl(latitude, longitude, label = 'Emergency Location') {
    const encodedLabel = encodeURIComponent(label);
    return `http://maps.apple.com/?q=${encodedLabel}&ll=${latitude},${longitude}&z=16`;
  }

  // Get formatted address from coordinates (reverse geocoding)
  static async getAddressFromCoordinates(latitude, longitude) {
    try {
      console.log('🗺️ Getting address from coordinates...');
      
      const addresses = await Location.reverseGeocodeAsync({
        latitude,
        longitude
      });

      if (addresses && addresses.length > 0) {
        const address = addresses[0];
        const formattedAddress = [
          address.name,
          address.street,
          address.city,
          address.region,
          address.postalCode,
          address.country
        ].filter(Boolean).join(', ');

        console.log('🗺️ Address found:', formattedAddress);
        return formattedAddress;
      }
    } catch (error) {
      console.error('Error getting address:', error);
    }
    
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }

  // Create location attachment data for emergency messages
  static async createLocationAttachment(latitude, longitude) {
    try {
      const address = await this.getAddressFromCoordinates(latitude, longitude);
      const mapPreviewUrl = this.generateMapPreviewUrl(latitude, longitude);
      const googleMapsUrl = this.generateMapsAppUrl(latitude, longitude, 'Emergency Location');
      const appleMapsUrl = this.generateAppleMapsUrl(latitude, longitude, 'Emergency Location');

      return {
        type: 'location',
        latitude,
        longitude,
        address,
        mapPreviewUrl,
        googleMapsUrl,
        appleMapsUrl,
        accuracy: null, // Will be set by caller
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Error creating location attachment:', error);
      throw error;
    }
  }

  // Format location message for emergency alerts
  static formatLocationMessage(locationData, emergencyType) {
    const { latitude, longitude, address, accuracy, isLastKnown } = locationData;
    
    let locationText = `📍 EMERGENCY LOCATION:\n${address}\n`;
    locationText += `Coordinates: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}\n`;
    
    if (accuracy) {
      locationText += `Accuracy: ±${Math.round(accuracy)}m\n`;
    }
    
    if (isLastKnown) {
      locationText += `⚠️ Note: This is the last known location\n`;
    }
    
    locationText += `\n🗺️ View on Maps: Click the map preview below`;
    
    return locationText;
  }

  // Main function to get emergency location data
  static async getEmergencyLocationData() {
    try {
      // Request permission first
      const hasPermission = await this.requestLocationPermission();
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }

      // Get current location
      const locationData = await this.getCurrentLocation();
      
      // Create location attachment
      const locationAttachment = await this.createLocationAttachment(
        locationData.latitude,
        locationData.longitude
      );
      
      // Add accuracy info
      locationAttachment.accuracy = locationData.accuracy;
      locationAttachment.isLastKnown = locationData.isLastKnown || false;

      return {
        locationData,
        locationAttachment,
        locationMessage: this.formatLocationMessage(locationData)
      };
    } catch (error) {
      console.error('Error getting emergency location data:', error);
      throw error;
    }
  }
}

export default EmergencyLocationService;
