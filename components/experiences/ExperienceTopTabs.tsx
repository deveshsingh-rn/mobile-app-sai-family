import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export type ExperienceTopTabKey = 'feed' | 'search' | 'post' | 'category' | 'bookmarks';

type ExperienceTopTabsProps = {
  activeTab: ExperienceTopTabKey;
  onTabChange?: (tab: ExperienceTopTabKey) => void;
};

const EXPERIENCE_TABS = [
  {
    href: '/(tabs)',
    key: 'feed',
    label: 'Feed',
  },
  {
    href: '/(tabs)/experiences/search',
    key: 'search',
    label: 'Search',
  },
  {
    href: '/(tabs)/experiences/post',
    key: 'post',
    label: 'Post',
  },
  {
    href: '/(tabs)/experiences/category',
    key: 'category',
    label: 'Categories',
  },
  {
    href: '/(tabs)/experiences/bookmarks',
    key: 'bookmarks',
    label: 'Bookmarks',
  },
] as const;

export function ExperienceTopTabs({ activeTab, onTabChange }: ExperienceTopTabsProps) {
  const router = useRouter();

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        {EXPERIENCE_TABS.map((tab) => {
          const isActive = activeTab === tab.key;

          return (
            <Pressable
              key={tab.key}
              onPress={() => {
                if (onTabChange) {
                  onTabChange(tab.key);
                  return;
                }

                router.push(tab.href);
              }}
              style={[styles.tab, isActive && styles.tabActive]}>
              <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderBottomColor: '#ecd9a6',
    borderBottomWidth: 1,
    marginHorizontal: -22,
    marginBottom: 20,
  },
  content: {
    gap: 10,
    paddingHorizontal: 22,
    paddingVertical: 10,
  },
  tab: {
    alignItems: 'center',
    borderRadius: 8,
    minWidth: 88,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  tabActive: {
    backgroundColor: '#8e5d10',
  },
  label: {
    color: '#79571b',
    fontSize: 14,
    fontWeight: '800',
  },
  labelActive: {
    color: '#fffaf0',
  },
});
