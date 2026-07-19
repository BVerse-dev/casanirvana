// Mock for @supabase/supabase-js
export const createClient = jest.fn(() => ({
  auth: {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    getSession: jest.fn(),
    onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
  },
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(),
      single: jest.fn(),
      match: jest.fn(),
      order: jest.fn(),
      limit: jest.fn(),
    })),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  })),
}));
