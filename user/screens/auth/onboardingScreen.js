import React, { useState, useRef, useCallback } from "react";
import {
  Text,
  View,
  ImageBackground,
  BackHandler,
  StyleSheet,
  FlatList,
  Dimensions,
  Platform,
} from "react-native";
import { Colors, Fonts, Default } from "../../constants/styles";
import { useTranslation } from "react-i18next";
import MyStatusBar from "../../components/myStatusBar";
import SnackbarToast from "../../components/snackbarToast";
import AwesomeButton from "react-native-really-awesome-button";
import { useFocusEffect } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const OnboardingScreen = ({ navigation }) => {
  const { t } = useTranslation();

  function tr(key) {
    return t(`onboardingScreen:${key}`);
  }

  const [visibleToast, setVisibleToast] = useState(false);
  const onDismissVisibleToast = () => setVisibleToast(false);

  const [exitApp, setExitApp] = useState(0);
  useFocusEffect(
    useCallback(() => {
      const backAction = () => {
        if (Platform.OS === "ios") {
          navigation.addListener("beforeRemove", (e) => {
            e.preventDefault();
          });
        } else {
          setTimeout(() => {
            setExitApp(0);
          }, 2000);

          if (exitApp === 0) {
            setExitApp(exitApp + 1);
            setVisibleToast(true);
          } else if (exitApp === 1) {
            BackHandler.exitApp();
          }
          return true;
        }      };
      const subscription = BackHandler.addEventListener("hardwareBackPress", backAction);
      navigation.addListener("gestureEnd", backAction);
      return () => {
        subscription?.remove();
        navigation.removeListener("gestureEnd", backAction);
      };
    }, [exitApp])
  );

  const ref = useRef();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  const updateCurrentSlideIndex = (e) => {
    const contentOffsetX = e.nativeEvent.contentOffset.x;
    const currentIndex = Math.round(contentOffsetX / width);
    setCurrentSlideIndex(currentIndex);
  };
  const goToNextSlide = () => {
    const nextSlideIndex = currentSlideIndex + 1;
    if (nextSlideIndex != onboardingSlides.length) {
      const offset = nextSlideIndex * width;
      ref?.current.scrollToOffset({ offset });
      setCurrentSlideIndex(currentSlideIndex + 1);
    }
  };
  const onboardingSlides = [
    {
      key: "1",
      title: tr("title1"),
      image: require("../../assets/images/image1.png"),
      description:
        "Enhance your family's security with visitor management, emergency alerts, and instant communication with guards and security staff.",
    },
    {
      key: "2",
      title: tr("title2"),
      image: require("../../assets/images/image2.png"),
      description:
        "Book cleaning, maintenance, and repair services directly through the app. Get professional help delivered right to your doorstep.",
    },
    {
      key: "3",
      title: tr("title3"),
      image: require("../../assets/images/image3.png"),
      description:
        "Stay updated with society announcements, community events, amenity bookings, and important notices from your management.",
    },
  ];

  const renderItemSlides = ({ item }) => {
    return (
      <View
        style={{
          flex: 1,
          width: width,
        }}
      >
        <View
          style={{
            flex: 1,
            alignItems: "center",
            paddingTop: Default.fixPadding,
            backgroundColor: Colors.lightSky,
          }}
        >
          <ImageBackground
            resizeMode={"contain"}
            source={item.image}
            style={{
              flex: 1,
              width: width,
            }}
          />
        </View>

        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            marginTop: Default.fixPadding * 6.7,
            marginHorizontal: Default.fixPadding * 2,
          }}
        >
          <Text
            numberOfLines={1}
            style={{
              ...Fonts.SemiBold21darkGrey,
              textAlign: "center",
              overflow: "hidden",
            }}
          >
            {item.title}
          </Text>
          <Text
            style={{
              ...Fonts.Medium14grey,
              textAlign: "center",
              marginTop: Default.fixPadding,
            }}
          >
            {item.description}
          </Text>
        </View>
      </View>
    );
  };

  const ListFooterComponent = () => {
    return (
      <View style={{ flex: 0.5 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            top: -Default.fixPadding * 13,
          }}
        >
          {onboardingSlides.map((_, index) => (
            <View
              key={index}
              style={{
                ...styles.dotIndicator,
                backgroundColor:
                  currentSlideIndex == index
                    ? Colors.primary
                    : Colors.lightGrey,
              }}
            />
          ))}
        </View>

        <View
          style={{
            marginTop: Default.fixPadding * 5,
            marginBottom: Default.fixPadding * 2,
            marginHorizontal: Default.fixPadding * 2,
          }}
        >
          <AwesomeButton
            height={50}
            onPress={() => {
              if (currentSlideIndex == onboardingSlides.length - 1) {
                return navigation.push("loginScreen");
              } else {
                goToNextSlide();
              }
            }}
            raiseLevel={1}
            stretch={true}
            borderRadius={10}
            backgroundShadow={Colors.primary}
            backgroundDarker={Colors.primary}
            backgroundColor={Colors.primary}
          >
            <Text style={{ ...Fonts.SemiBold18white }}>
              {currentSlideIndex == onboardingSlides.length - 1
                ? tr("getStarted")
                : tr("next")}
            </Text>
          </AwesomeButton>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <MyStatusBar />
      <ImageBackground
        resizeMode="stretch"
        source={require("../../assets/images/onboarding.png")}
        style={{ flex: 1 }}
      >
        <FlatList
          ref={ref}
          horizontal
          pagingEnabled
          data={onboardingSlides}
          renderItem={renderItemSlides}
          onMomentumScrollEnd={updateCurrentSlideIndex}
          showsHorizontalScrollIndicator={false}
        />
        <ListFooterComponent />
      </ImageBackground>
      <SnackbarToast
        visible={visibleToast}
        title={tr("tapBack")}
        onDismiss={onDismissVisibleToast}
      />
    </View>
  );
};

export default OnboardingScreen;

const styles = StyleSheet.create({
  dotIndicator: {
    marginHorizontal: Default.fixPadding * 0.6,
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
