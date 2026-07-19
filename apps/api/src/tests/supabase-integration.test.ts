import { describe, it, expect, beforeAll, afterAll } from 'vitest';

// Test ID to track created records for cleanup
const TEST_ID = `test-${Date.now()}`;

const hasSupabaseEnv = Boolean(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
) && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY);

const suite = hasSupabaseEnv ? describe : describe.skip;

suite('Supabase Integration Tests', () => {
  let supabase: typeof import('../lib/supabase').supabase;
  let adminSupabase: typeof import('../lib/supabase').adminSupabase;
  let SocietyService: typeof import('../services/society');
  // Test data
  const testSociety = {
    name: `Test Society ${TEST_ID}`,
    address: '123 Test Street',
    city: 'Test City',
    state: 'Test State',
    pincode: '12345',
    type: 'apartment',
    total_units: 100,
    image_url: 'https://example.com/image.jpg',
    latitude: 12.9716,
    longitude: 77.5946
  };

  // Store created IDs for cleanup
  const createdIds: { [key: string]: string } = {};

  // Cleanup function
  afterAll(async () => {
    // Delete test data
    if (createdIds.society) {
      await adminSupabase
        .from('societies')
        .delete()
        .eq('id', createdIds.society);
    }
  });

  beforeAll(async () => {
    ({ supabase, adminSupabase } = await import('../lib/supabase'));
    SocietyService = await import('../services/society');
  });

  // Test CRUD operations for societies
  describe('Society CRUD Operations', () => {
    it('should create a society', async () => {
      const society = await SocietyService.createSociety(testSociety);

      expect(society).toBeDefined();
      expect(society.id).toBeDefined();
      expect(society.name).toBe(testSociety.name);

      // Store ID for later tests and cleanup
      createdIds.society = society.id;
    });

    it('should get a society by ID', async () => {
      const society = await SocietyService.getSocietyById(createdIds.society);

      expect(society).toBeDefined();
      expect(society.id).toBe(createdIds.society);
      expect(society.name).toBe(testSociety.name);
    });

    it('should list societies with pagination and filtering', async () => {
      const result = await SocietyService.getAllSocieties({
        search: TEST_ID,
        limit: 10,
        page: 1
      });

      expect(result).toBeDefined();
      expect(result.data).toBeInstanceOf(Array);
      expect(result.meta).toBeDefined();
      expect(result.meta.total).toBeGreaterThanOrEqual(1);

      // Find our test society in the results
      const found = result.data.find(s => s.id === createdIds.society);
      expect(found).toBeDefined();
      expect(found?.name).toBe(testSociety.name);
    });

    it('should update a society', async () => {
      const updateData = {
        name: `Updated Society ${TEST_ID}`,
        total_units: 120
      };

      const updated = await SocietyService.updateSociety(createdIds.society, updateData);

      expect(updated).toBeDefined();
      expect(updated.id).toBe(createdIds.society);
      expect(updated.name).toBe(updateData.name);
      expect(updated.total_units).toBe(updateData.total_units);

      // Other fields should remain unchanged
      expect(updated.address).toBe(testSociety.address);
    });
  });

  // Test authentication
  describe('Authentication', () => {
    it('should have different permissions between anonymous and admin clients', async () => {
      // Admin client should be able to query tables directly
      const { data: adminData, error: adminError } = await adminSupabase
        .from('societies')
        .select('id, name')
        .limit(1);

      expect(adminError).toBeNull();
      expect(adminData).toBeDefined();

      // Anonymous client may be restricted by RLS policies
      const { data: anonData, error: anonError } = await supabase
        .from('societies')
        .select('id, name')
        .limit(1);

      // This test will vary depending on your RLS policies
      // If public read is allowed, anonError will be null
      // If public read is restricted, anonError will contain a permission error
      if (anonError) {
        expect(anonError.code).toBe('PGRST301'); // Permission denied code
      } else {
        expect(anonData).toBeDefined();
      }
    });
  });

  // Test real-time subscriptions
  describe('Real-time Subscriptions', () => {
    it('should receive updates via subscription', async () => {
      return new Promise<void>((resolve, reject) => {
        // Skip if no society was created
        if (!createdIds.society) {
          return resolve();
        }

        let receivedUpdate = false;

        // Set up subscription
        const channel = supabase
          .channel(`public:societies:id=eq.${createdIds.society}`)
          .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'societies',
            filter: `id=eq.${createdIds.society}`
          }, (payload) => {
            try {
              expect(payload.new).toBeDefined();
              expect(payload.new.id).toBe(createdIds.society);
              receivedUpdate = true;
              channel.unsubscribe();
              resolve();
            } catch (err) {
              reject(err);
            }
          })
          .subscribe();

        // Update the record to trigger the subscription
        setTimeout(async () => {
          try {
            await SocietyService.updateSociety(createdIds.society, {
              name: `Subscription Test ${Date.now()}`
            });

            // Allow some time for the subscription to be triggered
            setTimeout(() => {
              if (!receivedUpdate) {
                reject(new Error('Did not receive real-time update'));
              }
            }, 3000);
          } catch (err) {
            reject(err);
          }
        }, 1000);
      });
    }, 10000); // Longer timeout for subscription test
  });
});
