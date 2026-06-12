import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";

const formatExpiryDate = (dateStr: string) => {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
};

import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { AppCard } from "../../components/common/AppCard";
import { ScreenContainer } from "../../components/common/ScreenContainer";
import { ScreenHeader } from "../../components/common/ScreenHeader";
import type { RootStackParamList } from "../../navigation/types";
import { useAuthStore } from "../../store/authStore";
import { useStockStore } from "../../store/stockStore";
import { colors, radius, spacing } from "../../utils/theme";
import type { Medicine } from "../../utils/types";

type Props = NativeStackScreenProps<RootStackParamList, "StockDetail">;

export function StockDetailScreen({ route, navigation }: Props) {
  const { stockId } = route.params;
  const { user } = useAuthStore();
  const { fetchStockDetail } = useStockStore();
  const [item, setItem] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);
  const storeTitle = `${user?.name?.trim() || "My"}'s Medical Store`;

  useEffect(() => {
    fetchStockDetail(stockId)
      .then(setItem)
      .catch(() =>
        Toast.show({ type: "error", text1: "Failed to load stock details" }),
      )
      .finally(() => setLoading(false));
  }, [fetchStockDetail, stockId]);

  if (loading) {
    return (
      <ScreenContainer contentStyle={{ padding: 0 }}>
        <ScreenHeader title="Stock Management" subtitle={storeTitle} />
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loaderText}>Loading details...</Text>
        </View>
      </ScreenContainer>
    );
  }

  if (!item) {
    return (
      <ScreenContainer contentStyle={{ padding: 0 }}>
        <ScreenHeader title="Stock Management" subtitle={storeTitle} />
        <View style={styles.loaderWrap}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>No details available</Text>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={16} color={colors.primary} />
            <Text style={styles.backButtonText}>Go Back</Text>
          </Pressable>
        </View>
      </ScreenContainer>
    );
  }

  const totalBatches = item.batches?.length ?? 0;

  return (
    <ScreenContainer contentStyle={{ padding: 0 }} scroll={false}>
      <ScreenHeader title="Stock Management" subtitle={storeTitle} />

      <View style={styles.contentContainer}>
        {/* Back to list */}
        <Pressable style={styles.backRow} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={16} color={colors.primaryDark} />
          <Text style={styles.backText}>Back to list</Text>
        </Pressable>

        {/* Product Info Card */}
        <AppCard style={styles.productCard}>
          <View style={styles.productHeader}>
            <View style={styles.productInfo}>
              <Text
                style={styles.productName}
                numberOfLines={2}
                adjustsFontSizeToFit
                minimumFontScale={0.75}
              >
                {item.name}
              </Text>
              <Text style={styles.manufacturer}>Unknown Manufacturer</Text>
            </View>
            <View style={styles.productIconWrap}>
              <Ionicons name="medkit" size={20} color={colors.primary} />
            </View>
          </View>

          <View style={styles.countsRow}>
            <View style={styles.countBox}>
              <Text style={styles.countLabel}>Total Stock</Text>
              <Text style={styles.countValue}>{item.quantity}</Text>
            </View>
            <View style={styles.countBox}>
              <Text style={styles.countLabel}>Batches</Text>
              <Text style={styles.countValue}>{totalBatches}</Text>
            </View>
          </View>
        </AppCard>

        {/* Batch-wise Stock Section Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionDot} />
          <Text style={styles.sectionTitle}>Batch-wise Stock</Text>
        </View>

        {/* Batch List */}
        <FlatList
          data={item.batches || []}
          keyExtractor={(batch) => batch.batchNumber}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.batchListContent}
          renderItem={({ item: batch }) => (
            <AppCard style={styles.batchCard}>
              <View style={styles.batchTop}>
                <View style={styles.batchInfo}>
                  <View style={styles.batchTitleRow}>
                    <Ionicons name="layers-outline" size={14} color={colors.primary} />
                    <Text style={styles.batchTitle}>Batch: {batch.batchNumber}</Text>
                  </View>
                  <Text style={styles.batchMeta}>
                    Exp: {formatExpiryDate(batch.expiry)}
                  </Text>
                </View>
                <View style={styles.qtyBadge}>
                  <Text style={styles.qtyValue}>{batch.quantity}</Text>
                  <Text style={styles.qtyLabel}>units</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <Text style={styles.distributorText}>
                From: <Text style={styles.distributorName}>{item.distributor || "Unknown"}</Text>
              </Text>

              <View style={styles.rateRow}>
                <View style={styles.rateBox}>
                  <Text style={styles.rateLabel}>Purchase Rate</Text>
                  <Text style={styles.rateValue}>₹{batch.purchaseRate}</Text>
                </View>
                <View style={styles.rateDivider} />
                <View style={styles.rateBox}>
                  <Text style={styles.rateLabel}>MRP</Text>
                  <Text style={styles.rateValue}>₹{batch.mrp}</Text>
                </View>
              </View>
            </AppCard>
          )}
          ListEmptyComponent={
            <View style={styles.emptyBatchWrap}>
              <Ionicons name="cube-outline" size={36} color={colors.border} />
              <Text style={styles.emptyBatchText}>No batches recorded</Text>
            </View>
          }
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loaderWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  loaderText: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: spacing.xs,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginTop: spacing.xs,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  backButtonText: {
    color: colors.primary,
    fontWeight: "600",
    fontSize: 13,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: spacing.sm,
    paddingVertical: 4,
  },
  backText: {
    color: colors.primaryDark,
    fontWeight: "600",
    fontSize: 13,
  },
  productCard: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E0EDE6",
    shadowColor: "#0C2A1F",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 16,
    elevation: 5,
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: "#FFFFFF",
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  productInfo: {
    flex: 1,
    marginRight: spacing.sm,
  },
  productName: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 17,
    lineHeight: 22,
  },
  manufacturer: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 3,
  },
  productIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  countsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  countBox: {
    backgroundColor: "#F4FAF7",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    minWidth: 90,
    borderWidth: 1,
    borderColor: "#D4EAE0",
  },
  countLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "500",
  },
  countValue: {
    color: colors.primaryDark,
    fontWeight: "800",
    fontSize: 26,
    lineHeight: 30,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: spacing.sm,
  },
  sectionDot: {
    width: 4,
    height: 18,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 15,
  },
  batchListContent: {
    paddingBottom: spacing.xl,
  },
  batchCard: {
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E8EDF0",
    shadowColor: "#0C2A1F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    padding: spacing.md,
    backgroundColor: "#FFFFFF",
  },
  batchTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  batchInfo: {
    flex: 1,
  },
  batchTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  batchTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 14,
  },
  batchMeta: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 3,
    marginLeft: 20,
  },
  qtyBadge: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    minWidth: 50,
  },
  qtyValue: {
    color: colors.primaryDark,
    fontSize: 22,
    fontWeight: "800",
    lineHeight: 26,
  },
  qtyLabel: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: "#EFF2F5",
    marginVertical: 10,
  },
  distributorText: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 10,
  },
  distributorName: {
    color: colors.text,
    fontWeight: "600",
  },
  rateRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFB",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  rateBox: {
    flex: 1,
  },
  rateDivider: {
    width: 1,
    height: 30,
    backgroundColor: "#E0E5EA",
    marginHorizontal: 12,
  },
  rateLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "500",
  },
  rateValue: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 14,
    marginTop: 2,
  },
  emptyBatchWrap: {
    alignItems: "center",
    paddingVertical: spacing.xl,
    gap: spacing.xs,
  },
  emptyBatchText: {
    textAlign: "center",
    color: colors.textMuted,
    fontSize: 13,
  },
});
