import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppCard } from "../../components/common/AppCard";
import { ScreenContainer } from "../../components/common/ScreenContainer";
import { ScreenHeader } from "../../components/common/ScreenHeader";
import { colors, spacing } from "../../utils/theme";

export function SaleScreen() {
  return (
    <ScreenContainer contentStyle={{ padding: 0 }}>
      <ScreenHeader title="Sale" />
      <View style={styles.content}>
        <AppCard>
          <Text style={styles.text}>
            Create new sales bills and manage checkout flow here.
          </Text>
        </AppCard>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
  },
  text: {
    color: colors.textMuted,
    lineHeight: 22,
  },
});
