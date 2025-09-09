import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GuardAuthProvider } from '../contexts/GuardAuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
      structuralSharing: false, // Disable structural sharing to prevent frozen objects
    },
  },
});

export const AppQueryClientProvider = ({ children }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <GuardAuthProvider>
        {children}
      </GuardAuthProvider>
    </QueryClientProvider>
  );
};
