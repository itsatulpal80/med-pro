import React from "react";
import { StyleSheet, Text } from "react-native";
import { AppCard } from "../../components/common/AppCard";
import { ScreenContainer } from "../../components/common/ScreenContainer";
import { colors } from "../../utils/theme";

export function SaleScreen() {
  return (
    <ScreenContainer>
      <Text style={styles.title}>Sale</Text>
      <AppCard>
        <Text style={styles.text}>
          Create new sales bills and manage checkout flow here.
        </Text>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: colors.primaryDark,
  },
  text: {
    color: colors.textMuted,
    lineHeight: 22,
  },
});
