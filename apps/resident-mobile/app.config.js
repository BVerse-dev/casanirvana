require("dotenv/config");

module.exports = {
  expo: {
    name: "Casa Nirvana User App",
    slug: "casa-nirvana-user",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    splash: {
      image: "./assets/images/splashBg.png",
      resizeMode: "cover",
      backgroundColor: "#ffffff",
    },
    ios: {
      bundleIdentifier: "com.casanirvana.user",
      buildNumber: "1.0.0",
      supportsTablet: false,
      infoPlist: {
        NSLocationWhenInUseUsageDescription:
          "This app needs location access to share your location during emergency alerts, helping responders find you quickly.",
        NSLocationAlwaysAndWhenInUseUsageDescription:
          "This app needs location access to share your location during emergency alerts, helping responders find you quickly.",
      },
    },
    android: {
      package: "com.casanirvana.user",
      versionCode: 1,
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      permissions: [
        "android.permission.ACCESS_FINE_LOCATION",
        "android.permission.ACCESS_COARSE_LOCATION",
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
        "android.permission.VIBRATE",
        "android.permission.WAKE_LOCK",
        "android.permission.RECEIVE_BOOT_COMPLETED",
      ],
    },
    web: {
      bundler: "metro",
      output: "single",
      favicon: "./assets/images/favicon.png",
    },
    notification: {
      icon: "./assets/images/icon.png",
      color: "#000000",
      androidMode: "default",
      androidCollapsedTitle: "Casa Nirvana",
    },
    updates: {
      url: "https://u.expo.dev/74ab69b9-9b75-45e3-83ad-84c0369ac218",
    },
    runtimeVersion: {
      policy: "appVersion",
    },
    jsEngine: "jsc",
    newArchEnabled: true,
    extra: {
      EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
      EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      API_BASE_URL:
        process.env.API_BASE_URL ||
        process.env.EXPO_PUBLIC_API_BASE_URL ||
        "https://casanirvana-backend.onrender.com",
      ALLOW_PRIVATE_API_BASE_URL:
        process.env.ALLOW_PRIVATE_API_BASE_URL === "true" ||
        process.env.EXPO_PUBLIC_ALLOW_PRIVATE_API_BASE_URL === "true",
      sizemattersBaseWidth: 414,
      sizemattersBaseHeight: 896,
      eas: {
        projectId: "74ab69b9-9b75-45e3-83ad-84c0369ac218",
      },
    },
    plugins: [
      "expo-font",
      [
        "expo-image-picker",
        {
          photosPermission: "Allow Casa Nirvana to access your photos to share images in chat.",
          cameraPermission: "Allow Casa Nirvana to access your camera to take photos for chat.",
        },
      ],
      [
        "expo-av",
        {
          microphonePermission: "Allow Casa Nirvana to access your microphone to record voice messages.",
        },
      ],
      "expo-camera",
      "expo-document-picker",
      "expo-secure-store",
      "expo-web-browser",
    ],
  },
};
