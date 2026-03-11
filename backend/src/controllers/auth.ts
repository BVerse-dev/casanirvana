import { supabase } from '../lib/supabase';
import type { Request, Response, NextFunction } from 'express';
import { createHttpError } from '../lib/httpError';

// Helper function to extract error message
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return error?.message || (typeof error === 'string' ? error : 'An unknown error occurred');
};

// POST /register
export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, firstName, lastName } = req.body;

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
      return next(createHttpError(401, 'AUTH_TOKEN_MISSING', 'No authorization token provided'));
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
    if (!req.user) {
      return next(createHttpError(401, 'AUTH_INVALID_TOKEN', 'Invalid token'));
    }

    res.status(200).json({
      user: {
        ...req.user,
        profile: req.userProfile || null,
      },
    });
  } catch (err) {
    next(err);
  }
};
