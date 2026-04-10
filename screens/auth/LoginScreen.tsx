import { NativeStackScreenProps } from "@react-navigation/native-stack";
import axios from "axios";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { AppButton } from "../../components/common/AppButton";
import { AppCard } from "../../components/common/AppCard";
import { AppInput } from "../../components/common/AppInput";
import { ScreenContainer } from "../../components/common/ScreenContainer";
import type { AuthStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../store/authStore";
import { colors, spacing } from "../../utils/theme";

type Props = NativeStackScreenProps<AuthStackParamList, "Login">;

export function LoginScreen({ navigation }: Props) {
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading } = useAuthStore();

  const onLogin = async () => {
    if (!mobile || !password) {
      Toast.show({ type: "error", text1: "Enter mobile number and password" });
      return;
    }
    try {
      await login(mobile, password);
      Toast.show({ type: "success", text1: "Welcome back" });
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string) || "Login failed"
        : "Login failed";
      Toast.show({ type: "error", text1: message });
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>MedStock Pro</Text>
        <Text style={styles.subtitle}>
          Pharmacy inventory at your fingertips
        </Text>
      </View>

      <AppCard>
        <View style={styles.form}>
          <AppInput
            label="Mobile Number"
            keyboardType="phone-pad"
            value={mobile}
            onChangeText={setMobile}
          />
          <AppInput
            label="Password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <AppButton title="Login" onPress={onLogin} loading={loading} />
          <AppButton
            title="Create New Account"
            variant="ghost"
            onPress={() => navigation.navigate("Signup")}
          />
        </View>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
  },
  form: {
    gap: spacing.md,
  },
});
