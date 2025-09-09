import 'dotenv/config';

export default {
  expo: {
    name: "Casa Nirvana User App",
    slug: "casa-nirvana-user",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "myapp",
    userInterfaceStyle: "automatic",
    main: "App.js",
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "cover",
      backgroundColor: "#ffffff"
    },
    ios: {
      bundleIdentifier: "com.casanirvana.user",
      buildNumber: "1.0.0",
      supportsTablet: false
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.casanirvana.user",
      permissions: [
        "android.permission.CAMERA",
        "android.permission.RECORD_AUDIO",
        "android.permission.VIBRATE",
        "android.permission.WAKE_LOCK",
        "android.permission.RECEIVE_BOOT_COMPLETED"
      ]
    },
    notification: {
      icon: "./assets/images/icon.png",
      color: "#000000",
      androidMode: "default",
      androidCollapsedTitle: "Casa Nirvana"
    },
    extra: {
      // Hardcode the values directly instead of using environment variables
      supabaseUrl: "https://pswnlowvmdgeifhxilao.supabase.co",
      supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzd25sb3d2bWRnZWlmaHhpbGFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3ODE5MTYsImV4cCI6MjA2MzM1NzkxNn0.QOqSJr0qxefrIwM087IKlJJYWwMLCHV_v5iEb-SI7S0",
      sizemattersBaseWidth: 414,
      sizemattersBaseHeight: 896,
      eas: {
        projectId: "74ab69b9-9b75-45e3-83ad-84c0369ac218"
      }
    },
    plugins: [
      "expo-web-browser"
    ]
  }
};
