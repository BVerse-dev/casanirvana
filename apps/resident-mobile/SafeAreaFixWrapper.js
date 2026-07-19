import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Alert } from 'react-native';

// This is a diagnostic wrapper component that will help us
// detect and resolve the duplicate registration issue
export default function SafeAreaFixWrapper({ children }) {
  useEffect(() => {
    // Log information about the imported SafeAreaProvider
    console.log('SafeAreaProvider imported from:', require.resolve('react-native-safe-area-context'));
  }, []);

  return (
    <SafeAreaProvider>
      {children}
    </SafeAreaProvider>
  );
}
