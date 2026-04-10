import React, { useMemo, useState } from "react";
import { FlatList, StyleSheet, Text, TextInput } from "react-native";
import Toast from "react-native-toast-message";
import { AppButton } from "../../components/common/AppButton";
import { AppCard } from "../../components/common/AppCard";
import { ScreenContainer } from "../../components/common/ScreenContainer";
import { useStockStore } from "../../store/stockStore";
import { colors, radius, spacing } from "../../utils/theme";
import type { OCRResult } from "../../utils/types";

const emptyResult: OCRResult = {
  supplierName: "",
  invoiceNumber: "",
  invoiceDate: "",
  medicines: [],
};

export function OCRPreviewScreen() {
  const { selectedOCRData, saveOCRData, fetchStock, setOCRData } =
    useStockStore();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<OCRResult>(selectedOCRData || emptyResult);

  const canSave = useMemo(
    () =>
      Boolean(form.supplierName && form.invoiceNumber && form.medicines.length),
    [form],
  );

  const saveToStock = async () => {
    if (!canSave) {
      Toast.show({ type: "error", text1: "Incomplete OCR data" });
      return;
    }

    setSaving(true);
    try {
      await saveOCRData(form);
      await fetchStock();
      setOCRData(null);
      Toast.show({ type: "success", text1: "Saved to stock" });
    } catch {
      Toast.show({ type: "error", text1: "Failed to save stock" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>OCR Preview</Text>
      <AppCard>
        <Text style={styles.label}>Supplier Name</Text>
        <TextInput
          value={form.supplierName}
          onChangeText={(value) =>
            setForm((prev) => ({ ...prev, supplierName: value }))
          }
          style={styles.input}
        />

        <Text style={styles.label}>Invoice Number</Text>
        <TextInput
          value={form.invoiceNumber}
          onChangeText={(value) =>
            setForm((prev) => ({ ...prev, invoiceNumber: value }))
          }
          style={styles.input}
        />

        <Text style={styles.label}>Invoice Date</Text>
        <TextInput
          value={form.invoiceDate}
          onChangeText={(value) =>
            setForm((prev) => ({ ...prev, invoiceDate: value }))
          }
          style={styles.input}
          placeholder="YYYY-MM-DD"
        />
      </AppCard>

      <Text style={styles.sectionTitle}>
        Medicines ({form.medicines.length})
      </Text>
      <FlatList
        data={form.medicines}
        keyExtractor={(item, index) => `${item.name}-${index}`}
        scrollEnabled={false}
        renderItem={({ item, index }) => (
          <AppCard style={styles.medicineCard}>
            <Text style={styles.medicineName}>{item.name}</Text>
            <Text style={styles.medicineMeta}>Qty: {item.quantity}</Text>
            <Text style={styles.medicineMeta}>Batch: {item.batchNumber}</Text>
            <Text style={styles.medicineMeta}>
              Expiry: {item.expiryDate || item.expiry}
            </Text>
            <Text style={styles.medicineMeta}>
              Purchase: Rs {item.purchaseRate}
            </Text>
            <Text style={styles.medicineMeta}>MRP: Rs {item.mrp}</Text>
            <AppButton
              title="Remove"
              variant="ghost"
              onPress={() =>
                setForm((prev) => ({
                  ...prev,
                  medicines: prev.medicines.filter((_, i) => i !== index),
                }))
              }
            />
          </AppCard>
        )}
      />

      <AppButton title="Save to Stock" onPress={saveToStock} loading={saving} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 18,
  },
  label: {
    color: colors.text,
    marginBottom: 6,
    marginTop: spacing.sm,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: spacing.md,
    height: 44,
    color: colors.text,
  },
  medicineCard: {
    marginBottom: spacing.sm,
  },
  medicineName: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 6,
  },
  medicineMeta: {
    color: colors.textMuted,
    marginBottom: 2,
  },
});
