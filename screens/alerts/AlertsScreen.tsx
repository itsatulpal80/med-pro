import React, { useEffect, useMemo, useState } from "react";
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
import { stockApi } from "../../services/api";
import { useStockStore } from "../../store/stockStore";
import { colors, radius, spacing } from "../../utils/theme";

type TabType = "expired" | "expiring" | "lowStock";

type AlertItem = {
  medicineId: string;
  medicineName: string;
  distributor: string;
  batchNumber: string;
  quantity: number;
  expiryDate: string;
};

const formatExpiryDate = (dateStr: string) => {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
};

export function AlertsScreen() {
  const { items, fetchStock, loading } = useStockStore();
  const [activeTab, setActiveTab] = useState<TabType>("expired");
  const [disposing, setDisposing] = useState<string | null>(null);

  useEffect(() => {
    fetchStock().catch(() =>
      Toast.show({ type: "error", text1: "Failed to load stock" })
    );
  }, [fetchStock]);

  const { expired, expiring, lowStock } = useMemo(() => {
    const now = new Date();
    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(now.getDate() + 60);

    const expiredItems: AlertItem[] = [];
    const expiringItems: AlertItem[] = [];
    const lowStockItems: AlertItem[] = [];

    items.forEach((medicine) => {
      medicine.batches?.forEach((batch) => {
        const batchExpiry = new Date(batch.expiryDate || "");
        const item: AlertItem = {
          medicineId: medicine.id,
          medicineName: medicine.name,
          distributor: medicine.distributor,
          batchNumber: batch.batchNumber,
          quantity: batch.quantity,
          expiryDate: batch.expiryDate || "",
        };

        // Low Stock
        if (batch.quantity <= 10) {
          lowStockItems.push(item);
        }

        // Expiry
        if (!isNaN(batchExpiry.getTime())) {
          if (batchExpiry < now) {
            expiredItems.push(item);
          } else if (batchExpiry <= sixtyDaysFromNow) {
            expiringItems.push(item);
          }
        }
      });
    });

    return { expired: expiredItems, expiring: expiringItems, lowStock: lowStockItems };
  }, [items]);

  const currentData = useMemo(() => {
    switch (activeTab) {
      case "expired":
        return expired;
      case "expiring":
        return expiring;
      case "lowStock":
        return lowStock;
      default:
        return [];
    }
  }, [activeTab, expired, expiring, lowStock]);

  const handleDispose = async (medicineId: string, batchNumber: string) => {
    const disposeId = `${medicineId}-${batchNumber}`;
    setDisposing(disposeId);
    try {
      await stockApi.disposeBatch(medicineId, batchNumber);
      Toast.show({ type: "success", text1: "Batch disposed successfully" });
      await fetchStock();
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to dispose batch" });
    } finally {
      setDisposing(null);
    }
  };

  const renderTab = (title: string, tab: TabType, count: number) => {
    const isActive = activeTab === tab;
    return (
      <Pressable
        style={[styles.tab, isActive && styles.tabActive]}
        onPress={() => setActiveTab(tab)}
      >
        <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
          {title} ({count})
        </Text>
      </Pressable>
    );
  };

  return (
    <ScreenContainer contentStyle={{ padding: 0 }}>
      <ScreenHeader title="Alerts" subtitle="Manage Alerts" showBack />

      <View style={styles.tabContainer}>
        {renderTab("Expired", "expired", expired.length)}
        {renderTab("Expiring", "expiring", expiring.length)}
        {renderTab("Low Stock", "lowStock", lowStock.length)}
      </View>

      {loading && !items.length ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: spacing.xl }} />
      ) : (
        <FlatList
          data={currentData}
          keyExtractor={(item) => `${item.medicineId}-${item.batchNumber}`}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const isDisposing = disposing === `${item.medicineId}-${item.batchNumber}`;
            return (
              <AppCard style={styles.card}>
                <View style={styles.cardMain}>
                  <View style={styles.cardTextWrap}>
                    <Text style={styles.medicineName}>{item.medicineName}</Text>
                    <Text style={styles.distributor}>Distributor: {item.distributor}</Text>
                    <View style={styles.metaRow}>
                      <Text style={styles.metaText}>Batch: {item.batchNumber}</Text>
                      <Text style={styles.metaText}>Qty: {item.quantity}</Text>
                      <Text style={styles.metaText}>
                        Exp: {formatExpiryDate(item.expiryDate)}
                      </Text>
                    </View>
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <Pressable
                    style={[styles.disposeButton, isDisposing && styles.disposeButtonDisabled]}
                    onPress={() => handleDispose(item.medicineId, item.batchNumber)}
                    disabled={isDisposing}
                  >
                    <Text style={styles.disposeButtonText}>
                      {isDisposing ? "Disposing..." : "Dispose"}
                    </Text>
                  </Pressable>
                </View>
              </AppCard>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No items found in this category.</Text>
          }
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.textMuted,
  },
  tabTextActive: {
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  card: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: "#FFFFFF",
    borderColor: colors.border,
    borderWidth: 1,
  },
  cardMain: {
    flexDirection: "row",
    marginBottom: spacing.sm,
  },
  cardTextWrap: {
    flex: 1,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.text,
    marginBottom: 4,
  },
  distributor: {
    fontSize: 13,
    color: colors.textMuted,
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  metaText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: "500",
  },
  cardActions: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    alignItems: "flex-end",
  },
  disposeButton: {
    backgroundColor: "#FFEBEB",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: "#FFCDCD",
  },
  disposeButtonDisabled: {
    opacity: 0.5,
  },
  disposeButtonText: {
    color: "#D64545",
    fontWeight: "600",
    fontSize: 13,
  },
  emptyText: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: spacing.xl,
    fontSize: 14,
  },
});
