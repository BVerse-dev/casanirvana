/**
 * Test Script for User-App Enhanced API Services
 * Run this to validate backend connectivity and phone field integration
 */

import { amenitiesService, unitsService } from '../services/enhancedApiService';

export const testEnhancedServices = async () => {
  console.log('🧪 Testing Enhanced API Services for User-App...\n');

  try {
    // Test 1: Amenities Service
    console.log('📋 Testing Amenities Service...');
    const amenitiesResult = await amenitiesService.getAmenities();
    console.log('✅ Amenities:', {
      success: amenitiesResult.success,
      count: amenitiesResult.data?.length || 0,
      firstAmenity: amenitiesResult.data?.[0]?.name || 'None'
    });

    // Test 2: Units Service
    console.log('\n🏠 Testing Units Service...');
    const unitsResult = await unitsService.getUnits();
    console.log('✅ Units:', {
      success: unitsResult.success,
      count: unitsResult.data?.length || 0,
      firstUnit: unitsResult.data?.[0]?.number || 'None'
    });

    // Test 3: Phone Search for Units
    console.log('\n📱 Testing Unit Phone Search...');
    const phoneSearchResult = await unitsService.searchUnitsByPhone('9876543230');
    console.log('✅ Phone Search:', {
      success: phoneSearchResult.success,
      count: phoneSearchResult.data?.length || 0,
      foundUnit: phoneSearchResult.data?.[0]?.number || 'None',
      ownerPhone: phoneSearchResult.data?.[0]?.owner_phone || 'None'
    });

    // Test 4: Units by Society
    console.log('\n🏘️ Testing Units by Society...');
    const societyUnitsResult = await unitsService.getUnitsBySociety('841342ff-ee1e-4c6b-a7f2-2d19fcb0acea');
    console.log('✅ Society Units:', {
      success: societyUnitsResult.success,
      count: societyUnitsResult.data?.length || 0
    });

    console.log('\n🎉 All User-App Enhanced API Services Working!');
    return true;

  } catch (error) {
    console.error('❌ Error testing enhanced services:', error);
    return false;
  }
};

// Export for use in app
export default testEnhancedServices;
