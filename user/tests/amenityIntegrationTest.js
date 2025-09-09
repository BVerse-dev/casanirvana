// Test script to verify amenity booking integration
import { amenityService } from '../services/amenityService';

const testAmenityIntegration = async () => {
  console.log('Testing Amenity Integration...');
  
  try {
    // Test 1: Get all amenities
    console.log('1. Testing getAmenities...');
    const amenitiesResponse = await amenityService.getAmenities();
    console.log('Amenities result:', amenitiesResponse);
    
    if (amenitiesResponse.success && amenitiesResponse.data) {
      console.log(`✅ Found ${amenitiesResponse.data.length} amenities`);
      
      // Test 2: Get amenity bookings for a test user
      console.log('2. Testing getAmenityBookings...');
      const testUserId = 'test-user-id'; // Replace with actual user ID
      const bookingsResponse = await amenityService.getAmenityBookings(testUserId);
      console.log('Bookings result:', bookingsResponse);
      
      if (bookingsResponse.success) {
        console.log(`✅ Found ${bookingsResponse.data?.length || 0} bookings for user`);
      } else {
        console.log('❌ Failed to get bookings:', bookingsResponse.error);
      }
      
    } else {
      console.log('❌ Failed to get amenities:', amenitiesResponse.error);
    }
    
  } catch (error) {
    console.error('❌ Integration test failed:', error);
  }
};

// Export for testing
export { testAmenityIntegration };
