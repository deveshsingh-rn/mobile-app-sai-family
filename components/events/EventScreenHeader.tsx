import { ArrowLeft } from "lucide-react-native";
import { MotiView } from "moti";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type EventScreenHeaderProps = {
  onBack: () => void;
  onRightPress?: () => void;
  rightAccessibilityLabel?: string;
  rightIcon?: ReactNode;
  subtitle?: string;
  title: string;
};

export function EventScreenHeader({
  onBack,
  onRightPress,
  rightAccessibilityLabel,
  rightIcon,
  subtitle,
  title,
}: EventScreenHeaderProps) {
  const insets = useSafeAreaInsets();

  return (
    <MotiView
      animate={{ opacity: 1, translateY: 0 }}
      from={{ opacity: 0, translateY: -8 }}
      style={[styles.header, { paddingTop: insets.top + 6 }]}
      transition={{ duration: 260, type: "timing" }}
    >
      <Pressable
        accessibilityLabel="Go back"
        accessibilityRole="button"
        hitSlop={8}
        onPress={onBack}
        style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
      >
        <ArrowLeft color="#292524" size={23} strokeWidth={2.2} />
      </Pressable>

      <View style={styles.copy}>
        <Text
          adjustsFontSizeToFit
          minimumFontScale={0.82}
          numberOfLines={1}
          style={styles.title}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      {rightIcon && onRightPress ? (
        <Pressable
          accessibilityLabel={rightAccessibilityLabel || "Header action"}
          accessibilityRole="button"
          hitSlop={8}
          onPress={onRightPress}
          style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
        >
          {rightIcon}
        </Pressable>
      ) : (
        <View style={styles.iconSpacer} />
      )}
    </MotiView>
  );
}

const styles = StyleSheet.create({
  copy: {
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 12,
  },
  header: {
    alignItems: "center",
    backgroundColor: "rgba(255,252,248,0.98)",
    borderBottomColor: "#F1E4D5",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    minHeight: 64,
    paddingBottom: 10,
    paddingHorizontal: 16,
    shadowColor: "#5B2C0B",
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    zIndex: 20,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: "#FFF4E8",
    borderColor: "#FED7AA",
    borderCurve: "continuous",
    borderRadius: 15,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  iconSpacer: { height: 44, width: 44 },
  pressed: { opacity: 0.72, transform: [{ scale: 0.96 }] },
  subtitle: {
    color: "#78716C",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
  title: {
    color: "#292524",
    fontSize: 19,
    fontWeight: "900",
  },
});
