import Constants from "expo-constants";
import { Platform } from "react-native";

const webHost =
  Platform.OS === "web" && typeof window !== "undefined"
    ? window.location.hostname || "localhost"
    : "localhost";

const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const manifestUrl = Constants.expoConfig?.extra?.apiBaseUrl as string | undefined;

const isPlaceholder = (url?: string) =>
  Boolean(url && /example-medstock-api\.com/i.test(url));

const configuredUrl =
  (Platform.OS === "web" ? `http://${webHost}:5000` : undefined) ||
  (envUrl && !isPlaceholder(envUrl) ? envUrl : undefined) ||
  (manifestUrl && !isPlaceholder(manifestUrl) ? manifestUrl : undefined) ||
  "http://localhost:5000";

export const API_BASE_URL = configuredUrl;
