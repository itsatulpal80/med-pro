import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { AppButton } from "../../components/common/AppButton";
import { AppCard } from "../../components/common/AppCard";
import { ScreenContainer } from "../../components/common/ScreenContainer";
import type { RootStackParamList, TabParamList } from "../../navigation/types";
import { dashboardApi } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { useStockStore } from "../../store/stockStore";
import { colors, radius, spacing } from "../../utils/theme";
import type { DashboardResponse } from "../../utils/types";

type Props = BottomTabScreenProps<TabParamList, "Home">;

export function DashboardScreen({ navigation }: Props) {
  const rootNavigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { items, fetchStock } = useStockStore();
  const { logout, user } = useAuthStore();
  const [backendStats, setBackendStats] = React.useState<DashboardResponse | null>(
    null,
  );
  const now = React.useMemo(() => new Date(), []);
  const userName = user?.name?.trim() || "User";
  const storeTitle = `${userName}'s Medical Store`;
  const greeting =
    now.getHours() < 12
      ? "Good Morning"
      : now.getHours() < 18
        ? "Good Afternoon"
        : "Good Evening";
  const dateLabel = now.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "2-digit",
    month: "short",
  });

  React.useEffect(() => {
    fetchStock().catch(() => {
      Toast.show({ type: "error", text1: "Unable to refresh dashboard stats" });
    });
    dashboardApi
      .getStats()
      .then(({ data }) => setBackendStats(data))
      .catch(() => {
        Toast.show({ type: "error", text1: "Unable to load dashboard summary" });
      });
  }, [fetchStock]);

  const stats = useMemo(() => {
    const lowStockCount = items.filter((i) => i.quantity <= 10).length;
    const expiryAlerts = items.filter((i) => {
      const expiry = new Date(i.expiry).getTime();
      const thirtyDays = 1000 * 60 * 60 * 24 * 30;
      return expiry - Date.now() <= thirtyDays;
    }).length;

    return {
      todaysSales: backendStats?.totalSales ?? 0,
      lowStockCount: backendStats?.lowStockCount ?? lowStockCount,
      expiryAlerts: backendStats?.expiryCount ?? expiryAlerts,
    };
  }, [backendStats, items]);

  const quickActions = [
    { label: "Scan Purchase Bill", onPress: () => navigation.navigate("Scan") },
    { label: "New Sale", onPress: () => navigation.navigate("Sale") },
    { label: "View Stock", onPress: () => navigation.navigate("Stock") },
    {
      label: "Expiry Alerts",
      onPress: () =>
        Toast.show({
          type: "info",
          text1: `${stats.expiryAlerts} alerts found`,
        }),
    },
  ];

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <View>
          <Text style={styles.storeName}>{storeTitle}</Text>
          <Text style={styles.subtitle}>{`${dateLabel} · ${greeting}, ${userName}`}</Text>
        </View>
        <AppButton title="Logout" variant="ghost" onPress={logout} />
      </View>

      <View style={styles.statsWrap}>
        <StatCard
          title="Today's Sales"
          value={`Rs ${stats.todaysSales}`}
          icon="cash-outline"
          tint="#D5F1E2"
        />
        <StatCard
          title="Low Stock"
          value={`${stats.lowStockCount}`}
          subtitle="Items need reorder"
          icon="pulse-outline"
          tint="#F7EACD"
        />
      </View>

      <AppCard style={styles.alertCard}>
        <View style={styles.alertIconWrap}>
          <Ionicons name="alert-circle-outline" size={16} color="#E24B4B" />
        </View>
        <View style={styles.alertTextWrap}>
          <Text style={styles.alertTitle}>Expiry Alert!</Text>
          <Text style={styles.alertSubtitle}>
            {stats.expiryAlerts} medicines expiring soon
          </Text>
        </View>
        <View style={styles.alertBadge}>
          <Text style={styles.alertBadgeText}>{stats.expiryAlerts}</Text>
        </View>
      </AppCard>

      <View style={styles.quickActionCard}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <QuickActionRow
            title={quickActions[0].label}
            subtitle="Capture and auto-extract medicine data"
            icon="camera-outline"
            prominent
            onPress={quickActions[0].onPress}
          />
          <QuickActionRow
            title={quickActions[1].label}
            subtitle="Create sale entry with auto-deduction"
            icon="cart-outline"
            onPress={quickActions[1].onPress}
          />
          <QuickActionRow
            title={quickActions[2].label}
            subtitle="Check batch-wise inventory"
            icon="cube-outline"
            onPress={quickActions[2].onPress}
          />
          <QuickActionRow
            title="Expiry & Alerts"
            subtitle="Manage expired and low stock items"
            icon="warning-outline"
            badge={stats.expiryAlerts}
            onPress={quickActions[3].onPress}
          />
          <QuickActionRow
            title="Manual OCR Preview"
            subtitle="Validate parsed bill output"
            icon="document-text-outline"
            onPress={() => rootNavigation.navigate("OCRPreview")}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

function StatCard({
  title,
  value,
  icon,
  tint,
  subtitle,
}: {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  subtitle?: string;
}) {
  return (
    <AppCard style={styles.statCard}>
      <View style={styles.statRow}>
        <Text style={styles.statTitle}>{title}</Text>
        <View style={[styles.statIconWrap, { backgroundColor: tint }]}>
          <Ionicons name={icon} size={18} color={colors.primary} />
        </View>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      {subtitle ? <Text style={styles.statSubtitle}>{subtitle}</Text> : null}
    </AppCard>
  );
}

function QuickActionRow({
  title,
  subtitle,
  icon,
  prominent,
  badge,
  onPress,
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  prominent?: boolean;
  badge?: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.actionRow, prominent && styles.actionRowPrimary]}
      onPress={onPress}
    >
      <View style={[styles.actionIconWrap, prominent && styles.actionIconPrimary]}>
        <Ionicons
          name={icon}
          size={18}
          color={prominent ? "#FFFFFF" : colors.primary}
        />
      </View>
      <View style={styles.actionTextWrap}>
        <Text style={[styles.actionTitle, prominent && styles.actionTitlePrimary]}>
          {title}
        </Text>
        <Text
          style={[
            styles.actionSubtitle,
            prominent && styles.actionSubtitlePrimary,
          ]}
        >
          {subtitle}
        </Text>
      </View>
      {badge ? (
        <View style={styles.actionBadge}>
          <Text style={styles.actionBadgeText}>{badge}</Text>
        </View>
      ) : null}
      <Ionicons
        name="chevron-forward"
        size={18}
        color={prominent ? "#FFFFFF" : colors.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.sm,
  },
  storeName: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: "500",
    fontSize: 12,
  },
  statsWrap: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EDEFF2",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statTitle: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    marginTop: 4,
    color: colors.text,
    fontWeight: "800",
    fontSize: 22,
  },
  statSubtitle: {
    color: colors.textMuted,
    marginTop: 2,
    fontSize: 11,
  },
  alertCard: {
    backgroundColor: "#FCEEEE",
    borderColor: "#F5CDCD",
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  alertIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FAD6D6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.sm,
  },
  alertTextWrap: {
    flex: 1,
  },
  alertTitle: {
    color: "#D64545",
    fontWeight: "700",
    fontSize: 13,
  },
  alertSubtitle: {
    color: "#8B5757",
    fontSize: 12,
  },
  alertBadge: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E53935",
    paddingHorizontal: 8,
  },
  alertBadgeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
  quickActionCard: {
    backgroundColor: "transparent",
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 18,
  },
  quickActions: {
    marginTop: 8,
    gap: 10,
  },
  actionRow: {
    minHeight: 62,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  actionRowPrimary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft,
  },
  actionIconPrimary: {
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  actionTextWrap: {
    flex: 1,
  },
  actionTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 14,
  },
  actionTitlePrimary: {
    color: "#FFFFFF",
  },
  actionSubtitle: {
    color: colors.textMuted,
    fontSize: 11,
    marginTop: 1,
  },
  actionSubtitlePrimary: {
    color: "#E8FFF4",
  },
  actionBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E53935",
    marginRight: 4,
    paddingHorizontal: 6,
  },
  actionBadgeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
  },
});
