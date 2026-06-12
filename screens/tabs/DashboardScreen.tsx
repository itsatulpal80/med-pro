import { Ionicons } from "@expo/vector-icons";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { AppCard } from "../../components/common/AppCard";
import { ScreenContainer } from "../../components/common/ScreenContainer";
import { ScreenHeader } from "../../components/common/ScreenHeader";
import { SPACING, scaledFontSize, useResponsiveDimensions } from "../../hooks/useResponsiveDimensions";
import type { RootStackParamList, TabParamList } from "../../navigation/types";
import { dashboardApi } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { useStockStore } from "../../store/stockStore";
import { colors } from "../../utils/theme";
import type { DashboardResponse } from "../../utils/types";

type Props = BottomTabScreenProps<TabParamList, "Home">;

export function DashboardScreen({ navigation }: Props) {
  const { width, height, isSmallPhone, isMediumPhone, isLargePhone, isPortrait, insets } = useResponsiveDimensions();
  const rootNavigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { items, fetchStock } = useStockStore();
  const { logout, user } = useAuthStore();
  const [backendStats, setBackendStats] = React.useState<DashboardResponse | null>(null);
  const now = React.useMemo(() => new Date(), []);
  const userName = user?.name?.trim() || "User";
  const storeTitle = `${userName}'s Medical Store`;
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
      onPress: () => rootNavigation.navigate("Alerts"),
    },
  ];

  // Responsive sizing
  const headerFontSize = scaledFontSize(isSmallPhone ? 18 : 20, width);
  const subtitleFontSize = scaledFontSize(isSmallPhone ? 10 : 11, width);
  const statValueFontSize = scaledFontSize(isSmallPhone ? 20 : 24, width);
  const sectionTitleFontSize = scaledFontSize(isSmallPhone ? 16 : 18, width);
  const actionTitleFontSize = scaledFontSize(isSmallPhone ? 13 : 14, width);
  const iconSize = isSmallPhone ? 16 : isMediumPhone ? 18 : 20;
  
  const cardPadding = isSmallPhone ? SPACING.sm : SPACING.md;
  const statsGap = isSmallPhone ? SPACING.sm : SPACING.md;

  const dynamicStyles = StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      paddingBottom: Math.max(insets.bottom, SPACING.xl),
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: SPACING.sm,
      marginBottom: SPACING.md,
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm, // Reduced from md to sm
      backgroundColor: colors.primary,
    },
    headerTextContainer: {
      flex: 1,
      marginRight: SPACING.sm,
    },
    storeName: {
      fontSize: headerFontSize,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    subtitle: {
      color: "#E8F5E9",
      marginTop: 2, // Reduced from xs
      fontWeight: "500",
      fontSize: subtitleFontSize,
    },
    headerButtons: {
      flexDirection: "row",
      gap: SPACING.sm,
      alignItems: "center",
      flexShrink: 0,
    },
    settingsButton: {
      padding: SPACING.xs,
    },
    logoutButton: {
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
    },
    logoutText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: subtitleFontSize,
    },
    statsWrap: {
      flexDirection: "row",
      gap: statsGap,
      paddingHorizontal: SPACING.lg,
      marginBottom: SPACING.md,
      marginTop: SPACING.md,
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
      padding: cardPadding,
      backgroundColor: "#FFFFFF",
    },
    statRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    statTitle: {
      color: colors.textMuted,
      fontSize: scaledFontSize(isSmallPhone ? 10 : 11, width),
      fontWeight: "600",
    },
    statIconWrap: {
      width: isSmallPhone ? 28 : 32,
      height: isSmallPhone ? 28 : 32,
      borderRadius: 9,
      alignItems: "center",
      justifyContent: "center",
    },
    statValue: {
      marginTop: SPACING.xs,
      color: colors.text,
      fontWeight: "800",
      fontSize: statValueFontSize,
    },
    statSubtitle: {
      color: colors.textMuted,
      marginTop: 2,
      fontSize: scaledFontSize(10, width),
    },
    alertCard: {
      backgroundColor: "#FCEEEE",
      borderColor: "#F5CDCD",
      borderRadius: 12,
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: isSmallPhone ? SPACING.sm : SPACING.md,
      paddingHorizontal: SPACING.lg,
      marginHorizontal: SPACING.lg,
      marginBottom: SPACING.md,
    },
    alertIconWrap: {
      width: isSmallPhone ? 24 : 28,
      height: isSmallPhone ? 24 : 28,
      borderRadius: isSmallPhone ? 12 : 14,
      backgroundColor: "#FAD6D6",
      alignItems: "center",
      justifyContent: "center",
      marginRight: SPACING.sm,
    },
    alertTextWrap: {
      flex: 1,
    },
    alertTitle: {
      color: "#D64545",
      fontWeight: "700",
      fontSize: scaledFontSize(isSmallPhone ? 12 : 13, width),
    },
    alertSubtitle: {
      color: "#8B5757",
      fontSize: scaledFontSize(isSmallPhone ? 11 : 12, width),
    },
    alertBadge: {
      minWidth: isSmallPhone ? 24 : 28,
      height: isSmallPhone ? 24 : 28,
      borderRadius: isSmallPhone ? 12 : 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#E53935",
      paddingHorizontal: isSmallPhone ? 6 : 8,
    },
    alertBadgeText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: scaledFontSize(isSmallPhone ? 11 : 12, width),
    },
    quickActionCard: {
      backgroundColor: "transparent",
      paddingHorizontal: SPACING.lg,
    },
    sectionTitle: {
      color: colors.text,
      fontWeight: "700",
      fontSize: sectionTitleFontSize,
      marginBottom: SPACING.sm,
    },
    quickActions: {
      marginTop: SPACING.xs,
      gap: SPACING.sm,
    },
    actionRow: {
      minHeight: isSmallPhone ? 56 : 62,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: "#FFFFFF",
      paddingHorizontal: SPACING.md,
      flexDirection: "row",
      alignItems: "center",
      gap: SPACING.sm,
    },
    actionRowPrimary: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    actionIconWrap: {
      width: isSmallPhone ? 28 : 32,
      height: isSmallPhone ? 28 : 32,
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
      fontSize: actionTitleFontSize,
    },
    actionTitlePrimary: {
      color: "#FFFFFF",
    },
    actionSubtitle: {
      color: colors.textMuted,
      fontSize: scaledFontSize(isSmallPhone ? 10 : 11, width),
      marginTop: 1,
    },
    actionSubtitlePrimary: {
      color: "#E8FFF4",
    },
    actionBadge: {
      minWidth: 20,
      height: 20,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#E53935",
      marginRight: 4,
      paddingHorizontal: isSmallPhone ? 4 : 6,
    },
    actionBadgeText: {
      color: "#FFFFFF",
      fontWeight: "700",
      fontSize: scaledFontSize(10, width),
    },
  });

  const handleSettings = () => {
    Toast.show({
      type: "info",
      text1: "Settings",
      text2: "Settings page coming soon!",
    });
  };

  return (
    <ScreenContainer contentStyle={{ padding: 0 }}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={dynamicStyles.scrollContent}
      >
        <ScreenHeader title={storeTitle} subtitle={dateLabel} />

        <View style={dynamicStyles.statsWrap}>
          <StatCard
            title="Today's Sales"
            value={`₹${stats.todaysSales}`}
            icon="cash-outline"
            tint="#D5F1E2"
            isSmallPhone={isSmallPhone}
            width={width}
          />
          <StatCard
            title="Low Stock"
            value={`${stats.lowStockCount}`}
            subtitle="Items need reorder"
            icon="pulse-outline"
            tint="#F7EACD"
            isSmallPhone={isSmallPhone}
            width={width}
          />
        </View>

        <AppCard style={dynamicStyles.alertCard}>
          <View style={dynamicStyles.alertIconWrap}>
            <Ionicons name="alert-circle-outline" size={iconSize} color="#E24B4B" />
          </View>
          <View style={dynamicStyles.alertTextWrap}>
            <Text style={dynamicStyles.alertTitle}>Expiry Alert!</Text>
            <Text style={dynamicStyles.alertSubtitle}>
              {stats.expiryAlerts} medicines expiring soon
            </Text>
          </View>
          <View style={dynamicStyles.alertBadge}>
            <Text style={dynamicStyles.alertBadgeText}>{stats.expiryAlerts}</Text>
          </View>
        </AppCard>

        <View style={dynamicStyles.quickActionCard}>
          <Text style={dynamicStyles.sectionTitle}>Quick Actions</Text>
          <View style={dynamicStyles.quickActions}>
            <QuickActionRow
              title={quickActions[0].label}
              subtitle="Capture and auto-extract medicine data"
              icon="camera-outline"
              prominent
              onPress={quickActions[0].onPress}
              isSmallPhone={isSmallPhone}
              width={width}
            />
            <QuickActionRow
              title={quickActions[1].label}
              subtitle="Create sale entry with auto-deduction"
              icon="cart-outline"
              onPress={quickActions[1].onPress}
              isSmallPhone={isSmallPhone}
              width={width}
            />
            <QuickActionRow
              title={quickActions[2].label}
              subtitle="Check batch-wise inventory"
              icon="cube-outline"
              onPress={quickActions[2].onPress}
              isSmallPhone={isSmallPhone}
              width={width}
            />
            <QuickActionRow
              title="Expiry & Alerts"
              subtitle="Manage expired and low stock items"
              icon="warning-outline"
              badge={stats.expiryAlerts}
              onPress={quickActions[3].onPress}
              isSmallPhone={isSmallPhone}
              width={width}
            />
            <QuickActionRow
              title="Manual OCR Preview"
              subtitle="Validate parsed bill output"
              icon="document-text-outline"
              onPress={() => rootNavigation.navigate("OCRPreview")}
              isSmallPhone={isSmallPhone}
              width={width}
            />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function StatCard({
  title,
  value,
  icon,
  tint,
  subtitle,
  isSmallPhone,
  width,
}: {
  title: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  tint: string;
  subtitle?: string;
  isSmallPhone: boolean;
  width: number;
}) {
  const iconSize = isSmallPhone ? 16 : 18;
  const statValueFontSize = scaledFontSize(isSmallPhone ? 20 : 24, width);

  return (
    <AppCard style={styles.statCard}>
      <View style={styles.statRow}>
        <Text style={styles.statTitle}>{title}</Text>
        <View style={[styles.statIconWrap, { backgroundColor: tint }]}>
          <Ionicons name={icon} size={iconSize} color={colors.primary} />
        </View>
      </View>
      <Text style={[styles.statValue, { fontSize: statValueFontSize }]}>{value}</Text>
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
  isSmallPhone,
  width,
}: {
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  prominent?: boolean;
  badge?: number;
  onPress: () => void;
  isSmallPhone: boolean;
  width: number;
}) {
  const iconSize = isSmallPhone ? 16 : 18;
  const actionTitleFontSize = scaledFontSize(isSmallPhone ? 13 : 14, width);

  return (
    <Pressable
      style={[styles.actionRow, prominent && styles.actionRowPrimary]}
      onPress={onPress}
    >
      <View style={[styles.actionIconWrap, prominent && styles.actionIconPrimary]}>
        <Ionicons
          name={icon}
          size={iconSize}
          color={prominent ? "#FFFFFF" : colors.primary}
        />
      </View>
      <View style={styles.actionTextWrap}>
        <Text style={[styles.actionTitle, prominent && styles.actionTitlePrimary, { fontSize: actionTitleFontSize }]}>
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
        size={iconSize}
        color={prominent ? "#FFFFFF" : colors.textMuted}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
    padding: SPACING.md,
    backgroundColor: "#FFFFFF",
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
    marginTop: SPACING.xs,
    color: colors.text,
    fontWeight: "800",
  },
  statSubtitle: {
    color: colors.textMuted,
    marginTop: 2,
    fontSize: 10,
  },
  actionRow: {
    minHeight: 62,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: SPACING.md,
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
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
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E53935",
    marginRight: 4,
    paddingHorizontal: 6,
  },
  actionBadgeText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 10,
  },
});