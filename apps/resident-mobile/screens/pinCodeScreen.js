import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MyStatusBar from "../components/myStatusBar";
import { useAppLock } from "../contexts/AppLockContext";

const PIN_LENGTH = 4;

const PinCodeScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() === "rtl";
  const { isPinEnabled, isLoading, verifyPin, enablePin, disablePin } = useAppLock();

  function tr(key) {
    return t(`settingScreen:${key}`);
  }

  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState("create");

  useEffect(() => {
    if (!isLoading) {
      setMode(isPinEnabled ? "change" : "create");
    }
  }, [isLoading, isPinEnabled]);

  useEffect(() => {
    setCurrentPin("");
    setNewPin("");
    setConfirmPin("");
    setShowCurrentPin(false);
    setShowNewPin(false);
    setShowConfirmPin(false);
  }, [mode]);

  const screenCopy =
    mode === "change"
      ? {
          title: tr("pinHeaderChangeTitle"),
          description: tr("pinHeaderChangeDescription"),
          cta: tr("pinUpdateButton"),
        }
      : {
          title: tr("pinHeaderCreateTitle"),
          description: tr("pinHeaderCreateDescription"),
          cta: tr("pinCreateButton"),
        };

  const normalizePin = (value) => value.replace(/\D/g, "").slice(0, PIN_LENGTH);

  const pinInputField = (label, value, setValue, showPin, setShowPin, placeholder) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.textInput, { textAlign: isRtl ? "right" : "left" }]}
          value={value}
          onChangeText={(text) => setValue(normalizePin(text))}
          placeholder={placeholder}
          placeholderTextColor={Colors.lightGrey}
          secureTextEntry={!showPin}
          keyboardType="number-pad"
          maxLength={PIN_LENGTH}
        />
        <TouchableOpacity
          onPress={() => setShowPin(!showPin)}
          style={styles.eyeIcon}
        >
          <Ionicons
            name={showPin ? "eye-outline" : "eye-off-outline"}
            size={20}
            color={Colors.grey}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  const validatePinPayload = () => {
    if (mode === "change" && currentPin.length !== PIN_LENGTH) {
      Alert.alert(tr("errorTitle"), tr("pinCurrentLengthError", { length: PIN_LENGTH }));
      return false;
    }

    if (newPin.length !== PIN_LENGTH) {
      Alert.alert(tr("errorTitle"), tr("pinNewLengthError", { length: PIN_LENGTH }));
      return false;
    }

    if (confirmPin.length !== PIN_LENGTH) {
      Alert.alert(tr("errorTitle"), tr("pinConfirmLengthError", { length: PIN_LENGTH }));
      return false;
    }

    if (newPin !== confirmPin) {
      Alert.alert(tr("errorTitle"), tr("pinMismatchError"));
      return false;
    }

    if (mode === "change" && currentPin === newPin) {
      Alert.alert(tr("errorTitle"), tr("pinSameAsCurrentError"));
      return false;
    }

    return true;
  };

  const handleSavePin = async () => {
    if (!validatePinPayload() || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === "change") {
        const validCurrentPin = await verifyPin(currentPin);
        if (!validCurrentPin) {
          Alert.alert(tr("errorTitle"), tr("pinIncorrectCurrentError"));
          setIsSubmitting(false);
          return;
        }
      }

      const saved = await enablePin(newPin);
      if (!saved) {
        throw new Error("Unable to save PIN");
      }

      Alert.alert(tr("successTitle"), tr("pinSavedSuccess"), [
        { text: tr("okay"), onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error("Failed to save PIN:", error);
      Alert.alert(tr("errorTitle"), tr("pinSaveFailure"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDisablePin = async () => {
    if (isSubmitting) {
      return;
    }

    if (currentPin.length !== PIN_LENGTH) {
      Alert.alert(tr("errorTitle"), tr("pinDisableEnterCurrentError", { length: PIN_LENGTH }));
      return;
    }

    setIsSubmitting(true);
    try {
      const validCurrentPin = await verifyPin(currentPin);
      if (!validCurrentPin) {
        Alert.alert(tr("errorTitle"), tr("pinIncorrectCurrentError"));
        return;
      }

      const disabled = await disablePin();
      if (!disabled) {
        throw new Error("Unable to disable PIN");
      }

      Alert.alert(tr("successTitle"), tr("pinDisabledSuccess"), [
        {
          text: tr("okay"),
          onPress: () => {
            setMode("create");
            setCurrentPin("");
            setNewPin("");
            setConfirmPin("");
          },
        },
      ]);
    } catch (error) {
      console.error("Failed to disable PIN:", error);
      Alert.alert(tr("errorTitle"), tr("pinDisableFailure"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors.extraLightGrey }}>
      <MyStatusBar />
      <View
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          paddingVertical: Default.fixPadding * 1.2,
          paddingHorizontal: Default.fixPadding * 2,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name={isRtl ? "arrow-forward-outline" : "arrow-back-outline"}
            size={25}
            color={Colors.black}
          />
        </TouchableOpacity>
        <Text
          style={{
            ...Fonts.SemiBold18black,
            marginHorizontal: Default.fixPadding,
          }}
        >
          {tr("pinCode")}
        </Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingVertical: Default.fixPadding * 2,
          }}
        >
          <View style={styles.container}>
            <View style={styles.headerSection}>
              <MaterialCommunityIcons
                name={mode === "change" ? "lock-reset" : "lock-plus-outline"}
                size={50}
                color={Colors.primary}
              />
              <Text style={styles.title}>{screenCopy.title}</Text>
              <Text style={styles.description}>{screenCopy.description}</Text>
            </View>

            <View style={styles.formSection}>
              {mode === "change" &&
                pinInputField(
                  tr("pinCurrentLabel"),
                  currentPin,
                  setCurrentPin,
                  showCurrentPin,
                  setShowCurrentPin,
                  tr("pinCurrentPlaceholder")
                )}

              {pinInputField(
                tr("pinNewLabel"),
                newPin,
                setNewPin,
                showNewPin,
                setShowNewPin,
                tr("pinNewPlaceholder")
              )}

              {pinInputField(
                tr("pinConfirmLabel"),
                confirmPin,
                setConfirmPin,
                showConfirmPin,
                setShowConfirmPin,
                tr("pinConfirmPlaceholder")
              )}
            </View>

            <View style={styles.securityTips}>
              <Text style={styles.tipsTitle}>{tr("pinSecurityTipsTitle")}</Text>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                <Text style={styles.tipText}>{tr("pinSecurityTip1")}</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                <Text style={styles.tipText}>{tr("pinSecurityTip2")}</Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                <Text style={styles.tipText}>{tr("pinSecurityTip3")}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, isSubmitting && styles.buttonDisabled]}
              onPress={handleSavePin}
              disabled={isSubmitting}
            >
              <MaterialCommunityIcons name="lock-check" size={20} color={Colors.white} />
              <Text style={styles.saveButtonText}>{screenCopy.cta}</Text>
            </TouchableOpacity>

            {mode === "change" && (
              <TouchableOpacity
                style={[styles.disableButton, isSubmitting && styles.buttonDisabled]}
                onPress={handleDisablePin}
                disabled={isSubmitting}
              >
                <MaterialCommunityIcons name="lock-off-outline" size={20} color={Colors.red} />
                <Text style={styles.disableButtonText}>{tr("pinDisableButton")}</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

export default PinCodeScreen;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    marginHorizontal: Default.fixPadding * 2,
  },
  headerSection: {
    backgroundColor: Colors.white,
    padding: Default.fixPadding * 2,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
  },
  title: {
    ...Fonts.SemiBold18primary,
    marginTop: Default.fixPadding,
    marginBottom: Default.fixPadding * 0.5,
  },
  description: {
    ...Fonts.Medium14grey,
    textAlign: "center",
    lineHeight: 22,
  },
  formSection: {
    backgroundColor: Colors.white,
    padding: Default.fixPadding * 2,
    borderRadius: 10,
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
  },
  inputContainer: {
    marginBottom: Default.fixPadding * 1.5,
  },
  inputLabel: {
    ...Fonts.Medium14black,
    marginBottom: Default.fixPadding * 0.5,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.lightGrey,
    borderRadius: 8,
    paddingHorizontal: Default.fixPadding,
  },
  textInput: {
    flex: 1,
    ...Fonts.Medium14black,
    paddingVertical: Default.fixPadding,
  },
  eyeIcon: {
    padding: Default.fixPadding * 0.5,
  },
  securityTips: {
    backgroundColor: Colors.white,
    padding: Default.fixPadding * 2,
    borderRadius: 10,
    marginBottom: Default.fixPadding * 2,
    ...Default.shadow,
  },
  tipsTitle: {
    ...Fonts.SemiBold16black,
    marginBottom: Default.fixPadding,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Default.fixPadding * 0.5,
  },
  tipText: {
    ...Fonts.Medium14grey,
    marginLeft: Default.fixPadding * 0.5,
    flex: 1,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.primary,
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.2,
    borderRadius: 10,
    minHeight: 50,
    width: "100%",
    ...Default.shadow,
    elevation: 3,
  },
  saveButtonText: {
    ...Fonts.SemiBold16white,
    marginLeft: Default.fixPadding * 0.8,
  },
  disableButton: {
    marginTop: Default.fixPadding,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.red,
    paddingHorizontal: Default.fixPadding * 2,
    paddingVertical: Default.fixPadding * 1.2,
    borderRadius: 10,
    minHeight: 50,
    width: "100%",
    ...Default.shadow,
  },
  disableButtonText: {
    ...Fonts.SemiBold16black,
    color: Colors.red,
    marginLeft: Default.fixPadding * 0.8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
