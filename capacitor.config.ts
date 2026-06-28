import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.rucoy.offline",
  appName: "Rucoy Offline",
  webDir: "dist",
  server: {
    androidScheme: "https",
    allowNavigation: ["*"],
  },
  android: {
    allowMixedContent: true,
  },
};

export default config;
