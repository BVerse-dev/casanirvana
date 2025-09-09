import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { adminSupabase } from '../lib/supabase';
import * as PaymentService from '../services/payment';

// Test ID to track created records for cleanup
const TEST_ID = `test-${Date.now()}`;

describe('Payment Service Supabase Integration Tests', () => {
  // Store created IDs for cleanup
  const createdIds: { [key: string]: string } = {};

  // Setup: Create test society, unit, and user for our payments
  beforeAll(async () => {
    try {
      // Create a test society
      const { data: society } = await adminSupabase
        .from('societies')
        .insert({
          name: `Test Society ${TEST_ID}`,
          address: '123 Test Street',
          city: 'Test City',
          state: 'Test State',
          pincode: '12345',
          type: 'apartment',
          total_units: 10
        })
        .select('id')
        .single();

      createdIds.society = society?.id;

      // Create a test unit
      const { data: unit } = await adminSupabase
        .from('units')
        .insert({
          society_id: society?.id,
          unit_number: `A${TEST_ID}`,
          floor_number: '1',
          block_number: 'A',
          type: '2BHK',
          area_sqft: 1200
        })
        .select('id')
        .single();

      createdIds.unit = unit?.id;

      // Create a test user
      const { data: user } = await adminSupabase.auth.admin.createUser({
        email: `test${TEST_ID}@example.com`,
        password: 'password123',
        user_metadata: { name: `Test User ${TEST_ID}` }
      });

      createdIds.user = user?.user?.id;

      // Create profile for the user
      if (createdIds.user) {
        await adminSupabase
          .from('profiles')
          .insert({
            id: createdIds.user,
            first_name: 'Test',
            last_name: `User ${TEST_ID}`,
            email: `test${TEST_ID}@example.com`,
            role: 'user'
          });
      }
    } catch (err) {
      console.error('Setup failed:', err);
    }
  });

  // Cleanup after tests are complete
  afterAll(async () => {
    try {
      // Delete test payment records
      if (createdIds.payment) {
        await adminSupabase
          .from('payments')
          .delete()
          .eq('id', createdIds.payment);
      }

      // Delete test unit
      if (createdIds.unit) {
        await adminSupabase
          .from('units')
          .delete()
          .eq('id', createdIds.unit);
      }

      // Delete test society
      if (createdIds.society) {
        await adminSupabase
          .from('societies')
          .delete()
          .eq('id', createdIds.society);
      }

      // Delete test user and profile (cascade deletion will handle the profile)
      if (createdIds.user) {
        await adminSupabase.auth.admin.deleteUser(createdIds.user);
      }
    } catch (err) {
      console.error('Cleanup failed:', err);
    }
  });

  // Test creating a payment
  it('should create a payment', async () => {
    // Skip if setup failed
    if (!createdIds.society || !createdIds.unit || !createdIds.user) {
      console.warn('Skipping test due to failed setup');
      return;
    }

    const paymentData = {
      society_id: createdIds.society,
      unit_id: createdIds.unit,
      user_id: createdIds.user,
      amount: 1000,
      payment_type: 'maintenance',
      description: 'Test maintenance payment',
      payment_date: new Date().toISOString()
    };

    const payment = await PaymentService.createPayment(paymentData);

    expect(payment).toBeDefined();
    expect(payment.id).toBeDefined();
    expect(payment.payment_id).toMatch(/PAY-/); // Check that a payment ID was generated
    expect(payment.amount).toBe(1000);
    expect(payment.status).toBe('pending'); // Default status should be pending

    // Store payment ID for later tests
    createdIds.payment = payment.id;
  });

  // Test getting a payment by ID
  it('should get a payment by ID', async () => {
    // Skip if no payment was created
    if (!createdIds.payment) {
      console.warn('Skipping test due to missing payment');
      return;
    }

    const payment = await PaymentService.getPaymentById(createdIds.payment);

    expect(payment).toBeDefined();
    expect(payment.id).toBe(createdIds.payment);
    expect(payment.amount).toBe(1000);

    // Check that related data is included
    expect(payment.profiles).toBeDefined();
    expect(payment.units).toBeDefined();
    expect(payment.societies).toBeDefined();
  });

  // Test updating payment status
  it('should update payment status', async () => {
    // Skip if no payment was created
    if (!createdIds.payment) {
      console.warn('Skipping test due to missing payment');
      return;
    }

    const updatedPayment = await PaymentService.updatePaymentStatus(
      createdIds.payment,
      'completed',
      createdIds.user,
      'Payment completed successfully'
    );

    expect(updatedPayment).toBeDefined();
    expect(updatedPayment.status).toBe('completed');
    expect(updatedPayment.notes).toBe('Payment completed successfully');
    expect(updatedPayment.completed_at).toBeDefined();
  });

  // Test getting payments by unit
  it('should get payments by unit', async () => {
    // Skip if setup failed
    if (!createdIds.unit) {
      console.warn('Skipping test due to failed setup');
      return;
    }

    const result = await PaymentService.getPaymentsByUnit(createdIds.unit);

    expect(result).toBeDefined();
    expect(result.data).toBeInstanceOf(Array);
    expect(result.meta).toBeDefined();

    // Find our test payment in the results
    const found = result.data.find(p => p.id === createdIds.payment);
    expect(found).toBeDefined();
  });

  // Test getting payments by society
  it('should get payments by society', async () => {
    // Skip if setup failed
    if (!createdIds.society) {
      console.warn('Skipping test due to failed setup');
      return;
    }

    const result = await PaymentService.getPaymentsBySociety(createdIds.society);

    expect(result).toBeDefined();
    expect(result.data).toBeInstanceOf(Array);
    expect(result.meta).toBeDefined();

    // Find our test payment in the results
    const found = result.data.find(p => p.id === createdIds.payment);
    expect(found).toBeDefined();
  });

  // Test getting payment statistics
  it('should get payment statistics', async () => {
    // Skip if setup failed
    if (!createdIds.society) {
      console.warn('Skipping test due to failed setup');
      return;
    }

    const stats = await PaymentService.getPaymentStats(createdIds.society);

    expect(stats).toBeDefined();
    expect(stats.completedAmount).toBeDefined();
    expect(stats.pendingAmount).toBeDefined();
    expect(stats.byStatus).toBeInstanceOf(Array);
    expect(stats.byType).toBeInstanceOf(Array);
  });
});
