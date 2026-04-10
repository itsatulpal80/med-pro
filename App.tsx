import { DefaultTheme, NavigationContainer } from "@react-navigation/native";
import React, { useEffect } from "react";
import Toast from "react-native-toast-message";
import { RootNavigator } from "./navigation/RootNavigator";
import { useAuthStore } from "./store/authStore";
import { colors } from "./utils/theme";

const appTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.card,
    text: colors.text,
    border: colors.border,
    primary: colors.primary,
  },
};

export default function App() {
  const hydrate = useAuthStore((state) => state.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <>
      <NavigationContainer
        theme={appTheme}
        documentTitle={{
          formatter: (options, route) =>
            options?.title ?? route?.name ?? "MedStock Pro",
        }}
      >
        <RootNavigator />
      </NavigationContainer>
      <Toast />
    </>
  );
}
