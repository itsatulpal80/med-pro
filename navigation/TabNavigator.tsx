import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import React from "react";
import { Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StockScreen } from "../screens/stock/StockScreen";
import { DashboardScreen } from "../screens/tabs/DashboardScreen";
import { ReportsScreen } from "../screens/tabs/ReportsScreen";
import { SaleScreen } from "../screens/tabs/SaleScreen";
import { ScanScreen } from "../screens/tabs/ScanScreen";
import { colors } from "../utils/theme";
import type { TabParamList } from "./types";

const Tab = createBottomTabNavigator<TabParamList>();

export function TabNavigator() {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginBottom: Platform.OS === "ios" ? 0 : 2,
        },
        tabBarStyle: {
          height: 58 + Math.max(insets.bottom, 8),
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        tabBarIcon: ({ color, size, focused }) => {
          const iconMap: Record<
            keyof TabParamList,
            keyof typeof Ionicons.glyphMap
          > = {
            Home: focused ? "home" : "home-outline",
            Scan: focused ? "scan" : "scan-outline",
            Stock: focused ? "cube" : "cube-outline",
            Sale: focused ? "cart" : "cart-outline",
            Reports: focused ? "bar-chart" : "bar-chart-outline",
          };
          return (
            <Ionicons name={iconMap[route.name]} size={size} color={color} />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={DashboardScreen} />
      <Tab.Screen name="Scan" component={ScanScreen} />
      <Tab.Screen name="Stock" component={StockScreen} />
      <Tab.Screen name="Sale" component={SaleScreen} />
      <Tab.Screen name="Reports" component={ReportsScreen} />
    </Tab.Navigator>
  );
}
