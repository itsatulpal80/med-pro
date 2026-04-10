import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { AppCard } from "../../components/common/AppCard";
import { ScreenContainer } from "../../components/common/ScreenContainer";
import type { RootStackParamList, TabParamList } from "../../navigation/types";
import { useStockStore } from "../../store/stockStore";
import { colors, radius, spacing } from "../../utils/theme";

type FilterType = "all" | "distributor";
type Props = BottomTabScreenProps<TabParamList, "Stock">;

export function StockScreen({}: Props) {
  const rootNavigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { items, fetchStock, loading, addManualStock } = useStockStore();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [distributor, setDistributor] = useState("");
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [savingManual, setSavingManual] = useState(false);
  const [manualName, setManualName] = useState("");
  const [manualDistributor, setManualDistributor] = useState("");
  const [manualBatchNo, setManualBatchNo] = useState("");
  const [manualExpiry, setManualExpiry] = useState("");
  const [manualPurchase, setManualPurchase] = useState("");
  const [manualMrp, setManualMrp] = useState("");
  const [manualQty, setManualQty] = useState("");

  React.useEffect(() => {
    fetchStock().catch(() =>
      Toast.show({ type: "error", text1: "Failed to load stock" }),
    );
  }, [fetchStock]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesDistributor =
        filter === "all" ||
        item.distributor.toLowerCase().includes(distributor.toLowerCase());
      return matchesSearch && matchesDistributor;
    });
  }, [items, search, filter, distributor]);

  const closeManualModal = () => {
    if (savingManual) return;
    setIsManualModalOpen(false);
  };

  const resetManualForm = () => {
    setManualName("");
    setManualDistributor("");
    setManualBatchNo("");
    setManualExpiry("");
    setManualPurchase("");
    setManualMrp("");
    setManualQty("");
  };

  const submitManualStock = async () => {
    const name = manualName.trim();
    const batchNumber = manualBatchNo.trim();
    const expiry = manualExpiry.trim();
    const purchaseRate = Number(manualPurchase.trim());
    const mrp = Number(manualMrp.trim());
    const quantity = Number(manualQty.trim());

    if (!name || !batchNumber || !expiry) {
      Toast.show({
        type: "error",
        text1: "Medicine name, batch and expiry are required",
      });
      return;
    }
    if (!/^\d{4}-\d{2}$/.test(expiry)) {
      Toast.show({ type: "error", text1: "Expiry must be in YYYY-MM format" });
      return;
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      Toast.show({ type: "error", text1: "Quantity must be greater than 0" });
      return;
    }
    if (!Number.isFinite(purchaseRate) || purchaseRate < 0) {
      Toast.show({ type: "error", text1: "Purchase must be a valid number" });
      return;
    }
    if (!Number.isFinite(mrp) || mrp < 0) {
      Toast.show({ type: "error", text1: "MRP must be a valid number" });
      return;
    }

    setSavingManual(true);
    try {
      await addManualStock({
        name,
        distributor: manualDistributor.trim() || "Manual Entry",
        batchNumber,
        expiryDate: `${expiry}-01`,
        quantity,
        purchaseRate,
        mrp,
      });
      await fetchStock();
      resetManualForm();
      setIsManualModalOpen(false);
      Toast.show({ type: "success", text1: "Stock added successfully" });
    } catch {
      Toast.show({ type: "error", text1: "Failed to add stock" });
    } finally {
      setSavingManual(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Stock Management</Text>
      <Text style={styles.storeTitle}>Radhe Medical Store</Text>

      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search medicines..."
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <Pressable
          style={styles.iconButton}
          onPress={() => setIsManualModalOpen(true)}
        >
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </Pressable>
        <Pressable style={styles.refreshButton} onPress={() => fetchStock()}>
          <Ionicons name="refresh" size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.filterRow}>
        <Pressable
          style={[styles.filterChip, filter === "all" && styles.filterChipActive]}
          onPress={() => setFilter("all")}
        >
          <Ionicons
            name="list"
            size={14}
            color={filter === "all" ? colors.primaryDark : colors.textMuted}
          />
          <Text
            style={[
              styles.filterText,
              filter === "all" && styles.filterTextActive,
            ]}
          >
            All Stock
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.filterChip,
            filter === "distributor" && styles.filterChipActive,
          ]}
          onPress={() => setFilter("distributor")}
        >
          <Ionicons
            name="business-outline"
            size={14}
            color={filter === "distributor" ? colors.primaryDark : colors.textMuted}
          />
          <Text
            style={[
              styles.filterText,
              filter === "distributor" && styles.filterTextActive,
            ]}
          >
            By Distributor
          </Text>
        </Pressable>
      </View>

      {filter === "distributor" ? (
        <TextInput
          style={styles.search}
          value={distributor}
          onChangeText={setDistributor}
          placeholder="Enter distributor"
          placeholderTextColor={colors.textMuted}
        />
      ) : null}

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : null}

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              rootNavigation.navigate("StockDetail", { stockId: item.id })
            }
          >
            <AppCard style={styles.itemCard}>
              <View style={styles.itemRow}>
                <View style={styles.itemIconWrap}>
                  <Ionicons name="cube-outline" size={18} color="#F4A100" />
                </View>
                <View style={styles.itemTextWrap}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.meta}>Qty:{item.quantity}</Text>
                  <Text style={styles.meta}>Exp: {item.expiry}</Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textMuted}
                />
                <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
              </View>
            </AppCard>
          </Pressable>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No medicines found</Text>
        }
      />

      <Modal
        visible={isManualModalOpen}
        animationType="fade"
        transparent
        onRequestClose={closeManualModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Add New Stock</Text>
                <Text style={styles.modalSubtitle}>
                  Manually add medicine to your inventory
                </Text>
              </View>
              <Pressable
                style={styles.modalCloseBtn}
                onPress={closeManualModal}
                disabled={savingManual}
              >
                <Ionicons name="close" size={20} color={colors.textMuted} />
              </Pressable>
            </View>

            <Text style={styles.inputLabel}>Medicine Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter medicine name"
              placeholderTextColor={colors.textMuted}
              value={manualName}
              onChangeText={setManualName}
            />

            <View style={styles.modalRow}>
              <View style={styles.modalCol}>
                <Text style={styles.inputLabel}>Batch No.</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g., B001"
                  placeholderTextColor={colors.textMuted}
                  value={manualBatchNo}
                  onChangeText={setManualBatchNo}
                />
              </View>
              <View style={styles.modalCol}>
                <Text style={styles.inputLabel}>Expiry (YYYY-MM)</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g., 2025-12"
                  placeholderTextColor={colors.textMuted}
                  value={manualExpiry}
                  onChangeText={setManualExpiry}
                />
              </View>
            </View>

            <View style={styles.modalRowThree}>
              <View style={styles.modalColThird}>
                <Text style={styles.inputLabel}>Purchase Rs</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={manualPurchase}
                  onChangeText={setManualPurchase}
                />
              </View>
              <View style={styles.modalColThird}>
                <Text style={styles.inputLabel}>MRP Rs</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={manualMrp}
                  onChangeText={setManualMrp}
                />
              </View>
              <View style={styles.modalColThird}>
                <Text style={styles.inputLabel}>Quantity</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="0"
                  placeholderTextColor={colors.textMuted}
                  keyboardType="numeric"
                  value={manualQty}
                  onChangeText={setManualQty}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Distributor (optional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g., ABC Pharma"
              placeholderTextColor={colors.textMuted}
              value={manualDistributor}
              onChangeText={setManualDistributor}
            />

            <View style={styles.modalFooter}>
              <Pressable
                style={[styles.modalButton, styles.modalCancelBtn]}
                onPress={closeManualModal}
                disabled={savingManual}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalPrimaryBtn]}
                onPress={submitManualStock}
                disabled={savingManual}
              >
                <Text style={styles.modalPrimaryText}>
                  {savingManual ? "Adding..." : "Add Stock"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  storeTitle: {
    color: colors.primaryDark,
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  searchWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: spacing.md,
    height: 44,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    marginLeft: spacing.xs,
    paddingVertical: 0,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 11,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  filterRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  filterChip: {
    flex: 1,
    minHeight: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: colors.primarySoft,
    borderColor: "#CDE6D8",
  },
  filterText: {
    color: colors.textMuted,
    fontWeight: "600",
    fontSize: 13,
  },
  filterTextActive: {
    color: colors.primaryDark,
  },
  itemCard: {
    marginBottom: spacing.sm,
    borderRadius: radius.md,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  itemIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "#FFF2D8",
    alignItems: "center",
    justifyContent: "center",
  },
  itemTextWrap: {
    flex: 1,
  },
  name: {
    fontWeight: "700",
    color: colors.text,
    fontSize: 16,
  },
  meta: {
    color: colors.textMuted,
    marginTop: 2,
    fontSize: 12,
  },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: spacing.lg,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.md,
  },
  modalCard: {
    width: "100%",
    maxWidth: 440,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: spacing.md,
    gap: 10,
    borderWidth: 1,
    borderColor: "#EDEFF2",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.text,
  },
  modalSubtitle: {
    color: colors.textMuted,
    marginTop: 2,
    fontSize: 13,
  },
  modalCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6F7F9",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
    marginTop: 2,
  },
  modalInput: {
    height: 42,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    color: colors.text,
    backgroundColor: "#FBFCFD",
  },
  modalRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  modalCol: {
    flex: 1,
  },
  modalRowThree: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  modalColThird: {
    flex: 1,
  },
  modalFooter: {
    marginTop: 6,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
  modalButton: {
    minWidth: 104,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
  },
  modalCancelBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#FFFFFF",
  },
  modalPrimaryBtn: {
    backgroundColor: colors.primary,
  },
  modalCancelText: {
    color: colors.text,
    fontWeight: "600",
    fontSize: 14,
  },
  modalPrimaryText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});
