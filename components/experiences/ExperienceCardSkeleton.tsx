import React from "react";

import { StyleSheet, View } from "react-native";

type ExperienceCardSkeletonProps = {
  count?: number;
};

export function ExperienceCardSkeleton({
  count = 3,
}: ExperienceCardSkeletonProps) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.card}>
          <View style={styles.header}>
            <View style={styles.avatar} />
            <View style={styles.headerText}>
              <View style={styles.nameLine} />
              <View style={styles.handleLine} />
            </View>
            <View style={styles.badge} />
          </View>

          <View style={styles.contentBlock}>
            <View style={styles.contentLineFull} />
            <View style={styles.contentLineWide} />
            <View style={styles.contentLineShort} />
          </View>

          <View style={styles.media} />

          <View style={styles.actions}>
            <View style={styles.actionPill} />
            <View style={styles.actionPill} />
            <View style={styles.actionPill} />
            <View style={styles.actionCircle} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  actionCircle: {
    backgroundColor: "#F3E6CF",
    borderRadius: 14,
    height: 28,
    width: 28,
  },
  actionPill: {
    backgroundColor: "#F3E6CF",
    borderRadius: 999,
    height: 26,
    width: 58,
  },
  actions: {
    alignItems: "center",
    borderTopColor: "#F1E4CE",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
    paddingTop: 13,
  },
  avatar: {
    backgroundColor: "#F3E6CF",
    borderRadius: 24,
    height: 48,
    width: 48,
  },
  badge: {
    backgroundColor: "#FFF1D9",
    borderRadius: 999,
    height: 26,
    width: 86,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E9D8BD",
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 16,
    marginHorizontal: 16,
    overflow: "hidden",
    padding: 17,
    shadowColor: "#7C2D12",
    shadowOffset: {
      height: 8,
      width: 0,
    },
    shadowOpacity: 0.04,
    shadowRadius: 18,
  },
  contentBlock: {
    gap: 9,
    marginTop: 17,
  },
  contentLineFull: {
    backgroundColor: "#EFE2CB",
    borderRadius: 999,
    height: 13,
    width: "100%",
  },
  contentLineShort: {
    backgroundColor: "#F3E6CF",
    borderRadius: 999,
    height: 13,
    width: "54%",
  },
  contentLineWide: {
    backgroundColor: "#F3E6CF",
    borderRadius: 999,
    height: 13,
    width: "82%",
  },
  handleLine: {
    backgroundColor: "#F3E6CF",
    borderRadius: 999,
    height: 11,
    marginTop: 8,
    width: 96,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
  },
  headerText: {
    flex: 1,
    marginLeft: 12,
  },
  media: {
    backgroundColor: "#FFF7ED",
    borderRadius: 16,
    height: 190,
    marginTop: 17,
  },
  nameLine: {
    backgroundColor: "#EFE2CB",
    borderRadius: 999,
    height: 14,
    width: 136,
  },
});
