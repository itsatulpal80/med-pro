import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import Toast from "react-native-toast-message";
import { ScreenContainer } from "../../components/common/ScreenContainer";
import { ScreenHeader } from "../../components/common/ScreenHeader";
import { profileApi } from "../../services/api";
import { colors, radius, spacing } from "../../utils/theme";

export function SettingsScreen() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [medicalName, setMedicalName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [address, setAddress] = useState("");
  const [drugLicense, setDrugLicense] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await profileApi.getProfile();
      setMedicalName(data.medicalName || "");
      setOwnerName(data.name || "");
      setAddress(data.address || "");
      setDrugLicense(data.drugLicense || "");
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to load settings" });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!ownerName.trim()) {
      Toast.show({ type: "error", text1: "Owner Name is required" });
      return;
    }

    setSaving(true);
    try {
      await profileApi.updateProfile({
        name: ownerName.trim(),
        medicalName: medicalName.trim(),
        address: address.trim(),
        drugLicense: drugLicense.trim(),
      });
      Toast.show({ type: "success", text1: "Settings saved successfully" });
    } catch (err) {
      Toast.show({ type: "error", text1: "Failed to save settings" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenContainer contentStyle={{ padding: 0 }}>
      <ScreenHeader
        title="Settings"
        subtitle="Manage store details"
        hideSettings
        showBack
      />

      {loading ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Basic Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Medical Name</Text>
              <TextInput
                style={styles.input}
                value={medicalName}
                onChangeText={setMedicalName}
                placeholder="e.g. Apollo Pharmacy"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Owner Name</Text>
              <TextInput
                style={styles.input}
                value={ownerName}
                onChangeText={setOwnerName}
                placeholder="e.g. John Doe"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={address}
                onChangeText={setAddress}
                placeholder="Store address..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Drug License Number</Text>
              <TextInput
                style={styles.input}
                value={drugLicense}
                onChangeText={setDrugLicense}
                placeholder="e.g. DL-12345678"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <Pressable
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              <Text style={styles.saveButtonText}>
                {saving ? "Saving..." : "Save Settings"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loaderWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginBottom: spacing.md,
  },
  inputGroup: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
    marginBottom: 6,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    color: colors.text,
    backgroundColor: "#FBFCFD",
    fontSize: 14,
  },
  textArea: {
    height: 80,
    paddingTop: spacing.sm,
  },
  saveButton: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    justifyContent: "center",
    alignItems: "center",
    marginTop: spacing.sm,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
