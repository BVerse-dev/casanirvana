import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Colors, Default, Fonts } from "../constants/styles";
import Ionicons from "react-native-vector-icons/Ionicons";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MyStatusBar from "../components/myStatusBar";
import AwesomeButton from "react-native-really-awesome-button";

const PinCodeScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.dir() == "rtl";

  function tr(key) {
    return t(`settingScreen:${key}`);
  }

  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showCurrentPin, setShowCurrentPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);

  const handleSavePin = () => {
    if (!currentPin) {
      Alert.alert("Error", "Please enter your current PIN");
      return;
    }
    if (!newPin || newPin.length < 4) {
      Alert.alert("Error", "New PIN must be at least 4 digits");
      return;
    }
    if (newPin !== confirmPin) {
      Alert.alert("Error", "New PIN and confirmation PIN do not match");
      return;
    }
    
    Alert.alert("Success", "PIN code updated successfully", [
      { text: "OK", onPress: () => navigation.goBack() }
    ]);
  };

  const pinInputField = (label, value, setValue, showPin, setShowPin, placeholder) => (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={[styles.textInput, { textAlign: isRtl ? "right" : "left" }]}
          value={value}
          onChangeText={setValue}
          placeholder={placeholder}
          placeholderTextColor={Colors.lightGrey}
          secureTextEntry={!showPin}
          keyboardType="numeric"
          maxLength={6}
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

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: Default.fixPadding * 2,
        }}
      >
        <View style={styles.container}>
          <View style={styles.headerSection}>
            <MaterialCommunityIcons
              name="lock-outline"
              size={50}
              color={Colors.primary}
            />
            <Text style={styles.title}>Change PIN Code</Text>
            <Text style={styles.description}>
              Update your security PIN to keep your account safe. Your PIN should be at least 4 digits long.
            </Text>
          </View>

          <View style={styles.formSection}>
            {pinInputField(
              "Current PIN",
              currentPin,
              setCurrentPin,
              showCurrentPin,
              setShowCurrentPin,
              "Enter current PIN"
            )}

            {pinInputField(
              "New PIN",
              newPin,
              setNewPin,
              showNewPin,
              setShowNewPin,
              "Enter new PIN"
            )}

            {pinInputField(
              "Confirm New PIN",
              confirmPin,
              setConfirmPin,
              showConfirmPin,
              setShowConfirmPin,
              "Confirm new PIN"
            )}
          </View>

          <View style={styles.securityTips}>
            <Text style={styles.tipsTitle}>Security Tips:</Text>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
              <Text style={styles.tipText}>Use a unique PIN that's hard to guess</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
              <Text style={styles.tipText}>Avoid using birthdays or simple patterns</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
              <Text style={styles.tipText}>Change your PIN regularly</Text>
            </View>
          </View>

          <AwesomeButton
            style={styles.saveButton}
            height={50}
            onPress={handleSavePin}
            backgroundColor={Colors.primary}
            borderRadius={10}
          >
            <Text style={styles.saveButtonText}>Update PIN</Text>
          </AwesomeButton>
        </View>
      </ScrollView>
    </View>
  );
};

export default PinCodeScreen;

const styles = StyleSheet.create({
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
    alignSelf: "center",
    width: "100%",
  },
  saveButtonText: {
    ...Fonts.SemiBold16white,
  },
});
