import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  BackHandler,
  Animated,
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

const PinSetupScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";

  const [step, setStep] = useState('intro'); // 'intro', 'create', 'confirm'
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('');
  const [enableBiometric, setEnableBiometric] = useState(false);
  
  const shakeAnimation = new Animated.Value(0);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
      
      if (compatible && enrolled) {
        setBiometricAvailable(true);
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

  const handleNumberPress = (number) => {
    if (step === 'create') {
      if (pin.length < 4) {
        setPin(pin + number);
      }
    } else if (step === 'confirm') {
      if (confirmPin.length < 4) {
        setConfirmPin(confirmPin + number);
      }
    }
  };

  const handleBackspace = () => {
    if (step === 'create') {
      setPin(pin.slice(0, -1));
    } else if (step === 'confirm') {
      setConfirmPin(confirmPin.slice(0, -1));
    }
  };

  const shakeError = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 100, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 100, useNativeDriver: true }),
    ]).start();
  };

  const handleContinue = async () => {
    if (step === 'create' && pin.length === 4) {
      setStep('confirm');
    } else if (step === 'confirm' && confirmPin.length === 4) {
      if (pin === confirmPin) {
        // Save PIN and biometric preference
        await savePinSettings();
      } else {
        shakeError();
        setConfirmPin('');
        Alert.alert('Error', 'PINs do not match. Please try again.');
      }
    }
  };

  const savePinSettings = async () => {
    try {
      await AsyncStorage.setItem('app_pin', pin);
      await AsyncStorage.setItem('pin_enabled', 'true');
      await AsyncStorage.setItem('biometric_enabled', enableBiometric.toString());
      
      Alert.alert(
        'Success!',
        'Your app lock has been set up successfully. Your app is now more secure.',
        [{ text: 'Continue', onPress: () => navigation.replace('bottomTab') }]
      );
    } catch (error) {
      console.error('Error saving PIN:', error);
      Alert.alert('Error', 'Failed to save PIN. Please try again.');
    }
  };

  const skipSetup = () => {
    Alert.alert(
      'Skip App Lock?',
      'You can always set up app lock later in Settings > Security > PIN Code.',
      [
        { text: 'Set Up Now', style: 'cancel' },
        { text: 'Skip', onPress: () => navigation.replace('bottomTab') }
      ]
    );
  };

  const renderDots = (currentPin) => {
    return (
      <View style={styles.dotsContainer}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentPin.length > index && styles.dotFilled
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
                  item === '' && styles.numberButtonEmpty
                ]}
                onPress={() => {
                  if (item === 'backspace') {
                    handleBackspace();
                  } else if (item !== '') {
                    handleNumberPress(item);
                  }
                }}
                disabled={item === ''}
              >
                {item === 'backspace' ? (
                  <Ionicons name="backspace-outline" size={24} color={Colors.black} />
                ) : (
                  <Text style={styles.numberText}>{item}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const renderIntroStep = () => (
    <View style={styles.content}>
      <View style={styles.headerSection}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="shield-lock" size={80} color={Colors.primary} />
        </View>
        <Text style={styles.title}>Secure Your App</Text>
        <Text style={styles.subtitle}>
          Add an extra layer of security to protect your personal information and community data.
        </Text>
      </View>

      <View style={styles.featuresContainer}>
        <View style={styles.featureItem}>
          <MaterialCommunityIcons name="lock" size={24} color={Colors.primary} />
          <Text style={styles.featureText}>4-digit PIN protection</Text>
        </View>
        
        {biometricAvailable && (
          <View style={styles.featureItem}>
            <MaterialCommunityIcons name="fingerprint" size={24} color={Colors.primary} />
            <Text style={styles.featureText}>{biometricType} unlock</Text>
          </View>
        )}
        
        <View style={styles.featureItem}>
          <MaterialCommunityIcons name="timer-lock" size={24} color={Colors.primary} />
          <Text style={styles.featureText}>Auto-lock after inactivity</Text>
        </View>
        
        <View style={styles.featureItem}>
          <MaterialCommunityIcons name="shield-check" size={24} color={Colors.primary} />
          <Text style={styles.featureText}>Privacy protection</Text>
        </View>
      </View>

      {biometricAvailable && (
        <View style={styles.biometricOption}>
          <TouchableOpacity
            style={styles.biometricToggle}
            onPress={() => setEnableBiometric(!enableBiometric)}
          >
            <View style={styles.biometricLeft}>
              <MaterialCommunityIcons 
                name="fingerprint" 
                size={20} 
                color={Colors.primary} 
              />
              <Text style={styles.biometricText}>Enable {biometricType}</Text>
            </View>
            <View style={[
              styles.toggleSwitch,
              enableBiometric && styles.toggleSwitchActive
            ]}>
              <View style={[
                styles.toggleThumb,
                enableBiometric && styles.toggleThumbActive
              ]} />
            </View>
          </TouchableOpacity>
          <Text style={styles.biometricDescription}>
            Use {biometricType} as an alternative to PIN entry
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => setStep('create')}
        >
          <MaterialCommunityIcons name="lock-plus" size={20} color={Colors.white} />
          <Text style={styles.primaryButtonText}>Set Up PIN</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={skipSetup}
        >
          <Text style={styles.secondaryButtonText}>Skip for Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPinStep = () => (
    <View style={styles.content}>
      <View style={styles.headerSection}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep('intro')}>
          <Ionicons name="arrow-back" size={24} color={Colors.black} />
        </TouchableOpacity>
        
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons 
            name={step === 'create' ? "lock-plus" : "lock-check"} 
            size={60} 
            color={Colors.primary} 
          />
        </View>
        
        <Text style={styles.title}>
          {step === 'create' ? 'Create Your PIN' : 'Confirm Your PIN'}
        </Text>
        <Text style={styles.subtitle}>
          {step === 'create' 
            ? 'Choose a 4-digit PIN that you can remember easily'
            : 'Enter your PIN again to confirm'
          }
        </Text>
      </View>

      <Animated.View 
        style={[
          styles.pinContainer,
          { transform: [{ translateX: shakeAnimation }] }
        ]}
      >
        {renderDots(step === 'create' ? pin : confirmPin)}
      </Animated.View>

      {renderNumberPad()}

      {((step === 'create' && pin.length === 4) || 
        (step === 'confirm' && confirmPin.length === 4)) && (
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Text style={styles.continueButtonText}>
            {step === 'create' ? 'Continue' : 'Confirm'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color={Colors.white} />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <MyStatusBar />
      {step === 'intro' ? renderIntroStep() : renderPinStep()}
    </View>
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
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: Default.fixPadding,
    zIndex: 1,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
  featuresContainer: {
    marginBottom: Default.fixPadding * 3,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Default.fixPadding * 1.2,
    paddingHorizontal: Default.fixPadding * 2,
    backgroundColor: Colors.extraLightGrey,
    borderRadius: 12,
    marginBottom: Default.fixPadding,
  },
  featureText: {
    ...Fonts.Medium16black,
    marginLeft: Default.fixPadding * 1.5,
  },
  biometricOption: {
    backgroundColor: Colors.extraLightGrey,
    padding: Default.fixPadding * 2,
    borderRadius: 12,
    marginBottom: Default.fixPadding * 3,
  },
  biometricToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Default.fixPadding,
  },
  biometricLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  biometricText: {
    ...Fonts.SemiBold16black,
    marginLeft: Default.fixPadding,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.lightGrey,
    padding: 2,
    justifyContent: 'center',
  },
  toggleSwitchActive: {
    backgroundColor: Colors.primary,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.white,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  biometricDescription: {
    ...Fonts.Medium14grey,
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 'auto',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Default.fixPadding * 1.5,
    borderRadius: 12,
    marginBottom: Default.fixPadding * 1.5,
    ...Default.shadow,
  },
  primaryButtonText: {
    ...Fonts.SemiBold18white,
    marginLeft: Default.fixPadding,
  },
  secondaryButton: {
    alignItems: 'center',
    paddingVertical: Default.fixPadding * 1.2,
  },
  secondaryButtonText: {
    ...Fonts.Medium16grey,
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
  numberText: {
    ...Fonts.SemiBold24black,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Default.fixPadding * 1.2,
    borderRadius: 12,
    marginTop: Default.fixPadding * 2,
    ...Default.shadow,
  },
  continueButtonText: {
    ...Fonts.SemiBold16white,
    marginRight: Default.fixPadding,
  },
};

export default PinSetupScreen;
