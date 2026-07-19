import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  Animated,
  AppState,
  Dimensions,
} from "react-native";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MyStatusBar from "../components/myStatusBar";
import { useTranslation } from "react-i18next";
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get("window");

const LockScreen = ({ navigation, onUnlock }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";

  const [pin, setPin] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState(0);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  const [showBiometric, setShowBiometric] = useState(true);
  
  const shakeAnimation = new Animated.Value(0);
  const fadeAnimation = new Animated.Value(0);

  useEffect(() => {
    checkBiometricSettings();
    fadeIn();
    
    // Auto-show biometric on load if enabled
    if (biometricEnabled && showBiometric) {
      setTimeout(() => {
        handleBiometricAuth();
      }, 500);
    }
  }, []);

  useEffect(() => {
    let timer;
    if (isLocked && lockTime > 0) {
      timer = setInterval(() => {
        setLockTime(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLocked, lockTime]);

  const fadeIn = () => {
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const checkBiometricSettings = async () => {
    try {
      const enabled = await AsyncStorage.getItem('biometric_enabled');
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      if (enabled === 'true' && compatible && enrolled) {
        setBiometricEnabled(true);
        if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
          setBiometricType('Face ID');
        } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
          setBiometricType('Touch ID');
        } else {
          setBiometricType('Biometric');
        }
      }
    } catch (error) {
      console.log('Biometric check error:', error);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Casa Nirvana',
        subPromptMessage: 'Use your biometric to access your account',
        cancelLabel: 'Use PIN',
        fallbackLabel: 'Use PIN Instead',
      });

      if (result.success) {
        onUnlock();
      } else {
        setShowBiometric(false);
      }
    } catch (error) {
      console.log('Biometric auth error:', error);
      setShowBiometric(false);
    }
  };

  const handleNumberPress = (number) => {
    if (isLocked) return;
    
    if (pin.length < 4) {
      setPin(pin + number);
    }
  };

  const handleBackspace = () => {
    if (isLocked) return;
    setPin(pin.slice(0, -1));
  };

  const shakeError = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const verifyPin = async () => {
    try {
      const storedPin = await AsyncStorage.getItem('app_pin');
      
      if (pin === storedPin) {
        // Reset attempts and unlock
        setAttempts(0);
        await AsyncStorage.removeItem('lock_attempts');
        onUnlock();
      } else {
        // Wrong PIN
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        await AsyncStorage.setItem('lock_attempts', newAttempts.toString());
        
        shakeError();
        setPin('');
        
        if (newAttempts >= 5) {
          // Lock for 1 minute after 5 failed attempts
          setIsLocked(true);
          setLockTime(60);
          Alert.alert(
            'Too Many Attempts',
            'App locked for 1 minute due to multiple failed attempts.'
          );
        } else {
          Alert.alert(
            'Incorrect PIN',
            `${5 - newAttempts} attempts remaining before temporary lock.`
          );
        }
      }
    } catch (error) {
      console.error('PIN verification error:', error);
      Alert.alert('Error', 'Unable to verify PIN. Please try again.');
    }
  };

  useEffect(() => {
    if (pin.length === 4) {
      verifyPin();
    }
  }, [pin]);

  const handleForgotPin = () => {
    Alert.alert(
      'Forgot PIN?',
      'To reset your PIN, you\'ll need to log out and sign in again. This will clear all app data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.multiRemove([
              'app_pin',
              'pin_enabled',
              'biometric_enabled',
              'lock_attempts'
            ]);
            navigation.reset({
              index: 0,
              routes: [{ name: 'loginScreen' }],
            });
          }
        }
      ]
    );
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.dot,
              pin.length > index && styles.dotFilled
            ]}
          />
        ))}
      </View>
    );
  };

  const renderNumberPad = () => {
    const numbers = [
      ['1', '2', '3'],
      ['4', '5', '6'],
      ['7', '8', '9'],
      ['', '0', 'backspace']
    ];

    return (
      <View style={styles.numberPad}>
        {numbers.map((row, rowIndex) => (
          <View key={rowIndex} style={styles.numberRow}>
            {row.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.numberButton,
                  item === '' && styles.numberButtonEmpty,
                  isLocked && styles.numberButtonDisabled
                ]}
                onPress={() => {
                  if (item === 'backspace') {
                    handleBackspace();
                  } else if (item !== '') {
                    handleNumberPress(item);
                  }
                }}
                disabled={item === '' || isLocked}
              >
                {item === 'backspace' ? (
                  <Ionicons 
                    name="backspace-outline" 
                    size={24} 
                    color={isLocked ? Colors.lightGrey : Colors.black} 
                  />
                ) : (
                  <Text style={[
                    styles.numberText,
                    isLocked && styles.numberTextDisabled
                  ]}>
                    {item}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnimation }]}>
      <MyStatusBar />
      
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons 
              name={isLocked ? "lock-alert" : "lock"} 
              size={60} 
              color={isLocked ? Colors.red : Colors.primary} 
            />
          </View>
          
          <Text style={styles.title}>
            {isLocked ? 'App Locked' : 'Enter PIN'}
          </Text>
          
          <Text style={styles.subtitle}>
            {isLocked 
              ? `Try again in ${formatTime(lockTime)}`
              : 'Enter your 4-digit PIN to unlock Casa Nirvana'
            }
          </Text>

          {attempts > 0 && !isLocked && (
            <Text style={styles.attemptsText}>
              {5 - attempts} attempts remaining
            </Text>
          )}
        </View>

        {/* PIN Dots */}
        <Animated.View 
          style={[
            styles.pinContainer,
            { transform: [{ translateX: shakeAnimation }] }
          ]}
        >
          {renderDots()}
        </Animated.View>

        {/* Number Pad */}
        {renderNumberPad()}

        {/* Biometric Button */}
        {biometricEnabled && showBiometric && !isLocked && (
          <TouchableOpacity
            style={styles.biometricButton}
            onPress={handleBiometricAuth}
          >
            <MaterialCommunityIcons 
              name="fingerprint" 
              size={24} 
              color={Colors.primary} 
            />
            <Text style={styles.biometricText}>Use {biometricType}</Text>
          </TouchableOpacity>
        )}

        {/* Forgot PIN */}
        {!isLocked && attempts >= 3 && (
          <TouchableOpacity
            style={styles.forgotButton}
            onPress={handleForgotPin}
          >
            <Text style={styles.forgotText}>Forgot PIN?</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* App Info Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Casa Nirvana</Text>
        <Text style={styles.footerSubtext}>Community Management</Text>
      </View>
    </Animated.View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 3,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: Default.fixPadding * 3,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Default.fixPadding * 2,
  },
  title: {
    ...Fonts.SemiBold24black,
    textAlign: 'center',
    marginBottom: Default.fixPadding,
  },
  subtitle: {
    ...Fonts.Medium16grey,
    textAlign: 'center',
    lineHeight: 24,
  },
  attemptsText: {
    ...Fonts.Medium14red,
    textAlign: 'center',
    marginTop: Default.fixPadding,
  },
  pinContainer: {
    alignItems: 'center',
    marginVertical: Default.fixPadding * 3,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.lightGrey,
    marginHorizontal: Default.fixPadding,
  },
  dotFilled: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  numberPad: {
    marginTop: Default.fixPadding * 2,
  },
  numberRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Default.fixPadding * 1.5,
  },
  numberButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Default.fixPadding * 1.5,
    backgroundColor: Colors.extraLightGrey,
  },
  numberButtonEmpty: {
    backgroundColor: 'transparent',
  },
  numberButtonDisabled: {
    backgroundColor: Colors.lightGrey,
    opacity: 0.5,
  },
  numberText: {
    ...Fonts.SemiBold24black,
  },
  numberTextDisabled: {
    color: Colors.lightGrey,
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary + '10',
    paddingVertical: Default.fixPadding * 1.2,
    paddingHorizontal: Default.fixPadding * 2,
    borderRadius: 25,
    marginTop: Default.fixPadding * 2,
    alignSelf: 'center',
  },
  biometricText: {
    ...Fonts.Medium16primary,
    marginLeft: Default.fixPadding,
  },
  forgotButton: {
    alignItems: 'center',
    paddingVertical: Default.fixPadding * 1.5,
    marginTop: Default.fixPadding,
  },
  forgotText: {
    ...Fonts.Medium16grey,
    textDecorationLine: 'underline',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: Default.fixPadding * 2,
  },
  footerText: {
    ...Fonts.SemiBold16primary,
    marginBottom: Default.fixPadding * 0.3,
  },
  footerSubtext: {
    ...Fonts.Medium12grey,
  },
};

export default LockScreen;
