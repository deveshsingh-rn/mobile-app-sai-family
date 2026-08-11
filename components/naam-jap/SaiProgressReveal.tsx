import { MotiView } from "moti";
import { Image, ImageSourcePropType, StyleSheet, Text, View } from "react-native";

type Props = {
  image: ImageSourcePropType;
  progress: number;
};

const IMAGE_HEIGHT = 270;

export function SaiProgressReveal({ image, progress }: Props) {
  const safeProgress = Math.min(1, Math.max(0, progress));

  return (
    <View style={styles.wrap}>
      <View style={styles.imageFrame}>
        <Image blurRadius={18} resizeMode="cover" source={image} style={styles.image} />
        <MotiView
          animate={{ height: `${safeProgress * 100}%` }}
          pointerEvents="none"
          style={styles.clearReveal}
          transition={{ damping: 20, stiffness: 110, type: "spring" }}
        >
          <Image resizeMode="cover" source={image} style={styles.clearImage} />
        </MotiView>
        <View pointerEvents="none" style={styles.imageEdge} />
      </View>
      <Text style={styles.caption}>
        {safeProgress >= 1
          ? "Sai’s blessing is complete"
          : `${Math.round(safeProgress * 100)}% of today’s blessing revealed`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center" },
  imageFrame: {
    backgroundColor: "#E8ECE9",
    borderColor: "rgba(255,255,255,0.8)",
    borderRadius: 22,
    borderWidth: 1,
    height: IMAGE_HEIGHT,
    overflow: "hidden",
    position: "relative",
    width: 150,
  },
  image: { height: "100%", width: "100%" },
  clearReveal: { bottom: 0, left: 0, overflow: "hidden", position: "absolute", width: "100%" },
  clearImage: { bottom: 0, height: IMAGE_HEIGHT, left: 0, position: "absolute", width: 150 },
  imageEdge: {
    ...StyleSheet.absoluteFillObject,
    borderColor: "rgba(255,255,255,0.38)",
    borderRadius: 22,
    borderWidth: 1,
  },
  caption: { color: "#58645E", fontSize: 10, fontWeight: "700", marginTop: 7 },
});

