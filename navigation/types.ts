import type { NavigatorScreenParams } from "@react-navigation/native";

export type TabParamList = {
  Home: undefined;
  Scan: undefined;
  Stock: undefined;
  Sale: undefined;
  Reports: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  OCRPreview: undefined;
  StockDetail: { stockId: string };
  Settings: undefined;
  Alerts: undefined;
};
