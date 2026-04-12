import Constants from "expo-constants";

const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
const manifestUrl = Constants.expoConfig?.extra?.apiBaseUrl as
  | string
  | undefined;
const productionUrl = "https://expo-backend-f9es.vercel.app/";

const isPlaceholder = (url?: string) =>
  Boolean(url && /example-medstock-api\.com/i.test(url));

const configuredUrl =
  (envUrl && !isPlaceholder(envUrl) ? envUrl : undefined) ||
  (manifestUrl && !isPlaceholder(manifestUrl) ? manifestUrl : undefined) ||
  productionUrl;

export const API_BASE_URL = configuredUrl;
