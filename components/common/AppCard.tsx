import React from "react";
import { StyleSheet, View, type ViewProps } from "react-native";
import { colors, radius, shadows, spacing } from "../../utils/theme";

export function AppCard(props: ViewProps) {
  return <View {...props} style={[styles.card, props.style]} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.card,
  },
});
