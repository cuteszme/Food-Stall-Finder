export default {
  name: "Food Stall Finder",
  slug: "food-stall-finder",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#ffffff"
  },
  updates: {
    fallbackToCacheTimeout: 0
  },
  assetBundlePatterns: [
    "**/*"
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.yourcompany.foodstallfinder"
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#FFFFFF"
    },
    package: "com.yourcompany.foodstallfinder"
  },
  web: {
    favicon: "./assets/favicon.png"
  },
  extra: {
    // Add any extra configuration here
    eas: {
      projectId: "your-project-id"
    }
  }
};