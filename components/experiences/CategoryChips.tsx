import {
  BookHeart,
  Eye,
  Grid2X2,
  HandHeart,
  MoonStar,
  Sparkles,
  SunMedium,
  type LucideIcon,
} from "lucide-react-native";
import React from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export type ExperienceCategory = {
  label: string;
  value: string;
};

type CategoryChipsProps = {
  activeValue?: string;
  categories: ExperienceCategory[];
  onChange?: (value: string) => void;
};

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  all: Grid2X2,
  blessings: SunMedium,
  darshan: Eye,
  dreams: MoonStar,
  first: BookHeart,
  miracles: Sparkles,
  prayers: HandHeart,
};

export function CategoryChips({
  activeValue,
  categories,
  onChange,
}: CategoryChipsProps) {
  return (
    <ScrollView
      accessibilityRole="tablist"
      alwaysBounceHorizontal={false}
      bounces={false}
      contentContainerStyle={styles.container}
      horizontal
      keyboardShouldPersistTaps="handled"
      showsHorizontalScrollIndicator={false}
    >
      {categories.map((category) => {
        const isActive = activeValue === category.value;
        const CategoryIcon = CATEGORY_ICONS[category.value] ?? Sparkles;

        return (
          <Pressable
            accessibilityLabel={`${category.label} category`}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            hitSlop={{ bottom: 4, top: 4 }}
            key={category.value}
            onPress={() => onChange?.(category.value)}
            style={({ pressed }) => [
              styles.chip,
              isActive ? styles.activeChip : styles.inactiveChip,
              pressed && styles.pressed,
            ]}
          >
            <CategoryIcon
              color={isActive ? "#9A3412" : "#A34A0A"}
              size={17}
              strokeWidth={isActive ? 2.35 : 2}
            />
            <Text
              numberOfLines={1}
              style={[styles.label, isActive ? styles.activeText : styles.inactiveText]}
            >
              {category.label}
            </Text>
            {isActive ? <View style={styles.activeAccent} /> : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
  chip: {
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    color: "#44403C",
    gap: 7,
    height: 44,
    justifyContent: "center",
    minWidth: 74,
    overflow: "hidden",
    paddingHorizontal: 14,
    position: "relative",
  },
  activeChip: {
    backgroundColor: "#FFF4E8",
    borderColor: "#FED7AA",
    shadowColor: "#1C1917",
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 6,
    elevation: 3,
  },
  inactiveChip: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E7DED2",
  },
  label: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0,
  },
  activeText: {
    color: "#9A3412",
  },
  inactiveText: {
    color: "#44403C",
  },
  activeAccent: {
    backgroundColor: "#F59E0B",
    bottom: 0,
    height: 3,
    left: 14,
    position: "absolute",
    right: 14,
  },
});
