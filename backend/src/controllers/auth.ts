import { supabase } from '../lib/supabase';
import type { Request, Response, NextFunction } from 'express';

// Helper function to extract error message
const getErrorMessage = (error: any): string => {
  return error?.message || (typeof error === 'string' ? error : 'An unknown error occurred');
};

// POST /register
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }
    
    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      throw new Error(getErrorMessage(error));
    }

    // Create user profile
    if (data.user) {
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: data.user.id,
          user_id: data.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          role: 'user'
        });

      if (profileError) {
        throw new Error(getErrorMessage(profileError));
      }
    }
    
    res.status(201).json({ user: data.user });
  } catch (err) {
    next(err);
  }
};

// POST /login
export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Missing email or password' });
      return;
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      throw new Error(getErrorMessage(error));
    }
    res.status(200).json({ user: data.user, session: data.session });
  } catch (err) {
    next(err);
  }
};

// POST /logout
export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'No authorization token provided' });
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(getErrorMessage(error));
    }
    res.status(200).json({ message: 'Logged out' });
  } catch (err) {
    next(err);
  }
};

// GET /me
export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'No authorization token provided' });
      return;
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error) {
      throw new Error(getErrorMessage(error));
    }

    // Get user profile from profiles table
    if (user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.warn('Could not fetch user profile:', profileError);
      }

      res.status(200).json({ 
        user: {
          ...user,
          profile
        }
      });
    } else {
      res.status(401).json({ error: 'Invalid token' });
    }
  } catch (err) {
    next(err);
  }
};
