import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import Toast from "react-native-toast-message";
import { useAuthStore } from "../../store/authStore";
import { colors, spacing } from "../../utils/theme";
import type { RootStackParamList } from "../../navigation/types";

type Props = {
  title: string;
  subtitle?: string;
  hideSettings?: boolean;
  showBack?: boolean;
};

export function ScreenHeader({ title, subtitle, hideSettings, showBack }: Props) {
  const { logout } = useAuthStore();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  
  const handleSettings = () => {
    navigation.navigate("Settings");
  };

  const now = React.useMemo(() => new Date(), []);
  const dateLabel = subtitle || now.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });

  return (
    <View style={styles.header}>
      <View style={styles.headerTextContainer}>
        {showBack && (
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </Pressable>
        )}
        <View style={{ flex: 1 }}>
          <Text 
            style={styles.storeName} 
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
          >
            {title}
          </Text>
          <Text style={styles.subtitle}>{dateLabel}</Text>
        </View>
      </View>
      <View style={styles.headerButtons}>
        {!hideSettings && (
          <Pressable onPress={handleSettings} style={styles.settingsButton}>
            <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
          </Pressable>
        )}
        <Pressable onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg || 24,
    paddingVertical: spacing.sm || 12,
    backgroundColor: colors.primary,
  },
  headerTextContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginRight: spacing.sm,
  },
  backButton: {
    marginRight: spacing.sm,
    padding: spacing.xs,
  },
  storeName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  subtitle: {
    color: "#E8F5E9",
    marginTop: 2,
    fontWeight: "500",
    fontSize: 12,
  },
  headerButtons: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
    flexShrink: 0,
  },
  settingsButton: {
    padding: spacing.xs,
  },
  logoutButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  logoutText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});
