import { useState } from 'react';
import { supabase } from '../utils/supabase';

export const useRegisterGuard = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const registerGuard = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      const { firstName, lastName, mobile, email, password } = formData;

      // Validate required fields
      if (!firstName || !lastName || !email || !password) {
        throw new Error('Please fill in all required fields');
      }

      if (!mobile) {
        throw new Error('Mobile number is required for guard registration');
      }

      console.log('Starting guard registration for:', email);

      // First, create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            role: 'guard',
          }
        }
      });

      if (authError) {
        console.error('Auth signup error:', authError);
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Registration failed - no user data returned');
      }

      console.log('Auth user created:', authData.user.id);

      // Try to sign in the user immediately to establish session for RLS
      try {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (signInError) {
          console.warn('Auto sign-in failed (this may be normal for email confirmation):', signInError);
        } else {
          console.log('Auto sign-in successful');
        }
      } catch (signInErr) {
        console.warn('Sign-in attempt failed:', signInErr);
      }

      // Wait a moment for any session changes
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Do NOT insert into public.users directly; rely on DB trigger created on auth.users
      // Wait for the trigger to create the public.users row
      console.log('Waiting for user profile (DB trigger)...');
      let userData = null;
      {
        let attempts = 0;
        while (attempts < 10) { // ~5s total
          const { data, error: fetchErr } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (!fetchErr && data) {
            userData = data;
            break;
          }

          await new Promise(resolve => setTimeout(resolve, 500));
          attempts++;
        }
      }

      if (!userData) {
        console.log('User profile not available yet; likely awaiting email verification');
        // Treat as successful signup pending email confirmation
        return {
          user: null,
          guard: null,
          session: authData.session,
          requiresEmailConfirmation: true,
          message: 'Sign up successful! Please check your email to verify your account, then sign in.',
        };
      }

      console.log('User profile found');

      // Create guard profile record
      console.log('Creating guard profile...');
      const guardProfileData = {
        user_id: userData.id,
        full_name: `${firstName.trim()} ${lastName.trim()}`,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        display_name: `${firstName.trim()} ${lastName.trim()}`,
        email: email.trim().toLowerCase(),
        phone: mobile.trim(),
        mobile: mobile.trim(),
        role: 'GUARD',
        status: 'active',
        is_active: true,
        shift_type: 'day', // Fixed: lowercase to match check constraint
        experience_years: 0,
        rating: 0,
        total_shifts: 0,
        completed_shifts: 0,
        certifications: [],
        skills: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: guardData, error: guardError } = await supabase
        .from('guards')
        .insert([guardProfileData])
        .select()
        .single();

      if (guardError) {
        console.error('Guard profile creation failed:', guardError);
        throw new Error(`Failed to create guard profile: ${guardError.message}`);
      }

      console.log('Guard profile created successfully');

      return {
        user: userData,
        guard: guardData,
        session: authData.session,
        message: 'Guard registration successful! Please check your email to verify your account.',
      };

    } catch (err) {
      const errorMessage = err.message || 'Registration failed. Please try again.';
      console.error('Registration error:', err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const checkEmailExists = async (email) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('email')
        .eq('email', email.trim().toLowerCase())
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is "not found" which is what we want
        throw error;
      }

      return !!data; // Returns true if email exists
    } catch (err) {
      console.error('Error checking email:', err);
      return false;
    }
  };

  const checkPhoneExists = async (phone) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('phone')
        .eq('phone', phone.trim())
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return !!data; // Returns true if phone exists
    } catch (err) {
      console.error('Error checking phone:', err);
      return false;
    }
  };

  return {
    registerGuard,
    checkEmailExists,
    checkPhoneExists,
    loading,
    error,
  };
};
