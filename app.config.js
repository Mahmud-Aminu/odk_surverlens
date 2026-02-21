import "dotenv/config";

export default ({ config }) => {
  return {
    ...config,
    name: "surveilPro",
    slug: "surveilPro",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "surveilPro",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: { supportsTablet: true },
    android: {
      adaptiveIcon: {
        backgroundColor: "#1a202c",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      package: "com.mahmud002.surveilPro",
    },
    plugins: [
      "expo-router",
      "expo-font",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#1a202c",
          dark: { backgroundColor: "#1a202c" },
        },
      ],
      "expo-web-browser",
      "expo-secure-store",
    ],
    experiments: { typedRoutes: true, reactCompiler: true },
    extra: {
      eas: { projectId: "2ae7910a-5778-4492-9531-35f8b19dbd88" },
      FIREBASE_API_KEY:
        process.env.FIREBASE_API_KEY ||
        process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
      FIREBASE_AUTH_DOMAIN:
        process.env.FIREBASE_AUTH_DOMAIN ||
        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
      FIREBASE_PROJECT_ID:
        process.env.FIREBASE_PROJECT_ID ||
        process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      FIREBASE_STORAGE_BUCKET:
        process.env.FIREBASE_STORAGE_BUCKET ||
        process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
      FIREBASE_MESSAGING_SENDER_ID:
        process.env.FIREBASE_MESSAGING_SENDER_ID ||
        process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      FIREBASE_APP_ID:
        process.env.FIREBASE_APP_ID || process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    },
  };
};
