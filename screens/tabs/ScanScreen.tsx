import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { Camera } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { AppButton } from "../../components/common/AppButton";
import { AppCard } from "../../components/common/AppCard";
import { ScreenContainer } from "../../components/common/ScreenContainer";
import type { TabParamList } from "../../navigation/types";
import { ocrApi } from "../../services/api";
import { useStockStore } from "../../store/stockStore";
import type { OCRMedicine, OCRResult } from "../../utils/types";
import { colors, radius, spacing } from "../../utils/theme";

type Props = BottomTabScreenProps<TabParamList, "Scan">;

const emptyOCR: OCRResult = {
  supplierName: "",
  invoiceNumber: "",
  invoiceDate: "",
  medicines: [],
};

export function ScanScreen({}: Props) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [ocrData, setOcrData] = useState<OCRResult | null>(null);
  const { saveOCRData, fetchStock } = useStockStore();

  const processImage = async (imageUri: string) => {
    setLoading(true);
    setPreview(imageUri);
    try {
      const { data } = await ocrApi.scanBill(imageUri);
      setOcrData(data);
      Toast.show({ type: "success", text1: "OCR completed" });
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string) || "OCR scan failed"
        : "OCR scan failed";
      Toast.show({ type: "error", text1: message });
    } finally {
      setLoading(false);
    }
  };

  const updateMedicine = (
    index: number,
    key: keyof OCRMedicine,
    value: string,
  ) => {
    if (!ocrData) return;
    setOcrData({
      ...ocrData,
      medicines: ocrData.medicines.map((item, i) =>
        i === index
          ? {
              ...item,
              [key]:
                key === "quantity" || key === "purchaseRate" || key === "mrp"
                  ? Number(value || 0)
                  : value,
            }
          : item,
      ),
    });
  };

  const removeMedicine = (index: number) => {
    if (!ocrData) return;
    setOcrData({
      ...ocrData,
      medicines: ocrData.medicines.filter((_, i) => i !== index),
    });
  };

  const addToStock = async () => {
    const payload = ocrData || emptyOCR;
    if (!payload.invoiceNumber || !payload.supplierName) {
      Toast.show({
        type: "error",
        text1: "Supplier name and invoice number are required",
      });
      return;
    }
    if (!payload.medicines.length) {
      Toast.show({ type: "error", text1: "No medicines found to save" });
      return;
    }

    setSaving(true);
    try {
      await saveOCRData(payload);
      await fetchStock();
      Toast.show({ type: "success", text1: "Added to stock successfully" });
      setOcrData(null);
      setPreview(null);
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data?.message as string) || "Failed to add to stock"
        : "Failed to add to stock";
      Toast.show({ type: "error", text1: message });
    } finally {
      setSaving(false);
    }
  };

  const openCamera = async () => {
    const permission = await Camera.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Toast.show({ type: "error", text1: "Camera permission denied" });
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled) {
      await processImage(result.assets[0].uri);
    }
  };

  const openGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Toast.show({ type: "error", text1: "Gallery permission denied" });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });

    if (!result.canceled) {
      await processImage(result.assets[0].uri);
    }
  };

  return (
    <ScreenContainer>
      <Text style={styles.title}>Scan Purchase Bill</Text>
      <Text style={styles.storeTitle}>Radhe Medical Store</Text>
      <AppCard style={styles.infoCard}>
        <Text style={styles.instructionsTitle}>How to scan</Text>
        <Text style={styles.instructionsText}>• Place the bill on a flat surface</Text>
        <Text style={styles.instructionsText}>• Ensure good lighting</Text>
        <Text style={styles.instructionsText}>• Capture the full bill clearly</Text>
        <Text style={styles.instructionsText}>
          • AI will extract medicine details
        </Text>
      </AppCard>

      <Pressable style={styles.cameraButton} onPress={openCamera}>
        <Ionicons name="camera-outline" size={20} color="#FFFFFF" />
        <Text style={styles.cameraButtonText}>Open Camera</Text>
      </Pressable>
      <Pressable style={styles.galleryButton} onPress={openGallery}>
        <Ionicons name="cloud-upload-outline" size={18} color={colors.text} />
        <Text style={styles.galleryButtonText}>Upload from Gallery</Text>
      </Pressable>

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Scanning invoice...</Text>
        </View>
      ) : null}

      {preview ? (
        <AppCard>
          <Text style={styles.instructionsTitle}>Selected Image</Text>
          <Image source={{ uri: preview }} style={styles.preview} />
        </AppCard>
      ) : null}

      {ocrData ? (
        <AppCard>
          <Text style={styles.instructionsTitle}>Verify OCR Data</Text>
          <Text style={styles.inputLabel}>Supplier Name</Text>
          <TextInput
            style={styles.input}
            value={ocrData.supplierName}
            onChangeText={(value) =>
              setOcrData((prev) =>
                prev ? { ...prev, supplierName: value } : prev,
              )
            }
          />
          <Text style={styles.inputLabel}>Invoice Number</Text>
          <TextInput
            style={styles.input}
            value={ocrData.invoiceNumber}
            onChangeText={(value) =>
              setOcrData((prev) =>
                prev ? { ...prev, invoiceNumber: value } : prev,
              )
            }
          />
          <Text style={styles.inputLabel}>Invoice Date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={ocrData.invoiceDate}
            onChangeText={(value) =>
              setOcrData((prev) => (prev ? { ...prev, invoiceDate: value } : prev))
            }
          />
          <Text style={styles.medicineHeader}>
            Medicines ({ocrData.medicines.length})
          </Text>
          <FlatList
            data={ocrData.medicines}
            keyExtractor={(_, index) => String(index)}
            scrollEnabled={false}
            renderItem={({ item, index }) => (
              <View style={styles.medicineCard}>
                <TextInput
                  style={styles.input}
                  value={item.name}
                  onChangeText={(value) => updateMedicine(index, "name", value)}
                  placeholder="Medicine Name"
                />
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, styles.half]}
                    value={item.batchNumber}
                    onChangeText={(value) =>
                      updateMedicine(index, "batchNumber", value)
                    }
                    placeholder="Batch"
                  />
                  <TextInput
                    style={[styles.input, styles.half]}
                    value={item.expiryDate || item.expiry}
                    onChangeText={(value) =>
                      updateMedicine(index, "expiryDate", value)
                    }
                    placeholder="Expiry YYYY-MM-DD"
                  />
                </View>
                <View style={styles.row}>
                  <TextInput
                    style={[styles.input, styles.third]}
                    keyboardType="numeric"
                    value={String(item.quantity)}
                    onChangeText={(value) => updateMedicine(index, "quantity", value)}
                    placeholder="Qty"
                  />
                  <TextInput
                    style={[styles.input, styles.third]}
                    keyboardType="numeric"
                    value={String(item.purchaseRate)}
                    onChangeText={(value) =>
                      updateMedicine(index, "purchaseRate", value)
                    }
                    placeholder="Purchase"
                  />
                  <TextInput
                    style={[styles.input, styles.third]}
                    keyboardType="numeric"
                    value={String(item.mrp)}
                    onChangeText={(value) => updateMedicine(index, "mrp", value)}
                    placeholder="MRP"
                  />
                </View>
                <AppButton
                  title="Remove"
                  variant="ghost"
                  onPress={() => removeMedicine(index)}
                />
              </View>
            )}
          />

          <AppButton title="Add To Stock List" onPress={addToStock} loading={saving} />
        </AppCard>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: colors.primaryDark,
    textAlign: "center",
  },
  storeTitle: {
    color: colors.primaryDark,
    textAlign: "center",
    fontSize: 24,
    fontWeight: "800",
  },
  infoCard: {
    borderRadius: radius.md,
    backgroundColor: "#EFF4F5",
  },
  instructionsTitle: {
    color: colors.text,
    fontWeight: "700",
    marginBottom: spacing.sm,
  },
  instructionsText: {
    color: "#3F5960",
    marginBottom: 6,
  },
  cameraButton: {
    minHeight: 100,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  cameraButtonText: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "700",
  },
  galleryButton: {
    minHeight: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  galleryButtonText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 15,
  },
  loaderWrap: {
    alignItems: "center",
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  loadingText: {
    color: colors.textMuted,
    fontWeight: "600",
  },
  preview: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginTop: spacing.xs,
  },
  inputLabel: {
    marginTop: spacing.xs,
    marginBottom: 6,
    color: colors.text,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: spacing.sm,
    height: 42,
    color: colors.text,
  },
  medicineHeader: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    color: colors.text,
    fontWeight: "700",
  },
  medicineCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    gap: spacing.xs,
    backgroundColor: "#FAFCFB",
  },
  row: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  half: {
    flex: 1,
  },
  third: {
    flex: 1,
  },
});
