import React from "react";

import {
  StyleSheet,
  View,
} from "react-native";

import { Skeleton } from "moti/skeleton";

const SHIMMER_COLORS = [
  "#EEEAE4",
  "#FAF8F5",
  "#E8E2D9",
];

type ShimmerBlockProps = {
  height: number;
  radius?: number | "round";
  width: number | `${number}%`;
};

type ExperienceCardSkeletonProps = {
  count?: number;
};

function ShimmerBlock({
  height,
  radius = 8,
  width,
}: ShimmerBlockProps) {
  return (
    <Skeleton
      colorMode="light"
      colors={SHIMMER_COLORS}
      height={height}
      radius={radius}
      transition={{
        type: "timing",
        duration: 1400,
      }}
      width={width}
    />
  );
}

export function ExperienceCardSkeleton({
  count = 3,
}: ExperienceCardSkeletonProps) {
  return (
    <View
      accessibilityLabel="Loading experiences"
      accessibilityRole="progressbar"
    >
      {Array.from({ length: count }).map(
        (_, index) => (
          <View key={index} style={styles.card}>
            <View style={styles.header}>
              <ShimmerBlock
                height={42}
                radius="round"
                width={42}
              />

              <View style={styles.identity}>
                <View style={styles.identityLine}>
                  <ShimmerBlock
                    height={13}
                    radius={7}
                    width="42%"
                  />
                  <ShimmerBlock
                    height={10}
                    radius={5}
                    width="30%"
                  />
                </View>
                <ShimmerBlock
                  height={9}
                  radius={5}
                  width="34%"
                />
              </View>
            </View>

            <View style={styles.category}>
              <ShimmerBlock
                height={20}
                radius={8}
                width={76}
              />
            </View>

            <View style={styles.story}>
              <ShimmerBlock
                height={13}
                radius={7}
                width="100%"
              />
              <ShimmerBlock
                height={13}
                radius={7}
                width="78%"
              />
            </View>

            <ShimmerBlock
              height={202}
              radius={16}
              width="100%"
            />

            <View style={styles.actions}>
              {[52, 52, 52, 30, 30].map(
                (width, actionIndex) => (
                  <ShimmerBlock
                    key={actionIndex}
                    height={28}
                    radius={14}
                    width={width}
                  />
                )
              )}
            </View>
          </View>
        )
      )}
    </View>
  );
}

export function ExperienceListFooterSkeleton() {
  return (
    <View
      accessibilityLabel="Loading more experiences"
      accessibilityRole="progressbar"
      style={styles.footer}
    >
      <ShimmerBlock
        height={10}
        radius={5}
        width="68%"
      />
      <ShimmerBlock
        height={10}
        radius={5}
        width="42%"
      />
    </View>
  );
}

export function ExperienceDetailSkeleton() {
  return (
    <View
      accessibilityLabel="Loading experience details"
      accessibilityRole="progressbar"
      style={styles.detailPage}
    >
      <View style={styles.detailTopBar}>
        <ShimmerBlock
          height={40}
          radius={12}
          width={40}
        />
        <ShimmerBlock
          height={18}
          radius={9}
          width={112}
        />
        <View style={styles.topBarSpacer} />
      </View>

      <View style={styles.detailCard}>
        <View style={styles.header}>
          <ShimmerBlock
            height={44}
            radius="round"
            width={44}
          />
          <View style={styles.detailIdentity}>
            <ShimmerBlock
              height={14}
              radius={7}
              width="52%"
            />
            <ShimmerBlock
              height={10}
              radius={5}
              width="34%"
            />
          </View>
        </View>

        <View style={styles.detailStory}>
          <ShimmerBlock
            height={14}
            radius={7}
            width="100%"
          />
          <ShimmerBlock
            height={14}
            radius={7}
            width="92%"
          />
          <ShimmerBlock
            height={14}
            radius={7}
            width="63%"
          />
        </View>

        <ShimmerBlock
          height={230}
          radius={16}
          width="100%"
        />
      </View>

      <View style={styles.comments}>
        <ShimmerBlock
          height={18}
          radius={9}
          width={112}
        />
        {[0, 1, 2].map((item) => (
          <View
            key={item}
            style={styles.commentRow}
          >
            <ShimmerBlock
              height={34}
              radius="round"
              width={34}
            />
            <View style={styles.commentCopy}>
              <ShimmerBlock
                height={11}
                radius={6}
                width="38%"
              />
              <ShimmerBlock
                height={10}
                radius={5}
                width="84%"
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function ExperienceEditSkeleton() {
  return (
    <View
      accessibilityLabel="Preparing experience editor"
      accessibilityRole="progressbar"
      style={styles.editPage}
    >
      <View style={styles.editHeader}>
        <ShimmerBlock
          height={44}
          radius={14}
          width={44}
        />
        <View style={styles.editTitle}>
          <ShimmerBlock
            height={9}
            radius={5}
            width={82}
          />
          <ShimmerBlock
            height={18}
            radius={9}
            width={106}
          />
        </View>
        <ShimmerBlock
          height={44}
          radius={14}
          width={76}
        />
      </View>

      <View style={styles.editContent}>
        <View style={styles.editSection}>
          <ShimmerBlock
            height={17}
            radius={9}
            width={96}
          />
          <View style={styles.editStoryLines}>
            <ShimmerBlock
              height={13}
              radius={7}
              width="100%"
            />
            <ShimmerBlock
              height={13}
              radius={7}
              width="88%"
            />
            <ShimmerBlock
              height={13}
              radius={7}
              width="66%"
            />
          </View>
        </View>

        <View style={styles.editSection}>
          <ShimmerBlock
            height={17}
            radius={9}
            width={82}
          />
          <View style={styles.chipRow}>
            {[82, 96, 74].map((width) => (
              <ShimmerBlock
                key={width}
                height={40}
                radius={20}
                width={width}
              />
            ))}
          </View>
        </View>

        <View style={styles.editSection}>
          <ShimmerBlock
            height={17}
            radius={9}
            width={92}
          />
          <View style={styles.inputSkeleton}>
            <ShimmerBlock
              height={52}
              radius={12}
              width="100%"
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    alignItems: "center",
    borderTopColor: "#F1F0EE",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 10,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E7E5E4",
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    marginHorizontal: 14,
    padding: 16,
  },
  category: {
    marginTop: 13,
  },
  comments: {
    gap: 18,
    paddingHorizontal: 18,
    paddingTop: 24,
  },
  commentCopy: {
    flex: 1,
    gap: 9,
  },
  commentRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 11,
  },
  detailCard: {
    backgroundColor: "#FFFFFF",
    borderBottomColor: "#E7E5E4",
    borderBottomWidth: 1,
    padding: 18,
  },
  detailIdentity: {
    flex: 1,
    gap: 9,
    marginLeft: 11,
  },
  detailPage: {
    backgroundColor: "#FAFAF9",
    flex: 1,
  },
  detailStory: {
    gap: 10,
    marginBottom: 18,
    marginTop: 20,
  },
  detailTopBar: {
    alignItems: "center",
    borderBottomColor: "#E7E5E4",
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 56,
  },
  editContent: {
    gap: 15,
    padding: 18,
  },
  editHeader: {
    alignItems: "center",
    borderBottomColor: "#E7E5E4",
    borderBottomWidth: 1,
    flexDirection: "row",
    paddingBottom: 13,
    paddingHorizontal: 16,
    paddingTop: 56,
  },
  editPage: {
    backgroundColor: "#FFFCF7",
    flex: 1,
  },
  editSection: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E9D8BD",
    borderRadius: 16,
    borderWidth: 1,
    minHeight: 118,
    padding: 16,
  },
  editStoryLines: {
    gap: 12,
    marginTop: 24,
  },
  editTitle: {
    flex: 1,
    gap: 7,
    marginLeft: 12,
  },
  chipRow: {
    flexDirection: "row",
    gap: 9,
    marginTop: 22,
  },
  footer: {
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 30,
    paddingVertical: 22,
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
  },
  identity: {
    flex: 1,
    gap: 9,
    marginLeft: 11,
  },
  identityLine: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  inputSkeleton: {
    marginTop: 18,
  },
  story: {
    gap: 10,
    marginBottom: 15,
    marginTop: 12,
  },
  topBarSpacer: {
    width: 40,
  },
});
