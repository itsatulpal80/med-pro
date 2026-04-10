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

type Props = NativeStackScreenProps<AuthStackParamList, "Signup">;

export function SignupScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const { signup, loading } = useAuthStore();

  const onSignup = async () => {
    if (!name || !mobile || !password) {
      Toast.show({ type: "error", text1: "Please fill all fields" });
      return;
    }
    try {
      await signup(name, mobile, password);
      Toast.show({ type: "success", text1: "Account created" });
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string) || "Signup failed"
        : "Signup failed";
      Toast.show({ type: "error", text1: message });
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Register your pharmacy on MedStock Pro
        </Text>
      </View>
      <AppCard>
        <View style={styles.form}>
          <AppInput label="Owner Name" value={name} onChangeText={setName} />
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
          <AppButton title="Sign Up" onPress={onSignup} loading={loading} />
          <AppButton
            title="Already have an account? Login"
            variant="ghost"
            onPress={() => navigation.goBack()}
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
    fontSize: 30,
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
