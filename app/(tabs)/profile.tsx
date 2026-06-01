import { useMemo, useState } from "react";
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  Bell,
  ChevronRight,
  Languages,
  LogOut,
  Moon,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react-native";

import { removeDevoteeAccountStorage } from "@/services/devotee-account";
import { logoutRequest } from "@/store/devotee-account/actions";
import { selectDevoteeAccount } from "@/store/devotee-account/selectors";
import {
  useAppDispatch,
  useAppSelector,
} from "@/store/hooks";

type ProfileTab = "details" | "settings";

type DetailRowProps = {
  label: string;
  value?: string | null;
};

type SettingRowProps = {
  description: string;
  hideComingSoon?: boolean;
  icon: React.ReactNode;
  isDestructive?: boolean;
  onPress?: () => void;
  title: string;
};

const fallbackStats = [
  {
    label: "Seva Score",
    value: "Soon",
  },
  {
    label: "Events",
    value: "0",
  },
  {
    label: "Family ID",
    value: "Active",
  },
];

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<ProfileTab>("details");
  const dispatch = useAppDispatch();
  const account = useAppSelector(selectDevoteeAccount);
  const profileImageUri =
    account?.profileImage?.uri ||
    account?.profileImageUrl ||
    account?.profile?.profileImageUrl;

  const initials = useMemo(() => {
    const name = account?.name || "Devotee";

    return name
      .split(" ")
      .map((part) => part.charAt(0))
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [account?.name]);

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out of your account?",
      [
        {
          style: "cancel",
          text: "Cancel",
        },
        {
          onPress: async () => {
            await removeDevoteeAccountStorage();
            dispatch(logoutRequest());
          },
          style: "destructive",
          text: "Log Out",
        },
      ]
    );
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      style={styles.container}
    >
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Sai Family</Text>
          <Text style={styles.title}>Profile</Text>
        </View>

        <View style={styles.headerBadge}>
          <ShieldCheck color="#1F2937" size={20} />
        </View>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroTop}>
          {profileImageUri ? (
            <Image source={{ uri: profileImageUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarFallback}>
              <Text style={styles.avatarInitials}>{initials}</Text>
            </View>
          )}

          <View style={styles.summaryText}>
            <View style={styles.nameRow}>
              <Text numberOfLines={1} style={styles.name}>
                {account?.name || "Devotee Profile"}
              </Text>
              <View style={styles.verifiedBadge}>
                <Sparkles color="#F97316" size={13} />
              </View>
            </View>
            <Text style={styles.memberId}>
              {account?.memberId || "Create account to get your ID"}
            </Text>
            <Text numberOfLines={1} style={styles.location}>
              {account?.location ||
                account?.profile?.city ||
                account?.city ||
                "Sai Family member"}
            </Text>
          </View>
        </View>

        <View style={styles.statGrid}>
          {fallbackStats.map((item) => (
            <View key={item.label} style={styles.statBox}>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.segment}>
        <SegmentButton
          isActive={activeTab === "details"}
          label="Profile Detail"
          onPress={() => setActiveTab("details")}
        />
        <SegmentButton
          isActive={activeTab === "settings"}
          label="App Settings"
          onPress={() => setActiveTab("settings")}
        />
      </View>

      {activeTab === "details" ? (
        <View style={styles.section}>
          <View style={styles.scoreBox}>
            <View style={styles.scoreIcon}>
              <Star size={20} color="#F97316" fill="#FDBA74" />
            </View>
            <View style={styles.scoreTextWrap}>
              <Text style={styles.scoreTitle}>Devotion Score</Text>
              <Text style={styles.scoreDescription}>
                Future feature for seva, activity, and participation points.
              </Text>
            </View>
            <ChevronRight color="#A8A29E" size={18} />
          </View>

          <View style={styles.detailCard}>
            <DetailRow label="Mobile" value={account?.mobileNumber} />
            <DetailRow label="Email" value={account?.email} />
            <DetailRow
              label="Occupation"
              value={account?.profile?.occupation || account?.occupation}
            />
            <DetailRow
              label="Address"
              value={
                account?.profile?.completeAddress ||
                account?.completeAddress
              }
            />
            <DetailRow
              label="City"
              value={account?.profile?.city || account?.city}
            />
            <DetailRow
              label="State"
              value={account?.profile?.state || account?.state}
            />
            <DetailRow
              label="Country"
              value={account?.profile?.country || account?.country}
            />
            <DetailRow
              label="Pincode"
              value={account?.profile?.pincode || account?.pincode}
            />
            <DetailRow
              label="Language"
              value={(
                account?.profile?.language ||
                account?.language
              )?.toUpperCase()}
            />
          </View>
        </View>
      ) : (
        <View style={styles.section}>
          <SettingRow
            description="Manage prayer, event, and family update alerts."
            icon={<Bell size={21} color="#1F2937" />}
            onPress={() => console.log("Open Notifications Setting")}
            title="Notifications"
          />
          <SettingRow
            description="Choose light, dark, or system theme."
            icon={<Moon size={21} color="#1F2937" />}
            onPress={() => console.log("Open Appearance Setting")}
            title="Appearance"
          />
          <SettingRow
            description="Choose your preferred app language."
            icon={<Languages size={21} color="#1F2937" />}
            onPress={() => console.log("Open Language Setting")}
            title="Language"
          />
          <SettingRow
            description="Log out of your devotee account."
            hideComingSoon
            icon={<LogOut size={21} color="#DC2626" />}
            isDestructive
            onPress={handleLogout}
            title="Log Out"
          />
        </View>
      )}
    </ScrollView>
  );
}

function SegmentButton({
  isActive,
  label,
  onPress,
}: {
  isActive: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.segmentButton,
        isActive && styles.segmentButtonActive,
      ]}
    >
      <Text
        style={[
          styles.segmentText,
          isActive && styles.segmentTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || "Not added"}</Text>
    </View>
  );
}

function SettingRow({
  description,
  hideComingSoon,
  icon,
  isDestructive,
  onPress,
  title,
}: SettingRowProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.settingRow,
        pressed && styles.rowPressed,
      ]}
    >
      <View
        style={[
          styles.settingIcon,
          isDestructive && styles.settingIconDestructive,
        ]}
      >
        {icon}
      </View>
      <View style={styles.settingCopy}>
        <Text
          style={[
            styles.settingTitle,
            isDestructive && styles.settingTitleDestructive,
          ]}
        >
          {title}
        </Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      {!hideComingSoon && (
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonText}>Soon</Text>
        </View>
      )}
      <ChevronRight
        color={isDestructive ? "#DC2626" : "#A8A29E"}
        size={18}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatar: {
    borderColor: "#FFFFFF",
    borderRadius: 38,
    borderWidth: 3,
    height: 76,
    width: 76,
  },
  avatarFallback: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderRadius: 38,
    borderWidth: 1,
    height: 76,
    justifyContent: "center",
    width: 76,
  },
  avatarInitials: {
    color: "#C2410C",
    fontSize: 24,
    fontWeight: "900",
  },
  comingSoon: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  comingSoonText: {
    color: "#C2410C",
    fontSize: 11,
    fontWeight: "900",
  },
  container: {
    backgroundColor: "#FAFAF9",
    flex: 1,
  },
  content: {
    paddingBottom: 120,
    paddingHorizontal: 16,
    paddingTop: 58,
  },
  detailCard: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E7D7BE",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  detailLabel: {
    color: "#F97316",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  detailRow: {
    borderBottomColor: "#F1E4CE",
    borderBottomWidth: 1,
    gap: 5,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  detailValue: {
    color: "#1F2937",
    fontSize: 15,
    fontWeight: "700",
    lineHeight: 21,
  },
  eyebrow: {
    color: "#F97316",
    fontSize: 12,
    fontWeight: "900",
  },
  header: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerBadge: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E7D7BE",
    borderRadius: 12,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  heroCard: {
    backgroundColor: "#1F2937",
    borderRadius: 18,
    marginBottom: 16,
    padding: 16,
  },
  heroTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: 14,
  },
  location: {
    color: "#D6D3D1",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 5,
  },
  memberId: {
    color: "#FDBA74",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 4,
  },
  name: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 22,
    fontWeight: "900",
  },
  nameRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  rowPressed: {
    opacity: 0.84,
  },
  scoreBox: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 15,
  },
  scoreDescription: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    marginTop: 3,
  },
  scoreIcon: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#FED7AA",
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  scoreTextWrap: {
    flex: 1,
  },
  scoreTitle: {
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "900",
  },
  section: {
    gap: 14,
  },
  segment: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E7D7BE",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    marginBottom: 16,
    padding: 5,
  },
  segmentButton: {
    alignItems: "center",
    borderRadius: 10,
    flex: 1,
    height: 42,
    justifyContent: "center",
  },
  segmentButtonActive: {
    backgroundColor: "#F97316",
  },
  segmentText: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "900",
  },
  segmentTextActive: {
    color: "#FFFFFF",
  },
  settingCopy: {
    flex: 1,
  },
  settingDescription: {
    color: "#6B7280",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    marginTop: 3,
  },
  settingIcon: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderColor: "#FED7AA",
    borderRadius: 12,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  settingIconDestructive: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  settingRow: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderColor: "#E7D7BE",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    padding: 14,
  },
  settingTitle: {
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "900",
  },
  settingTitleDestructive: {
    color: "#DC2626",
  },
  statBox: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.14)",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 10,
  },
  statGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  statLabel: {
    color: "#D6D3D1",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 3,
  },
  statValue: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "900",
  },
  summaryText: {
    flex: 1,
  },
  title: {
    color: "#1F2937",
    fontSize: 34,
    fontWeight: "900",
  },
  verifiedBadge: {
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    borderRadius: 999,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
});
