import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { AppCard } from "../../components/common/AppCard";
import { ScreenContainer } from "../../components/common/ScreenContainer";
import { ScreenHeader } from "../../components/common/ScreenHeader";
import { SPACING, scaledFontSize, useResponsiveDimensions } from "../../hooks/useResponsiveDimensions";
import { colors } from "../../utils/theme";

export function ReportsScreen() {
  const { width, isSmallPhone, isMediumPhone, isLargePhone, insets } = useResponsiveDimensions();

  // Responsive sizing
  const titleFontSize = scaledFontSize(isSmallPhone ? 24 : isMediumPhone ? 26 : 28, width);
  const textFontSize = scaledFontSize(isSmallPhone ? 14 : 16, width);
  const textLineHeight = scaledFontSize(isSmallPhone ? 20 : 22, width);
  
  const cardPadding = isSmallPhone ? SPACING.md : SPACING.lg;
  const containerPadding = isSmallPhone ? SPACING.md : SPACING.lg;

  const dynamicStyles = StyleSheet.create({
    scrollContent: {
      flexGrow: 1,
      paddingBottom: Math.max(insets.bottom, SPACING.xl),
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: SPACING.lg,
      paddingVertical: SPACING.sm,
      backgroundColor: colors.primary,
      marginBottom: SPACING.md,
    },
    headerTitle: {
      fontSize: titleFontSize,
      fontWeight: "800",
      color: "#FFFFFF",
    },
    container: {
      paddingHorizontal: containerPadding,
    },
    statCardsContainer: {
      flexDirection: isSmallPhone ? "column" : "row",
      gap: SPACING.md,
      marginBottom: SPACING.xl,
    },
    statCard: {
      flex: 1,
      padding: cardPadding,
      borderRadius: 12,
      backgroundColor: "#FFFFFF",
      borderWidth: 1,
      borderColor: "#EDEFF2",
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.04,
      shadowRadius: 8,
      elevation: 2,
    },
    statValue: {
      fontSize: scaledFontSize(isSmallPhone ? 28 : 32, width),
      fontWeight: "800",
      color: colors.primary,
      marginBottom: SPACING.xs,
    },
    statLabel: {
      fontSize: scaledFontSize(isSmallPhone ? 12 : 14, width),
      color: colors.textMuted,
      fontWeight: "500",
    },
    statTrend: {
      fontSize: scaledFontSize(11, width),
      color: "#4CAF50",
      marginTop: SPACING.xs,
    },
    sectionTitle: {
      fontSize: scaledFontSize(isSmallPhone ? 18 : 20, width),
      fontWeight: "700",
      color: colors.text,
      marginBottom: SPACING.md,
      marginTop: SPACING.xl,
    },
    card: {
      marginBottom: SPACING.md,
      padding: cardPadding,
      borderRadius: 12,
    },
    text: {
      color: colors.textMuted,
      lineHeight: textLineHeight,
      fontSize: textFontSize,
    },
    listItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: SPACING.sm,
      borderBottomWidth: 1,
      borderBottomColor: "#EDEFF2",
    },
    listItemText: {
      flex: 1,
      fontSize: textFontSize,
      color: colors.text,
    },
    listItemValue: {
      fontSize: textFontSize,
      fontWeight: "600",
      color: colors.primary,
    },
    badge: {
      backgroundColor: colors.primarySoft,
      paddingHorizontal: SPACING.sm,
      paddingVertical: SPACING.xs,
      borderRadius: 6,
      alignSelf: "flex-start",
      marginBottom: SPACING.sm,
    },
    badgeText: {
      fontSize: scaledFontSize(11, width),
      color: colors.primary,
      fontWeight: "600",
    },
  });

  // Sample data structure (you can replace with actual data from API)
  const stats = {
    totalSales: "12,450",
    lowStockItems: 8,
    expiringItems: 5,
    totalRevenue: "45,230",
  };

  const recentActivities = [
    { id: 1, title: "Sales increased by 15%", value: "+15%", trend: "up" },
    { id: 2, title: "5 items expiring in 30 days", value: "5", trend: "warning" },
    { id: 3, title: "Low stock alerts", value: "8", trend: "down" },
  ];

  return (
    <ScreenContainer contentStyle={{ padding: 0 }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={dynamicStyles.scrollContent}
      >
        <ScreenHeader title="Reports" />

        <View style={dynamicStyles.container}>
          {/* Stats Cards */}
          <View style={dynamicStyles.statCardsContainer}>
            <View style={dynamicStyles.statCard}>
              <Text style={dynamicStyles.statValue}>₹{stats.totalSales}</Text>
              <Text style={dynamicStyles.statLabel}>Today's Sales</Text>
              <Text style={dynamicStyles.statTrend}>↑ 12% from yesterday</Text>
            </View>
            <View style={dynamicStyles.statCard}>
              <Text style={dynamicStyles.statValue}>{stats.totalRevenue}</Text>
              <Text style={dynamicStyles.statLabel}>Total Revenue (MTD)</Text>
              <Text style={dynamicStyles.statTrend}>↑ 8% from last month</Text>
            </View>
          </View>

          {/* Inventory Alerts Card */}
          <AppCard style={dynamicStyles.card}>
            <View style={dynamicStyles.badge}>
              <Text style={dynamicStyles.badgeText}>Inventory Alerts</Text>
            </View>
            {recentActivities.map((item) => (
              <View key={item.id} style={dynamicStyles.listItem}>
                <Text style={dynamicStyles.listItemText}>{item.title}</Text>
                <Text style={dynamicStyles.listItemValue}>{item.value}</Text>
              </View>
            ))}
          </AppCard>

          {/* Main Content Card */}
          <AppCard style={dynamicStyles.card}>
            <Text style={dynamicStyles.sectionTitle}>Overview</Text>
            <Text style={dynamicStyles.text}>
              View sales trends, inventory movement, and expiry reports here.
            </Text>
          </AppCard>

          {/* Additional Stats */}
          <View style={dynamicStyles.statCardsContainer}>
            <View style={dynamicStyles.statCard}>
              <Text style={dynamicStyles.statValue}>{stats.lowStockItems}</Text>
              <Text style={dynamicStyles.statLabel}>Low Stock Items</Text>
              <Text style={[dynamicStyles.statTrend, { color: "#FF9800" }]}>
                Need reorder
              </Text>
            </View>
            <View style={dynamicStyles.statCard}>
              <Text style={dynamicStyles.statValue}>{stats.expiringItems}</Text>
              <Text style={dynamicStyles.statLabel}>Expiring Soon</Text>
              <Text style={[dynamicStyles.statTrend, { color: "#F44336" }]}>
                Within 30 days
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}