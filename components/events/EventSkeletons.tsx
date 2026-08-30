import { MotiView } from "moti";
import { StyleSheet, View } from "react-native";

const pulseTransition = {
  duration: 850,
  loop: true,
  type: "timing" as const,
};

function Bone({ style }: { style: object }) {
  return (
    <MotiView
      animate={{ opacity: [0.42, 0.9, 0.42] }}
      from={{ opacity: 0.42 }}
      style={[styles.bone, style]}
      transition={pulseTransition}
    />
  );
}

export function EventListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View accessibilityLabel="Loading events" style={styles.list}>
      {Array.from({ length: count }, (_, index) => (
        <View key={index} style={styles.card}>
          <Bone style={styles.thumbnail} />
          <View style={styles.cardCopy}>
            <Bone style={styles.eyebrow} />
            <Bone style={styles.title} />
            <Bone style={styles.line} />
            <Bone style={styles.shortLine} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function EventDetailSkeleton() {
  return (
    <View accessibilityLabel="Loading event details" style={styles.detail}>
      <Bone style={styles.hero} />
      <View style={styles.detailContent}>
        <Bone style={styles.detailTitle} />
        <Bone style={styles.detailLine} />
        <Bone style={styles.detailLineWide} />
        <View style={styles.detailCard}>
          <Bone style={styles.detailLabel} />
          <Bone style={styles.detailParagraph} />
          <Bone style={styles.detailParagraphShort} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bone: { backgroundColor: "#EDE7E1", borderRadius: 8 },
  card: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F0E4D8",
    borderCurve: "continuous",
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: "row",
    minHeight: 124,
    overflow: "hidden",
    padding: 12,
  },
  cardCopy: { flex: 1, justifyContent: "center", marginLeft: 13 },
  detail: { backgroundColor: "#FAFAF9", flex: 1 },
  detailCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#F0E4D8",
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 26,
    padding: 18,
  },
  detailContent: { padding: 18 },
  detailLabel: { height: 15, width: "32%" },
  detailLine: { height: 17, marginTop: 24, width: "58%" },
  detailLineWide: { height: 17, marginTop: 13, width: "76%" },
  detailParagraph: { height: 14, marginTop: 20, width: "100%" },
  detailParagraphShort: { height: 14, marginTop: 11, width: "72%" },
  detailTitle: { height: 29, width: "82%" },
  eyebrow: { height: 10, width: "28%" },
  hero: { borderRadius: 0, height: 300, width: "100%" },
  line: { height: 12, marginTop: 15, width: "80%" },
  list: { gap: 12, paddingHorizontal: 16, paddingVertical: 14 },
  shortLine: { height: 12, marginTop: 9, width: "56%" },
  thumbnail: { borderRadius: 14, height: 98, width: 98 },
  title: { height: 18, marginTop: 12, width: "88%" },
});
