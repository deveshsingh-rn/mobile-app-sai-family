import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Bell, ChevronRight, Languages, LogOut, Moon, Star, UserRound } from 'lucide-react-native';

import { selectDevoteeAccount } from '@/store/devotee-account/selectors';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logoutRequest } from '@/store/devotee-account/actions';

type ProfileTab = 'details' | 'settings';

type DetailRowProps = {
  label: string;
  value?: string | null;
};

type SettingRowProps = {
  description: string;
  icon: React.ReactNode;
  title: string;
  onPress?: () => void;
  hideComingSoon?: boolean;
  isDestructive?: boolean;
};

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState<ProfileTab>('details');
  const dispatch = useAppDispatch();
  const account = useAppSelector(selectDevoteeAccount);
  const profileImageUri = account?.profileImage?.uri || account?.profileImageUrl;

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            dispatch(logoutRequest());
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>SAI FAMILY</Text>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.segment}>
        <SegmentButton
          isActive={activeTab === 'details'}
          label="Profile Detail"
          onPress={() => setActiveTab('details')}
        />
        <SegmentButton
          isActive={activeTab === 'settings'}
          label="App Settings"
          onPress={() => setActiveTab('settings')}
        />
      </View>

      {activeTab === 'details' ? (
        <View style={styles.section}>
          <View style={styles.profileSummary}>
            {profileImageUri ? (
              <Image source={{ uri: profileImageUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarFallback}>
                <UserRound size={34} color="#8e5d10" />
              </View>
            )}

            <View style={styles.summaryText}>
              <Text style={styles.name}>{account?.name || 'Devotee Profile'}</Text>
              <Text style={styles.memberId}>{account?.memberId || 'Create account to get your ID'}</Text>
            </View>
          </View>

          <View style={styles.scoreBox}>
            <View style={styles.scoreIcon}>
              <Star size={20} color="#8e5d10" fill="#f5c45b" />
            </View>
            <View style={styles.scoreTextWrap}>
              <Text style={styles.scoreTitle}>Devotion Score</Text>
              <Text style={styles.scoreDescription}>Future feature for seva, activity, and participation points.</Text>
            </View>
          </View>

          <View style={styles.detailCard}>
            <DetailRow label="Mobile" value={account?.mobileNumber} />
            <DetailRow label="Email" value={account?.email} />
            <DetailRow label="Occupation" value={account?.occupation} />
            <DetailRow label="Address" value={account?.completeAddress} />
            <DetailRow label="City" value={account?.city} />
            <DetailRow label="State" value={account?.state} />
            <DetailRow label="Country" value={account?.country} />
            <DetailRow label="Pincode" value={account?.pincode} />
            <DetailRow label="Language" value={account?.language?.toUpperCase()} />
          </View>
        </View>
      ) : (
        <View style={styles.section}>
          <SettingRow
            description="Manage prayer, event, and family update alerts."
            icon={<Bell size={22} color="#8e5d10" />}
            title="Notifications"
            onPress={() => console.log('Open Notifications Setting')}
          />
          <SettingRow
            description="Choose light, dark, or system theme."
            icon={<Moon size={22} color="#8e5d10" />}
            title="Appearance"
            onPress={() => console.log('Open Appearance Setting')}
          />
          <SettingRow
            description="Choose your preferred app language."
            icon={<Languages size={22} color="#8e5d10" />}
            title="Language"
            onPress={() => console.log('Open Language Setting')}
          />
          <SettingRow
            description="Log out of your devotee account."
            icon={<LogOut size={22} color="#dc2626" />}
            title="Log Out"
            onPress={handleLogout}
            hideComingSoon
            isDestructive
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
    <Pressable onPress={onPress} style={[styles.segmentButton, isActive && styles.segmentButtonActive]}>
      <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>{label}</Text>
    </Pressable>
  );
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || 'Not added'}</Text>
    </View>
  );
}

function SettingRow({ description, icon, title, onPress, hideComingSoon, isDestructive }: SettingRowProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.settingRow, pressed && styles.rowPressed]}>
      <View style={[styles.settingIcon, isDestructive && styles.settingIconDestructive]}>{icon}</View>
      <View style={styles.settingCopy}>
        <Text style={[styles.settingTitle, isDestructive && styles.settingTitleDestructive]}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      {!hideComingSoon && (
        <View style={styles.comingSoon}>
          <Text style={styles.comingSoonText}>Soon</Text>
        </View>
      )}
      <ChevronRight size={18} color={isDestructive ? "#dc2626" : "#a78a55"} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fffaf0',
    flex: 1,
  },
  content: {
    paddingBottom: 120,
    paddingHorizontal: 22,
    paddingTop: 58,
  },
  header: {
    marginBottom: 22,
  },
  eyebrow: {
    color: '#8e5d10',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 3,
    marginBottom: 10,
  },
  title: {
    color: '#4e3309',
    fontSize: 34,
    fontWeight: '800',
  },
  segment: {
    backgroundColor: '#f6e7bd',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 6,
    marginBottom: 22,
    padding: 5,
  },
  segmentButton: {
    alignItems: 'center',
    borderRadius: 7,
    flex: 1,
    height: 44,
    justifyContent: 'center',
  },
  segmentButtonActive: {
    backgroundColor: '#8e5d10',
  },
  segmentText: {
    color: '#79571b',
    fontSize: 14,
    fontWeight: '800',
  },
  segmentTextActive: {
    color: '#fffaf0',
  },
  section: {
    gap: 16,
  },
  profileSummary: {
    alignItems: 'center',
    backgroundColor: '#fffdf8',
    borderColor: '#e5c878',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 14,
    padding: 16,
  },
  avatar: {
    borderColor: '#d9bd7a',
    borderRadius: 35,
    borderWidth: 2,
    height: 70,
    width: 70,
  },
  avatarFallback: {
    alignItems: 'center',
    backgroundColor: '#f5e4b8',
    borderRadius: 35,
    height: 70,
    justifyContent: 'center',
    width: 70,
  },
  summaryText: {
    flex: 1,
  },
  name: {
    color: '#4e3309',
    fontSize: 21,
    fontWeight: '800',
  },
  memberId: {
    color: '#8e5d10',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 5,
  },
  scoreBox: {
    alignItems: 'center',
    backgroundColor: '#fff4d5',
    borderColor: '#ead08a',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 15,
  },
  scoreIcon: {
    alignItems: 'center',
    backgroundColor: '#ffe5a6',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  scoreTextWrap: {
    flex: 1,
  },
  scoreTitle: {
    color: '#4e3309',
    fontSize: 16,
    fontWeight: '800',
  },
  scoreDescription: {
    color: '#79571b',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
    marginTop: 3,
  },
  detailCard: {
    backgroundColor: '#fffdf8',
    borderColor: '#e5c878',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  detailRow: {
    borderBottomColor: '#f0dfad',
    borderBottomWidth: 1,
    gap: 4,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  detailLabel: {
    color: '#8e5d10',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  detailValue: {
    color: '#3f2b0c',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 21,
  },
  settingRow: {
    alignItems: 'center',
    backgroundColor: '#fffdf8',
    borderColor: '#e5c878',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 15,
  },
  rowPressed: {
    opacity: 0.82,
  },
  settingIcon: {
    alignItems: 'center',
    backgroundColor: '#fff4d5',
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  settingIconDestructive: {
    backgroundColor: '#fee2e2',
  },
  settingCopy: {
    flex: 1,
  },
  settingTitle: {
    color: '#4e3309',
    fontSize: 16,
    fontWeight: '800',
  },
  settingTitleDestructive: {
    color: '#dc2626',
  },
  settingDescription: {
    color: '#79571b',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 19,
    marginTop: 3,
  },
  comingSoon: {
    backgroundColor: '#f6e7bd',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  comingSoonText: {
    color: '#8e5d10',
    fontSize: 11,
    fontWeight: '800',
  },
});
