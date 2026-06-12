import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { ActivityIndicator, View } from "react-native";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { SignupScreen } from "../screens/auth/SignupScreen";
import { OCRPreviewScreen } from "../screens/ocr/OCRPreviewScreen";
import { StockDetailScreen } from "../screens/stock/StockDetailScreen";
import { SettingsScreen } from "../screens/settings/SettingsScreen";
import { AlertsScreen } from "../screens/alerts/AlertsScreen";
import { useAuthStore } from "../store/authStore";
import { colors } from "../utils/theme";
import { TabNavigator } from "./TabNavigator";
import type { AuthStackParamList, RootStackParamList } from "./types";

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

export function RootNavigator() {
  const { hydrated, token } = useAuthStore();

  if (!hydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <RootStack.Navigator>
      {token ? (
        <>
          <RootStack.Screen
            name="MainTabs"
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <RootStack.Screen
            name="OCRPreview"
            component={OCRPreviewScreen}
            options={{ title: "OCR Preview" }}
          />
          <RootStack.Screen
            name="StockDetail"
            component={StockDetailScreen}
            options={{ headerShown: false }}
          />
          <RootStack.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ headerShown: false }}
          />
          <RootStack.Screen
            name="Alerts"
            component={AlertsScreen}
            options={{ headerShown: false }}
          />
        </>
      ) : (
        <RootStack.Screen
          name="Auth"
          component={AuthNavigator}
          options={{ headerShown: false }}
        />
      )}
    </RootStack.Navigator>
  );
}
