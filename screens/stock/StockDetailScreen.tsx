import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from "react-native";
import Toast from "react-native-toast-message";
import { AppCard } from "../../components/common/AppCard";
import { ScreenContainer } from "../../components/common/ScreenContainer";
import type { RootStackParamList } from "../../navigation/types";
import { useStockStore } from "../../store/stockStore";
import { colors, radius, spacing } from "../../utils/theme";
import type { Medicine } from "../../utils/types";

type Props = NativeStackScreenProps<RootStackParamList, "StockDetail">;

export function StockDetailScreen({ route }: Props) {
  const { stockId } = route.params;
  const { fetchStockDetail } = useStockStore();
  const [item, setItem] = useState<Medicine | null>(null);
  const [loading, setLoading] = useState(true);

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
      <ScreenContainer>
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  if (!item) {
    return (
      <ScreenContainer>
        <Text style={styles.empty}>No details available</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <Text style={styles.title}>Stock Management</Text>
      <Text style={styles.storeTitle}>Radhe Medical Store</Text>
      <Text style={styles.backText}>← Back to list</Text>

      <AppCard style={styles.productCard}>
        <View style={styles.productHeader}>
          <View>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.meta}>Unknown Manufacturer</Text>
          </View>
          <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
        </View>
        <View style={styles.countsRow}>
          <View style={styles.countBox}>
            <Text style={styles.countLabel}>Total Stock</Text>
            <Text style={styles.countValue}>{item.quantity}</Text>
          </View>
          <View style={styles.countBox}>
            <Text style={styles.countLabel}>Batches</Text>
            <Text style={styles.countValue}>{item.batches?.length ?? 0}</Text>
          </View>
        </View>
      </AppCard>
      <Text style={styles.subtitle}>Batch-wise Stock</Text>

      <FlatList
        data={item.batches || []}
        keyExtractor={(batch) => batch.batchNumber}
        renderItem={({ item: batch }) => (
          <AppCard style={styles.batchCard}>
            <View style={styles.batchTop}>
              <View>
                <Text style={styles.batchTitle}>Batch: {batch.batchNumber}</Text>
                <Text style={styles.meta}>Exp: {batch.expiry}</Text>
              </View>
              <View style={styles.qtyWrap}>
                <Text style={styles.qtyValue}>{batch.quantity}</Text>
                <Text style={styles.qtyLabel}>units</Text>
              </View>
            </View>
            <Text style={styles.meta}>From: {item.distributor}</Text>
            <View style={styles.rateRow}>
              <View>
                <Text style={styles.rateLabel}>Purchase Rate</Text>
                <Text style={styles.rateValue}>Rs {batch.purchaseRate}</Text>
              </View>
              <View>
                <Text style={styles.rateLabel}>MRP</Text>
                <Text style={styles.rateValue}>Rs {batch.mrp}</Text>
              </View>
            </View>
          </AppCard>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No batches recorded</Text>
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.primaryDark,
  },
  storeTitle: {
    color: colors.primaryDark,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "700",
  },
  backText: {
    color: colors.primaryDark,
    fontWeight: "600",
    fontSize: 13,
  },
  subtitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
  },
  productCard: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EDEFF2",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
    elevation: 5,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productName: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 18,
  },
  countsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  countBox: {
    backgroundColor: "#F6FAF8",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    minWidth: 84,
    borderWidth: 1,
    borderColor: "#DCEBE5",
  },
  countLabel: {
    color: colors.textMuted,
    fontSize: 11,
  },
  countValue: {
    color: colors.primaryDark,
    fontWeight: "800",
    fontSize: 24,
    lineHeight: 28,
  },
  batchCard: {
    marginBottom: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ECEFF3",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  batchTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  batchTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 14,
  },
  meta: {
    color: colors.textMuted,
    marginTop: 2,
    fontSize: 12,
  },
  qtyWrap: {
    alignItems: "flex-end",
  },
  qtyValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 30,
  },
  qtyLabel: {
    color: colors.textMuted,
    marginTop: -1,
    fontSize: 11,
  },
  rateRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rateLabel: {
    color: colors.textMuted,
    fontSize: 11,
  },
  rateValue: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 13,
  },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: spacing.md,
    fontSize: 13,
  },
});
