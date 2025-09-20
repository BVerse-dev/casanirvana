import React, { createContext, useContext, useState, useEffect } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

const AppLockContext = createContext();

export const useAppLock = () => {
  const context = useContext(AppLockContext);
  if (!context) {
    throw new Error('useAppLock must be used within an AppLockProvider');
  }
  return context;
};

export const AppLockProvider = ({ children }) => {
  const [isLocked, setIsLocked] = useState(false);
  const [isPinEnabled, setIsPinEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [backgroundTime, setBackgroundTime] = useState(null);
  const [lockTimeout, setLockTimeout] = useState(5); // 5 minutes default

  useEffect(() => {
    initializeAppLock();
    setupAppStateListener();
  }, []);

  const initializeAppLock = async () => {
    try {
      const pinEnabled = await AsyncStorage.getItem('pin_enabled');
      const timeout = await AsyncStorage.getItem('lock_timeout');
      
      setIsPinEnabled(pinEnabled === 'true');
      setLockTimeout(parseInt(timeout) || 5);
      
      // Check if app should be locked on startup
      if (pinEnabled === 'true') {
        const lastBackgroundTime = await AsyncStorage.getItem('app_background_time');
        if (lastBackgroundTime) {
          const timeDiff = Date.now() - parseInt(lastBackgroundTime);
          const timeoutMs = (parseInt(timeout) || 5) * 60 * 1000; // Convert to milliseconds
          
          if (timeDiff > timeoutMs) {
            setIsLocked(true);
          }
        } else {
          // First time opening, lock if PIN is enabled
          setIsLocked(true);
        }
      }
    } catch (error) {
      console.error('Error initializing app lock:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setupAppStateListener = () => {
    const handleAppStateChange = async (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // App is going to background
        if (isPinEnabled) {
          const currentTime = Date.now();
          setBackgroundTime(currentTime);
          await AsyncStorage.setItem('app_background_time', currentTime.toString());
        }
      } else if (nextAppState === 'active') {
        // App is coming to foreground
        if (isPinEnabled && backgroundTime) {
          const timeDiff = Date.now() - backgroundTime;
          const timeoutMs = lockTimeout * 60 * 1000; // Convert to milliseconds
          
          if (timeDiff > timeoutMs) {
            setIsLocked(true);
          }
          setBackgroundTime(null);
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  };

  const enablePin = async (pin, biometricEnabled = false) => {
    try {
      await AsyncStorage.multiSet([
        ['app_pin', pin],
        ['pin_enabled', 'true'],
        ['biometric_enabled', biometricEnabled.toString()],
        ['lock_timeout', lockTimeout.toString()]
      ]);
      
      setIsPinEnabled(true);
      return true;
    } catch (error) {
      console.error('Error enabling PIN:', error);
      return false;
    }
  };

  const disablePin = async () => {
    try {
      await AsyncStorage.multiRemove([
        'app_pin',
        'pin_enabled',
        'biometric_enabled',
        'lock_attempts',
        'app_background_time'
      ]);
      
      setIsPinEnabled(false);
      setIsLocked(false);
      return true;
    } catch (error) {
      console.error('Error disabling PIN:', error);
      return false;
    }
  };

  const updateLockTimeout = async (minutes) => {
    try {
      await AsyncStorage.setItem('lock_timeout', minutes.toString());
      setLockTimeout(minutes);
      return true;
    } catch (error) {
      console.error('Error updating lock timeout:', error);
      return false;
    }
  };

  const unlock = () => {
    setIsLocked(false);
    setBackgroundTime(null);
  };

  const lock = () => {
    if (isPinEnabled) {
      setIsLocked(true);
    }
  };

  const verifyPin = async (inputPin) => {
    try {
      const storedPin = await AsyncStorage.getItem('app_pin');
      return inputPin === storedPin;
    } catch (error) {
      console.error('Error verifying PIN:', error);
      return false;
    }
  };

  const authenticateWithBiometric = async () => {
    try {
      const biometricEnabled = await AsyncStorage.getItem('biometric_enabled');
      if (biometricEnabled !== 'true') {
        return { success: false, error: 'Biometric not enabled' };
      }

      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!compatible || !enrolled) {
        return { success: false, error: 'Biometric not available' };
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Casa Nirvana',
        subPromptMessage: 'Use your biometric to access your account',
        cancelLabel: 'Cancel',
        fallbackLabel: 'Use PIN',
      });

      return result;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return { success: false, error: error.message };
    }
  };

  const isBiometricEnabled = async () => {
    try {
      const enabled = await AsyncStorage.getItem('biometric_enabled');
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      
      return enabled === 'true' && compatible && enrolled;
    } catch (error) {
      console.error('Error checking biometric status:', error);
      return false;
    }
  };

  const getBiometricType = async () => {
    try {
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return 'Face ID';
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return 'Touch ID';
      } else {
        return 'Biometric';
      }
    } catch (error) {
      console.error('Error getting biometric type:', error);
      return 'Biometric';
    }
  };

  const resetLockAttempts = async () => {
    try {
      await AsyncStorage.removeItem('lock_attempts');
    } catch (error) {
      console.error('Error resetting lock attempts:', error);
    }
  };

  const getLockAttempts = async () => {
    try {
      const attempts = await AsyncStorage.getItem('lock_attempts');
      return parseInt(attempts) || 0;
    } catch (error) {
      console.error('Error getting lock attempts:', error);
      return 0;
    }
  };

  const value = {
    isLocked,
    isPinEnabled,
    isLoading,
    lockTimeout,
    enablePin,
    disablePin,
    updateLockTimeout,
    unlock,
    lock,
    verifyPin,
    authenticateWithBiometric,
    isBiometricEnabled,
    getBiometricType,
    resetLockAttempts,
    getLockAttempts,
  };

  return (
    <AppLockContext.Provider value={value}>
      {children}
    </AppLockContext.Provider>
  );
};

export default AppLockProvider;
