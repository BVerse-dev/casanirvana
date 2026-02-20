import {
  Text,
  View,
  TouchableOpacity,
  BackHandler,
  ScrollView,
  StyleSheet,
  Alert,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Colors, Fonts, Default } from "../constants/styles";
import MyStatusBar from "../components/myStatusBar";
import AwesomeButton from "react-native-really-awesome-button";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import { useAuth } from "../contexts/AuthContext";
import {
  loadUserAppSettings,
  saveUserLanguagePreference,
} from "../services/settingsPersistenceService";

const LanguageScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();

  const isRtl = i18n.dir() === "rtl";

  function tr(key) {
    return t(`languageScreen:${key}`);
  }

  const backAction = useCallback(() => {
    navigation.goBack();
    return true;
  }, [navigation]);
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      backAction
    );
    return () => backHandler.remove();
  }, [backAction]);

  const [selectedLanguage, setSelectedLanguage] = useState(i18n.resolvedLanguage || "en");
  const [activeLanguage, setActiveLanguage] = useState(i18n.resolvedLanguage || "en");
  const [isSaving, setIsSaving] = useState(false);
  const [isLanguageLoading, setIsLanguageLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const hydrateLanguage = async () => {
      try {
        const appSettings = await loadUserAppSettings(user?.id, i18n.resolvedLanguage || "en");
        const persistedLanguage = appSettings.language || i18n.resolvedLanguage || "en";

        if (isMounted) {
          setSelectedLanguage(persistedLanguage);
          setActiveLanguage(persistedLanguage);
        }

        if (persistedLanguage !== i18n.resolvedLanguage) {
          await i18n.changeLanguage(persistedLanguage);
        }
      } catch (error) {
        console.error("Failed to load language preference:", error);
      } finally {
        if (isMounted) {
          setIsLanguageLoading(false);
        }
      }
    };

    hydrateLanguage();

    return () => {
      isMounted = false;
    };
  }, [user?.id, i18n]);

  async function onChangeLang(lang) {
    try {
      await saveUserLanguagePreference(user?.id, lang);
      await i18n.changeLanguage(lang);
      setActiveLanguage(lang);
    } catch (error) {
      console.error("Failed to update language:", error);
      throw error;
    }
  }

  const onDisableHandler =
    isSaving || isLanguageLoading || activeLanguage === selectedLanguage;

  function languageOpt({ name, lang }) {
    return (
      <TouchableOpacity
        onPress={() => setSelectedLanguage(lang)}
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          ...styles.mainTouchableOpacity,
        }}
      >
        <Text
          style={{
            ...Fonts.SemiBold16black,
          }}
        >
          {name}
        </Text>
        <MaterialCommunityIcons
          name={selectedLanguage === lang ? "record-circle" : "circle-outline"}
          size={24}
          color={selectedLanguage === lang ? Colors.primary : Colors.lightGrey}
        />
      </TouchableOpacity>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.white }}>
      <MyStatusBar />
      <View
        style={{
          flexDirection: isRtl ? "row-reverse" : "row",
          alignItems: "center",
          paddingVertical: Default.fixPadding * 1.2,
          paddingHorizontal: Default.fixPadding * 2,
        }}
      >
        <TouchableOpacity onPress={() => navigation.pop()}>
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
          {tr("language")}
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View
          style={{
            marginTop: Default.fixPadding * 0.8,
          }}
        >
          {languageOpt({ name: "English", lang: "en" })}
          {languageOpt({ name: "हिन्दी", lang: "hi" })}
          {languageOpt({ name: "bahasa Indonesia", lang: "id" })}
          {languageOpt({ name: "中国人", lang: "ch" })}
          {languageOpt({ name: "عربي", lang: "ar" })}
          {languageOpt({ name: "Français", lang: "fr" })}
          {languageOpt({ name: "Português", lang: "po" })}
          {languageOpt({ name: "Italiano", lang: "it" })}
          {languageOpt({ name: "Türkçe", lang: "tu" })}
        </View>
      </ScrollView>

      <View
        style={{
          margin: Default.fixPadding * 2,
        }}
      >
        <AwesomeButton
          disabled={onDisableHandler}
          progress
          height={50}
          progressLoadingTime={1000}
          onPress={async (next) => {
            setIsSaving(true);
            try {
              await onChangeLang(selectedLanguage);
              next();
              navigation.pop();
            } catch (_error) {
              next();
              Alert.alert("Error", "Unable to save language preference. Please try again.");
            } finally {
              setIsSaving(false);
            }
          }}
          raiseLevel={1}
          stretch={true}
          borderRadius={10}
          backgroundShadow={Colors.primary}
          backgroundDarker={Colors.primary}
          backgroundColor={Colors.primary}
        >
          <Text style={{ ...Fonts.SemiBold18white }}>{tr("update")}</Text>
        </AwesomeButton>
      </View>
    </View>
  );
};

export default LanguageScreen;

const styles = StyleSheet.create({
  mainTouchableOpacity: {
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Default.fixPadding * 1.3,
    paddingHorizontal: Default.fixPadding * 1.5,
    marginHorizontal: Default.fixPadding * 2,
    marginBottom: Default.fixPadding * 2,
    borderRadius: 10,
    backgroundColor: Colors.white,
    ...Default.shadow,
  },
});
