import { guardAuthUtils } from '../utils/guardAuth';

export const testGuardAuth = {
  /**
   * Test basic authentication functions
   */
  runBasicTests: async () => {
    console.log('🧪 Running Guard Authentication Tests...\n');
    
    try {
      // Test 1: Check authentication status
      console.log('Test 1: Checking authentication status...');
      const isAuth = await guardAuthUtils.isAuthenticatedGuard();
      console.log(`✓ Authentication status: ${isAuth ? 'Authenticated' : 'Not authenticated'}\n`);

      // Test 2: Get current profile
      console.log('Test 2: Getting guard profile...');
      const profile = await guardAuthUtils.getGuardProfile();
      if (profile) {
        console.log('✓ Profile retrieved:');
        console.log(`  - User ID: ${profile.user?.id}`);
        console.log(`  - Email: ${profile.user?.email}`);
        console.log(`  - Name: ${profile.user?.first_name} ${profile.user?.last_name}`);
        console.log(`  - Role: ${profile.user?.role}`);
        if (profile.guard) {
          console.log(`  - Employee ID: ${profile.guard.employee_id}`);
          console.log(`  - Shift Type: ${profile.guard.shift_type}`);
          console.log(`  - Society ID: ${profile.guard.community_id}`);
          console.log(`  - Status: ${profile.guard.status}`);
        }
      } else {
        console.log('ℹ️ No profile found (not signed in)');
      }
      console.log('');

      // Test 3: Get assigned society
      console.log('Test 3: Getting assigned society...');
      const societyId = await guardAuthUtils.getAssignedSocietyId();
      console.log(`✓ Assigned Society ID: ${societyId || 'None'}\n`);

      console.log('🎉 All tests completed successfully!');
      return true;
    } catch (error) {
      console.error('❌ Test failed:', error);
      return false;
    }
  },

  /**
   * Test authentication with sample credentials
   */
  testSampleLogin: async (email = 'test.guard@example.com', password = 'TestPass123!') => {
    console.log('🧪 Testing Sample Guard Login...\n');
    
    try {
      const { useAuthGuard } = require('../hooks/useAuthGuard');
      const { signInWithEmail } = useAuthGuard();

      console.log(`Attempting login with: ${email}`);
      const result = await signInWithEmail(email, password);
      
      if (result.success) {
        console.log('✓ Login successful!');
        console.log(`  - User ID: ${result.user?.id}`);
        console.log(`  - Guard ID: ${result.guard?.id}`);
      } else {
        console.log('❌ Login failed:', result.error);
      }

      return result.success;
    } catch (error) {
      console.error('❌ Login test failed:', error);
      return false;
    }
  }
};

// Quick helper for development console testing
export const quickTestAuth = () => {
  console.log('🚀 Running quick authentication test...');
  return testGuardAuth.runBasicTests();
};
