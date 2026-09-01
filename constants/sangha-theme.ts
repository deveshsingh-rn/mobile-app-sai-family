import { Platform } from "react-native";

export const SanghaColors = {
  background: "#FAFAF7",
  surface: "#FFFFFF",
  surfaceMuted: "#F7F5F2",
  ink: "#1C1917",
  inkSecondary: "#57534E",
  inkTertiary: "#8A817A",
  border: "#EDE7DE",
  saffron: "#C2410C",
  saffronPressed: "#9A3412",
  saffronSoft: "#FFF4E8",
  saffronBorder: "#FED7AA",
  maroon: "#2B1308",
  success: "#15803D",
  successSoft: "#ECFDF3",
  info: "#1D4ED8",
  infoSoft: "#EFF6FF",
  danger: "#B42318",
  dangerSoft: "#FEF3F2",
} as const;

export const SanghaRadius = {
  control: 14,
  card: 18,
  panel: 20,
  round: 999,
} as const;

export const SanghaSpace = {
  page: 18,
  section: 24,
  card: 16,
  compact: 10,
} as const;

export const SanghaShadow = Platform.select({
  ios: {
    shadowColor: "#431407",
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 14,
  },
  android: {
    elevation: 2,
  },
  default: {},
});

export const SanghaType = {
  pageTitle: {
    fontSize: 24,
    fontWeight: "800" as const,
    letterSpacing: 0,
    lineHeight: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800" as const,
    letterSpacing: 0,
    lineHeight: 26,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "800" as const,
    letterSpacing: 0,
    lineHeight: 22,
  },
  body: {
    fontSize: 15,
    fontWeight: "500" as const,
    letterSpacing: 0,
    lineHeight: 22,
  },
  caption: {
    fontSize: 13,
    fontWeight: "600" as const,
    letterSpacing: 0,
    lineHeight: 18,
  },
} as const;
